from fastapi import APIRouter, Depends, Query, Path, status, HTTPException
from typing import Dict, Optional
from app.models.schemas import (
    PageCreate, PageUpdate, PageResponse, PaginatedPageResponse
)
from app.database.dynamodb import get_dynamodb_table
from app.database.repository import PageRepository
from app.auth.dependencies import get_current_username, verify_access_token

router = APIRouter(prefix="/pages", tags=["pages"])

def get_repository() -> PageRepository:
    """Dependency to get repository instance"""
    table = get_dynamodb_table("AppPages")
    return PageRepository(table)

@router.post(
    "/",
    response_model=PageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new page"
)
async def create_page(
    page: PageCreate,
    token_payload: Dict = Depends(verify_access_token),
    repo: PageRepository = Depends(get_repository)
):
    """Create a new page for the authenticated user"""
    created_page = repo.create_page(page.model_dump())
    return PageResponse(**created_page)

@router.get(
    "/",
    response_model=PaginatedPageResponse,
    summary="List all user pages"
)
async def list_pages(
    limit: int = Query(50, ge=1, le=100),
    repo: PageRepository = Depends(get_repository)
):
    """Get all pages for the authenticated user with pagination"""
    result = repo.list_pages(limit=limit)
    return PaginatedPageResponse(
        pages=[PageResponse(**page) for page in result["pages"]],
        count=result["count"],
        last_evaluated_key=result.get("last_evaluated_key")
    )

@router.get(
    "/search",
    response_model=list[PageResponse],
    summary="Search pages"
)
async def search_pages(
    q: str = Query(..., min_length=1, description="Search term"),
    limit: int = Query(50, ge=1, le=100),
    repo: PageRepository = Depends(get_repository)
):
    """Search pages by title or description"""
    pages = repo.search_pages(q, limit=limit)
    return [PageResponse(**page) for page in pages]

@router.get(
    "/{page_id}/{title}",
    response_model=PageResponse,
    summary="Get page by ID"
)
async def get_page(
    page_id: str = Path(..., description="Page ID"),
    title: str = Path(..., description="Page Title"),
    repo: PageRepository = Depends(get_repository)
):
    """Get a specific page by ID"""
    page = repo.get_page(page_id, title)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    return PageResponse(**page)

@router.put(
    "/{page_id}/{title}",
    response_model=PageResponse,
    summary="Update an page"
)
async def update_page(
    page_id: str = Path(..., description="Page ID"),
    title: str = Path(..., description="Page Title"),
    updates: PageUpdate = ...,
    token_payload: Dict = Depends(verify_access_token),
    repo: PageRepository = Depends(get_repository)
):
    """Update an existing page"""
    print(updates)
    updated_page = repo.update_page(
        page_id,
        title,
        updates.model_dump(exclude_unset=True)
    )
    if not updated_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    return PageResponse(**updated_page)

@router.delete(
    "/{page_id}/{title}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an page"
)
async def delete_page(
    page_id: str = Path(..., description="Page ID"),
    title: str = Path(..., description="Page Title"),
    token_payload: Dict = Depends(verify_access_token),
    repo: PageRepository = Depends(get_repository)
):
    """Delete an page"""
    repo.delete_page(page_id, title)
    return None