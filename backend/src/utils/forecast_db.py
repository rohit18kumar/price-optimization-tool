"""DB helpers for forecast and optimization. All use existing products table only."""
from collections import defaultdict
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from models.domain import Product
from utils.forecast_math import (
    compute_demand_forecasts,
    compute_optimized_price_and_metrics,
    _regression_per_category,
    get_regression_line_points,
)

def _product_to_dict(p: Product) -> dict:
    if not p:
        return None
    return {
        "product_id": p.product_id,
        "name": p.name,
        "category": p.category,
        "cost_price": float(p.cost_price),
        "selling_price": float(p.selling_price),
        "description": p.description,
        "stock_available": p.stock_available,
        "units_sold": p.units_sold,
        "customer_rating": float(p.customer_rating) if p.customer_rating else None,
        "demand_forecast": p.demand_forecast,
        "optimized_price": float(p.optimized_price) if p.optimized_price else None,
        "created_at": p.created_at
    }

async def fetch_all_products(session: AsyncSession) -> List[dict]:
    """Fetch all products."""
    result = await session.execute(select(Product).order_by(Product.product_id))
    products = result.scalars().all()
    return [_product_to_dict(p) for p in products]

async def run_forecast_calculation(session: AsyncSession) -> dict:
    products = await fetch_all_products(session)
    if not products:
        return {"updated_products": 0, "categories_processed": 0, "calculated_at": None}

    updates = compute_demand_forecasts(products)
    for product_id, demand_forecast in updates:
        await session.execute(
            update(Product)
            .where(Product.product_id == product_id)
            .values(demand_forecast=demand_forecast)
        )
    await session.commit()

    from datetime import datetime, timezone
    categories_processed = len(set(p["category"] for p in products))
    return {
        "updated_products": len(updates),
        "categories_processed": categories_processed,
        "calculated_at": datetime.now(timezone.utc).isoformat(),
    }

async def run_optimization_calculation(session: AsyncSession) -> dict:
    products = await fetch_all_products(session)
    if not products:
        return {"calculated_at": None, "results": []}

    coeffs = _regression_per_category(products)
    from datetime import datetime, timezone
    calculated_at = datetime.now(timezone.utc).isoformat()
    results = []

    for p in products:
        cat = p["category"]
        a, b = coeffs[cat]
        metrics = compute_optimized_price_and_metrics(p, a, b)
        opt = metrics["optimized_price"]
        
        await session.execute(
            update(Product)
            .where(Product.product_id == p["product_id"])
            .values(optimized_price=opt)
        )
        
        results.append({
            "product_id": p["product_id"],
            "product_name": p["name"],
            "category": p["category"],
            "description": (p.get("description") or "")[:50] or None,
            "cost_price": float(p["cost_price"]),
            "selling_price": float(p["selling_price"]),
            "optimized_price": opt,
            "price_change_pct": metrics["price_change_pct"],
            "expected_demand": metrics["expected_demand"],
            "expected_revenue": metrics["expected_revenue"],
            "expected_profit": metrics["expected_profit"],
        })
    await session.commit()
    return {"calculated_at": calculated_at, "results": results}

async def get_optimization_results(
    session: AsyncSession, category: Optional[str] = None, search: Optional[str] = None
) -> dict:
    all_products = await fetch_all_products(session)
    if not all_products:
        return {"calculated_at": None, "results": []}

    coeffs = _regression_per_category(all_products)
    products = all_products
    if category:
        products = [p for p in products if p["category"] == category]
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in (p.get("name") or "").lower()]
        
    from datetime import datetime, timezone
    calculated_at = datetime.now(timezone.utc).isoformat()
    results = []
    
    for p in products:
        cat = p["category"]
        a, b = coeffs[cat]
        metrics = compute_optimized_price_and_metrics(p, a, b)
        results.append({
            "product_id": p["product_id"],
            "product_name": p["name"],
            "category": p["category"],
            "description": p.get("description") or None,
            "cost_price": float(p["cost_price"]),
            "selling_price": float(p["selling_price"]),
            "optimized_price": metrics["optimized_price"],
            "price_change_pct": metrics["price_change_pct"],
            "expected_demand": metrics["expected_demand"],
            "expected_revenue": metrics["expected_revenue"],
            "expected_profit": metrics["expected_profit"],
        })
    return {"calculated_at": calculated_at, "results": results}

async def get_forecast_chart_data(session: AsyncSession) -> dict:
    """Return products with selling_price, demand_forecast, and regression line points per category for charts."""
    products = await fetch_all_products(session)
    if not products:
        return {"products": [], "regression_lines": []}

    coeffs = _regression_per_category(products)
    by_cat = defaultdict(list)
    for p in products:
        by_cat[p["category"]].append(p)

    product_list = []
    for p in products:
        product_list.append({
            "product_id": p["product_id"],
            "name": p["name"],
            "category": p["category"],
            "selling_price": float(p["selling_price"]),
            "units_sold": int(p.get("units_sold") or 0),
            "demand_forecast": int(p.get("demand_forecast") or 0),
        })

    regression_lines = []
    for category, cat_products in by_cat.items():
        a, b = coeffs[category]
        prices = [float(p["selling_price"]) for p in cat_products]
        price_min = min(prices)
        price_max = max(prices)
        if price_min == price_max:
            price_min = max(0, price_max - 1)
        points = get_regression_line_points(a, b, price_min, price_max)
        regression_lines.append({"category": category, "points": points})

    return {"products": product_list, "regression_lines": regression_lines}

async def recalculate_category(session: AsyncSession, category: str) -> None:
    """After a product in this category is updated, recalc demand_forecast and optimized_price for all in category."""
    products = await fetch_all_products(session)
    products = [p for p in products if p["category"] == category]
    if not products:
        return

    updates_df = compute_demand_forecasts(products)
    coeffs = _regression_per_category(products)
    
    for p in products:
        pid = p["product_id"]
        df_row = next((u for u in updates_df if u[0] == pid), None)
        
        stmt = update(Product).where(Product.product_id == pid)
        values = {}
        
        if df_row:
            _, demand_forecast = df_row
            values["demand_forecast"] = demand_forecast
            
        a, b = coeffs[p["category"]]
        metrics = compute_optimized_price_and_metrics(p, a, b)
        values["optimized_price"] = metrics["optimized_price"]
        
        if values:
            await session.execute(stmt.values(**values))
            
    await session.commit()
