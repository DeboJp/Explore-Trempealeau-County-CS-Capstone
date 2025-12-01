import boto3
from functools import lru_cache
from app.config import get_settings

@lru_cache()
def get_dynamodb_resource():
    """Create singleton DynamoDB resource"""
    settings = get_settings()
    
    # Configuration for DynamoDB
    config = {
        "region_name": settings.aws_region
    }
    
    # Add endpoint_url for local DynamoDB
    if settings.dynamodb_endpoint_url:
        config["endpoint_url"] = settings.dynamodb_endpoint_url
    
    return boto3.resource("dynamodb", **config)

@lru_cache()
def get_dynamodb_table(table_name: str):
    """Get DynamoDB table instance"""
    settings = get_settings()
    dynamodb = get_dynamodb_resource()
    if table_name == "AppPages" or not table_name:
        table_name = "AppPages"
    elif table_name == "Analytics":
        table_name = "Analytics"
    table = dynamodb.Table(table_name)
    print(f"Connected to table: {table.table_name}")
    return table