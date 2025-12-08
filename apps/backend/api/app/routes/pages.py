from fastapi import APIRouter, Depends, Query, Path, status, HTTPException
from typing import Dict, Optional
from app.models.schemas import (
    PageCreate, PageUpdate, PageResponse, PaginatedPageResponse, UploadRequest
)
from app.database.dynamodb import get_dynamodb_table
from app.database.repository import PageRepository
from app.auth.dependencies import get_current_username, verify_access_token
from app.config import get_settings
import boto3

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
    token_payload: Dict = Depends(verify_access_token),
    repo: PageRepository = Depends(get_repository)
):
    result = repo.list_pages(limit=limit)
    return PaginatedPageResponse(
        pages=[PageResponse(**page) for page in result["pages"]],
        count=result["count"],
        last_evaluated_key=result.get("last_evaluated_key")
    )

@router.get(
    "/published",
    response_model=PaginatedPageResponse,
    summary="List all published pages"
)
async def list_pages(
    limit: int = Query(50, ge=1, le=100),
    repo: PageRepository = Depends(get_repository)
):
    result = repo.list_published_pages(limit=limit)
    return PaginatedPageResponse(
        pages=[PageResponse(**page) for page in result["pages"]],
        count=result["count"],
        last_evaluated_key=result.get("last_evaluated_key")
    )

@router.get(
    "/search",
    response_model=dict,
    summary="Search pages"
)
async def search_pages(
    q: Optional[str] = Query(None, description="Search term"),
    city: Optional[str] = Query(None, description="City to filter by"),
    published: Optional[bool] = Query(None, description="Published status to filter by"),
    tag: Optional[str] = Query(None, description="Tag to filter by"),
    type: Optional[str] = Query(None, description="Type to filter by"),
    limit: int = Query(50, ge=1, le=100),
    repo: PageRepository = Depends(get_repository)
):
    """Search pages by title or description"""
    pages = repo.search_pages(search_term=q, city=city, type=type, published=published, limit=limit)
    return {
        "pages": [PageResponse(**page) for page in pages]
    }

@router.get(
    "/{page_id}/{title}",
    response_model=PageResponse,
    summary="Get page by ID"
)
async def get_page(
    page_id: str = Path(..., description="Page ID"),
    title: str = Path(..., description="Page Title"),
    repo: PageRepository = Depends(get_repository),
    token_payload: Dict = Depends(verify_access_token)
):
    """Get a specific page by ID"""
    page = repo.get_page(page_id, title, authorized=token_payload)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    return PageResponse(**page)

@router.get(
    "/published/{page_id}/{title}",
    response_model=PageResponse,
    summary="Get page by ID"
)
async def get_published_page (
    page_id: str = Path(..., description="Page ID"),
    title: str = Path(..., description="Page Title"),
    repo: PageRepository = Depends(get_repository),
):
    """Get a specific published page by ID"""
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

@router.put(
    "/publish/{page_id}/{title}",
    response_model=PageResponse,
    summary="Publish an page"
)
async def publish_page(
    page_id: str = Path(..., description="Page ID"),
    title: str = Path(..., description="Page Title"),
    token_payload: Dict = Depends(verify_access_token),
    repo: PageRepository = Depends(get_repository)
):
    """Publish an existing page"""
    updated_page = repo.publish_page(page_id, title)
    if not updated_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    return PageResponse(**updated_page)

@router.delete(
    "/{page_id}/{title}",
    summary="Delete an page"
)
async def delete_page(
    page_id: str = Path(..., description="Page ID"),
    title: str = Path(..., description="Page Title"),
    token_payload: Dict = Depends(verify_access_token),
    repo: PageRepository = Depends(get_repository),
    response_model = dict
):
    """Delete an page"""
    try:
        repo.delete_page(page_id, title)
        return {"detail": "Page deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting page: {str(e)}"
        )

@router.get(
    "/count",
    response_model=dict,
    summary="Get total page count"      
)
async def get_page_count(
    repo: PageRepository = Depends(get_repository)
):
    """Get total number of pages"""
    count = repo.get_count_pages()
    return {"count": count}

@router.post("/generate-upload-url")
# Ensure you verify the user is logged in here using your existing dependency
async def generate_upload_url(req: UploadRequest, 
                              token_payload = Depends(verify_access_token)): 
    settings = get_settings()
    s3_client = boto3.client("s3", region_name=settings.aws_region)
    BUCKET_NAME = settings.s3_bucket_name
    object_name = f"images/{req.file_name}"
    
    try:
        # Generate the Presigned URL
        url = s3_client.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': object_name,
                'ContentType': req.content_type
            },
            ExpiresIn=300 # URL valid for 5 minutes
        )
        return {"upload_url": url, "final_file_url": f"https://{BUCKET_NAME}.s3.amazonaws.com/{object_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))