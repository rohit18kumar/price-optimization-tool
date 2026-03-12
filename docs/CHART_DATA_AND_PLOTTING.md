# How Demand Forecast Charts Are Plotted

This document explains **what data** is used, **where it comes from**, and **how** the two charts are drawn.

---

## 1. Where the data comes from

- **API:** `GET /api/v1/forecast/chart-data` (requires auth).
- **Backend:** Fetches all products from the `products` table, runs **linear regression per category** (scikit-learn) on `(selling_price, units_sold)`, then builds the payload below. No extra tables; regression is computed in memory.

---

## 2. Data shape returned by the API

The response is a single JSON object:

```json
{
  "products": [
    {
      "product_id": 1,
      "name": "Geo - Note Pad",
      "category": "Stationary",
      "selling_price": 2.7,
      "units_sold": 131244,
      "demand_forecast": 2500
    }
  ],
  "regression_lines": [
    {
      "category": "Stationary",
      "points": [
        { "price": 0.5, "demand": 18000 },
        { "price": 1.0, "demand": 15000 },
        { "price": 2.0, "demand": 9000 }
      ]
    }
  ]
}
```

- **`products`**  
  One object per product with:
  - `product_id`, `name`, `category`
  - `selling_price`, `units_sold` (from DB)
  - `demand_forecast` (from regression: `a - b * selling_price`, rounded and ≥ 0)

- **`regression_lines`**  
  One object per category with:
  - `category`: name of the category
  - `points`: array of `{ price, demand }` along the regression line (demand = a − b×price) over the price range of that category. Used only for drawing the line on the second chart.

---

## 3. What gets passed to Chart.js

### Chart 1 – Bar chart (Demand forecast by product)

- **Data passed to Chart.js:**
  - **Labels (X):** `products[].name` (truncated to 20 chars if long).
  - **Values (Y):** `products[].demand_forecast`.
- **How it’s plotted:** One bar per product; bar height = `demand_forecast`. So the chart “demand forecast for products” is exactly this: one bar per product, height = forecast.

### Chart 2 – Scatter + regression lines (Forecasted demand vs selling price)

- **Data passed to Chart.js:** Two kinds of datasets in one chart:
  1. **Scatter dataset (points):**
     - Each point = one product: `x = selling_price`, `y = demand_forecast`.
     - So we pass `products.map(p => ({ x: p.selling_price, y: p.demand_forecast, label: p.name }))`.
  2. **Line dataset(s) (one per category):**
     - Each dataset = one category from `regression_lines`.
     - Points = `regression_lines[i].points` as `{ x: price, y: demand }`.
     - Chart.js draws a line through these points = “forecasted demand vs selling price” for that category (linear regression line).
- **How it’s plotted:** Scatter = actual (selling_price, demand_forecast) per product; lines = the regression “forecasted demand vs price” per category.

---

## 4. End-to-end flow (summary)

1. User clicks **“Show demand forecast charts”** on the Products screen → frontend mounts the chart component.
2. Frontend calls **`GET /api/v1/forecast/chart-data`** → backend loads all products, runs regression per category, returns `products` + `regression_lines`.
3. **Bar chart:** uses `products[].name` and `products[].demand_forecast` (one bar per product).
4. **Scatter + lines chart:** uses `products` for scatter (selling_price, demand_forecast) and `regression_lines[].points` for each category’s line (forecasted demand vs price).
5. “Refresh chart data” simply calls the same API again and re-renders the charts with the new response.

So: **all plot data** comes from that single API response: `products` for both charts, and `regression_lines` only for the regression lines on the second chart.
