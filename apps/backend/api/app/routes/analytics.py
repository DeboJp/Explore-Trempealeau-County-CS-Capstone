from fastapi import APIRouter, Depends, Query, Path, status, HTTPException
from typing import Dict, Optional
from app.models.schemas import (
    AnalyticsData
)
from app.database.dynamodb import get_dynamodb_table
from app.database.repository import AnalyticsRepository
from app.auth.dependencies import verify_access_token

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_repository() -> AnalyticsRepository:
    """Dependency to get repository instance"""
    table = get_dynamodb_table("Analytics")
    return AnalyticsRepository(table)

@router.get(
    "/",
    response_model=list[AnalyticsData],
    summary="Get most recent event analytics"
)
async def get_recent_events(
    limit: int = Query(100, ge=1, le=1000),
    repo: AnalyticsRepository = Depends(get_repository)
):
    """Retrieve most recent event analytics data"""
    try:
        events = repo.get_recent_events(limit=limit)
        return [AnalyticsData(**event) for event in events]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving analytics data: {str(e)}"
        )

@router.get(
    "/event",
    response_model=list[AnalyticsData],
    summary="Get analytics for a specific event"
)
async def get_event_analytics(
    event_name: str = Query(None, min_length=1, description="Name of the event"),
    event_type: str = Query(None, min_length=1, description="Type of the event"),
    limit: int = Query(100, ge=1, le=1000),
    oldest: Optional[int] = Query(None, description="Oldest timestamp to filter events"),
    group: Optional[str] = Query(None, description="Group by timeframe (e.g., hour, day)"),
    repo: AnalyticsRepository = Depends(get_repository)
):
    """Retrieve analytics data for a specific event"""
    try:
        events = repo.get_event_analytics(event_name=event_name, event_type=event_type, limit=limit, oldest=oldest, group=group)
        return [AnalyticsData(**event) for event in events]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving analytics data for event '{event_name}': {str(e)}"
        )

@router.post(
    "/log",
    status_code=status.HTTP_201_CREATED,
    summary="Log an event"
)
async def log_event(
    event: str = Query(..., min_length=1, description="Name of the event to log"),
    repo: AnalyticsRepository = Depends(get_repository)
):
    """Log an event with optional timestamp"""
    try:
        repo.log_event(event=event)
        return {"message": "Event logged successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error logging event '{event}': {str(e)}"
        )
    