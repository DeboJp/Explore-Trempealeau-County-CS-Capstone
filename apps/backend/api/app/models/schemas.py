from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class PageBase(BaseModel):
    """Base schema for Pages"""
    id: int = Field(..., ge=1, le=200)
    title: str = Field(None, max_length=1000)
    pageContent: Optional[str] = None

class PageCreate(PageBase):
    """Schema for creating Pages"""
    id: int
    title: str
    city: Optional[str] = None
    type: Optional[str] = None
    pageContent: Optional[str] = None

class PageUpdate(BaseModel):
    """Schema for updating Pages - all fields optional"""
    id: int = Field(None, ge=1, le=200)
    title: str = Field(None, min_length=1, max_length=200)
    city: Optional[str] = None
    type: Optional[str] = None
    pageContent: Optional[str] = None
    published: Optional[bool] = None
    published_at: Optional[datetime] = None

class PageResponse(PageBase):
    """Schema for Page responses"""
    id: int
    title: str
    city: Optional[str] = None
    type: Optional[str] = None
    image: Optional[str] = None
    pageContent: Optional[str] = None
    updated_at: Optional[datetime] = None
    published: Optional[bool] = False
    published_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class PaginatedPageResponse(BaseModel):
    """Schema for paginated responses"""
    pages: list[PageResponse]
    count: int
    last_evaluated_key: Optional[Dict[str, Any]] = None

class AnalyticsData(BaseModel):
    """Schema for Analytics Data"""
    event: str
    count: int
    timestamp: int
    class Config:
        from_attributes = True

class UploadRequest(BaseModel):
    """Schema for S3 Upload Request"""
    file_name: str
    content_type: str