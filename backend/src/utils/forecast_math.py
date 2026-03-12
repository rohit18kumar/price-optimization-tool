"""
Linear regression by category using scikit-learn.
All in memory; no DB storage for coefficients.
"""
from collections import defaultdict
from typing import Dict, List, Tuple

import numpy as np
from sklearn.linear_model import LinearRegression


def _regression_per_category(products: List[dict]) -> Dict[str, Tuple[float, float]]:
    """Group by category and compute (a, b) per category using sklearn."""
    by_cat = defaultdict(list)
    for p in products:
        price = float(p["selling_price"])
        demand = int(p["units_sold"]) if p.get("units_sold") is not None else 0
        by_cat[p["category"]].append((price, demand))

    result = {}
    for category, pairs in by_cat.items():
        if len(pairs) == 1:
            price, demand = pairs[0]
            a = demand * 2.0
            b = demand / (price * 2.0) if price else 0.0
            result[category] = (a, b)
            continue

        X = np.array([x[0] for x in pairs]).reshape(-1, 1)
        y = np.array([x[1] for x in pairs])
        prices = X.flatten()
        demands = y

        # Check constant price (zero variance)
        if np.ptp(prices) == 0:
            price, demand = pairs[0]
            a = demand * 2.0
            b = demand / (price * 2.0) if price else 0.0
            result[category] = (a, b)
            continue

        model = LinearRegression().fit(X, y)
        intercept = float(model.intercept_)
        coef = float(model.coef_[0])
        # We want demand = a - b * price (demand decreases as price increases)
        # Model gives demand = intercept + coef * price
        # So a - b*price = intercept + coef*price  =>  a = intercept, b = -coef
        b = -coef
        if b < 0:
            b = abs(b)
            price_mean = float(np.mean(prices))
            demand_mean = float(np.mean(demands))
            a = demand_mean + b * price_mean
        else:
            a = intercept
        result[category] = (a, b)
    return result


def compute_demand_forecasts(products: List[dict]) -> List[Tuple[int, int]]:
    """
    Returns list of (product_id, demand_forecast) for each product.
    """
    coeffs = _regression_per_category(products)
    out = []
    for p in products:
        cat = p["category"]
        a, b = coeffs[cat]
        price = float(p["selling_price"])
        forecast = max(0, round(a - b * price))
        out.append((p["product_id"], forecast))
    return out


def compute_optimized_price_and_metrics(
    product: dict, a: float, b: float
) -> dict:
    """
    For one product, compute optimized_price and display metrics.
    Returns dict with optimized_price, expected_demand, expected_revenue,
    expected_profit, price_change_pct. Only optimized_price is persisted.
    """
    cost = float(product["cost_price"])
    selling = float(product["selling_price"])
    p_min_margin = round(cost * 1.20, 2)

    if b == 0:
        opt = p_min_margin
    else:
        p_optimal = (a + b * cost) / (2 * b)
        opt = max(p_optimal, p_min_margin)
        opt = round(opt, 2)

    expected_demand = max(0, a - b * opt)
    if expected_demand <= 0:
        opt = p_min_margin
        expected_demand = max(0, a - b * opt)

    if opt > selling * 3:
        opt = round(selling * 1.5, 2)
        expected_demand = max(0, a - b * opt)

    expected_revenue = round(opt * expected_demand, 2)
    expected_profit = round((opt - cost) * expected_demand, 2)
    price_change_pct = round(((opt - selling) / selling) * 100, 2) if selling else 0.0

    return {
        "optimized_price": opt,
        "expected_demand": int(expected_demand),
        "expected_revenue": expected_revenue,
        "expected_profit": expected_profit,
        "price_change_pct": price_change_pct,
    }


def get_regression_line_points(a: float, b: float, price_min: float, price_max: float, num_points: int = 20) -> List[dict]:
    """Return points for drawing regression line: demand = a - b * price."""
    if price_min >= price_max:
        price_min = max(0, price_max - 1)
    prices = np.linspace(price_min, price_max, num_points)
    demands = np.maximum(0, a - b * prices)
    return [{"price": round(float(p), 2), "demand": round(float(d), 0)} for p, d in zip(prices, demands)]
