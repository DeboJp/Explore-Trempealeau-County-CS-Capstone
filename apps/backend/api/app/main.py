from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router as api_router
from app.routes.pages import router as pages_router
from app.routes.analytics import router as analytics_router
from app.config import get_settings

app = FastAPI(
    title="FastAPI with AWS Cognito + DynamoDB",
    description="API with AWS Cognito OAuth and DynamoDB CRUD",
    version="1.0.0"
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api/v1", tags=["api"])
app.include_router(pages_router, prefix="/api/v1", tags=["pages"])
app.include_router(analytics_router, prefix="/api/v1", tags=["analytics"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "table": settings.dynamodb_table_name}

# Lambda handler
"""
from mangum import Mangum
handler = Mangum(app)
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)