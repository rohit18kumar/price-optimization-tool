from fastapi import APIRouter, Depends, Query
from typing import Optional
from core.database import get_db
from core.security import verify_token, RoleChecker
from utils import forecast_db

router = APIRouter()

@router.post("/calculate")
async def calculate_optimization(
    conn=Depends(get_db),
    current_user=Depends(RoleChecker(["admin"])),
):
    result = await forecast_db.run_optimization_calculation(conn)
    return result

@router.get("/results")
async def get_optimization_results(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    conn=Depends(get_db),
    current_user=Depends(verify_token),
):
    result = await forecast_db.get_optimization_results(
        conn, category=category, search=search
    )
    return result
