from fastapi import APIRouter, Depends
from core.database import get_db
from core.security import RoleChecker, verify_token
from utils import forecast_db

router = APIRouter()

@router.post("/calculate")
async def calculate_forecast(
    conn=Depends(get_db),
    current_user=Depends(RoleChecker(["admin"])),
):
    result = await forecast_db.run_forecast_calculation(conn)
    return result


@router.get("/chart-data")
async def get_forecast_chart_data(
    conn=Depends(get_db),
    current_user=Depends(verify_token),
):
    """Data for demand forecast bar chart and forecasted demand vs selling price scatter + regression lines."""
    return await forecast_db.get_forecast_chart_data(conn)
