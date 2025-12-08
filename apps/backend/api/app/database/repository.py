from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
import uuid
from fastapi import FastAPI, HTTPException, status
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr
from app.config import get_settings


class Repository:
    """Base repository class"""
    @staticmethod
    def _convert_decimals(obj: Any) -> Any:
        """Convert Decimal objects to float for JSON serialization"""
        if isinstance(obj, list):
            return [PageRepository._convert_decimals(i) for i in obj]
        elif isinstance(obj, dict):
            return {k: PageRepository._convert_decimals(v) for k, v in obj.items()}
        elif isinstance(obj, Decimal):
            return float(obj) if obj % 1 else int(obj)
        return obj
    
    @staticmethod
    def _convert_floats(obj: Any) -> Any:
        """Convert float objects to Decimal for DynamoDB storage"""
        if isinstance(obj, list):
            return [PageRepository._convert_floats(i) for i in obj]
        elif isinstance(obj, dict):
            return {k: PageRepository._convert_floats(v) for k, v in obj.items()}
        elif isinstance(obj, float):
            return Decimal(str(obj))
        return obj
    
class PageRepository(Repository):
    """Repository for DynamoDB CRUD operations"""
    
    def __init__(self, table):
        self.table = table
        self.settings = get_settings()
        self.s3 = boto3.client("s3", region_name=self.settings.aws_region)
    
    def create_page(self, page_data: dict) -> dict:
        """Create a new page for a user"""
        page_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        page = {
            "id": page_id,
            **self._convert_floats(page_data)
        }
        
        try:
            self.table.put_item(
                Item=page,
                ConditionExpression="attribute_not_exists(id)"
            )
            return self._convert_decimals(page)
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Item already exists"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating page: {str(e)}"
            )
    
    def get_page(self, page_id: str, title: str, authorized: Optional[Dict] = None) -> Optional[dict]:
        """Get a single page by ID"""
        try:
            print(f"Fetching page with ID: {page_id} and Title: {title}")
            response = self.table.get_item(
                Key={
                    'id': int(page_id),  # Required partition key
                    'title': title  # Required sort key 
                },
            )
            print(response)
            page = response.get("Item")
            if page and not page.get("published", False):
                if not authorized:
                    return None
            return self._convert_decimals(page) if page else None
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving page: {str(e)}"
            )
    
    def get_count_pages(self) -> int:
        """Get total count of pages in the table"""
        try:
            response = self.table.scan(Select='COUNT')
            return response.get("Count", 0)
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error counting pages: {str(e)}"
            )

    def list_pages(
        self, 
        limit: int = 50,
    ) -> Dict[str, Any]:
        try:
            # This scans the entire table until the 1MB limit is hit
            response = self.table.scan(Limit=limit)
            print(response)
            # The response will contain all pages found within the scan limit (max 1MB of data)
            return {
                "pages": self._convert_decimals(response.get("Items", [])),
                "count": response.get("Count", 0),
                # LastEvaluatedKey might still exist if the 1MB limit was hit
                "last_evaluated_key": response.get("LastEvaluatedKey") 
            }
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error listing pages: {str(e)}"
            )
    
    def list_published_pages(
        self, 
        limit: int = 50,
    ) -> Dict[str, Any]:
        try:
            # This scans the entire table until the 1MB limit is hit
            response = self.table.scan(
                Limit=limit,
                FilterExpression="published = :published",
                ExpressionAttributeValues={":published": True}
            )
            print(response)
            # The response will contain all pages found within the scan limit (max 1MB of data)
            return {
                "pages": self._convert_decimals(response.get("Items", [])),
                "count": response.get("Count", 0),
                # LastEvaluatedKey might still exist if the 1MB limit was hit
                "last_evaluated_key": response.get("LastEvaluatedKey") 
            }
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error listing pages: {str(e)}"
            )
    
    def update_page(
        self, 
        page_id: str, 
        title: str,
        updates: dict
    ) -> Optional[dict]:
        # Remove None values
        updates = {k: v for k, v in updates.items() if v is not None}
        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        # Build update expression
        update_expr_parts = []
        expr_attr_names = {}
        expr_attr_values = {}
        
        for idx, (key, value) in enumerate(updates.items()):
            placeholder_name = f"#attr{idx}"
            placeholder_value = f":val{idx}"
            update_expr_parts.append(f"{placeholder_name} = {placeholder_value}")
            expr_attr_names[placeholder_name] = key
            expr_attr_values[placeholder_value] = self._convert_floats(value)
        
        # Always update the updated_at timestamp
        update_expr_parts.append("#updated_at = :updated_at")
        expr_attr_names["#updated_at"] = "updated_at"
        expr_attr_values[":updated_at"] = datetime.utcnow().isoformat()
        
        update_expression = "SET " + ", ".join(update_expr_parts)
        
        try:
            response = self.table.update_item(
                Key={
                    'id': int(page_id),  # Required partition key
                    'title': title  # Required sort key 
                },
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expr_attr_names,
                ExpressionAttributeValues=expr_attr_values,
                ConditionExpression="attribute_exists(id)",
                ReturnValues="ALL_NEW"
            )
            return self._convert_decimals(response.get("Attributes"))
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Item not found or access denied"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating page: {str(e)}"
            )
    
    def publish_page(self, page_id: str, title: str) -> Optional[dict]:
        """Publish an page (user must own the page)"""
        try:
            response = self.table.update_item(
                Key={
                    'id': int(page_id),  # Required partition key
                    'title': title  # Required sort key 
                },
                UpdateExpression="SET #published = :true, #published_at = :now, #updated_at = :now",
                ExpressionAttributeNames={
                    "#published": "published",
                    "#published_at": "published_at",
                    "#updated_at": "updated_at"
                },
                ExpressionAttributeValues={
                    ":true": True,
                    ":now": datetime.utcnow().isoformat()
                },
                ConditionExpression="attribute_exists(id)",
                ReturnValues="ALL_NEW"
            )
            return self._convert_decimals(response.get("Attributes"))
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Item not found or access denied"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error publishing page: {str(e)}"
            )

    def delete_page(self, page_id: str, title: str) -> bool:
        """Delete an page (user must own the page)"""
        print("Deleting page from repo:", page_id, title)
        try:
            self.table.delete_item(
                Key={
                    'id': int(page_id),  # Required partition key
                    'title': title  # Required sort key 
                },
                ConditionExpression="attribute_exists(id)"
            )
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Item not found or access denied"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting page: {str(e)}"
            )
    
    def search_pages(
        self,
        search_term: Optional[str] = "",
        city: Optional[str] = None,
        type: Optional[str] = None,
        tag: Optional[str] = None,
        published: Optional[bool] = None,
        limit: int = 50
    ) -> List[dict]:
        """Search pages by title or description (using scan - not optimal for large datasets)"""
        try:
            response = None
            if not city and not type:
                if not search_term or search_term.strip() == "":
                    print("Searching all pages that are published", "tag:", tag)
                    if published:
                        if tag:
                            response = self.table.scan(
                                FilterExpression=Attr("published").eq(True) & Attr("tags").contains(tag),
                                Limit=limit
                            )
                        else:
                            response = self.table.scan(
                            FilterExpression=(
                                Attr("published").eq(True)
                            ),
                            Limit=limit
                        )
                else:
                    if not published:
                        response = self.table.scan(
                            FilterExpression=(
                                Attr("title").contains(search_term) | 
                                Attr("pageContent").contains(search_term)
                            ),
                            Limit=limit
                        )
                    else:
                        response = self.table.scan(
                            FilterExpression=(
                                (Attr("title").contains(search_term) | 
                                Attr("pageContent").contains(search_term)) &
                                Attr("published").eq(True)
                            ),
                            Limit=limit
                        )
            elif city and not type:
                print("Searching pages for city:", city)
                if not search_term or len(search_term.strip()) == 0:
                    response = self.table.scan(
                        FilterExpression=Attr("city").contains(city),
                        Limit=limit
                    )
                    print(response)
                else:
                    print("Searching pages in city with term:", search_term)
                    response = self.table.scan(
                        FilterExpression=(
                            (Attr("title").contains(search_term) | 
                            Attr("pageContent").contains(search_term)) &
                            Attr("city").eq(city)
                        ),
                        Limit=limit
                    )
            elif type and not city:
                if not search_term or search_term.strip() == "":
                    response = self.table.scan(
                        FilterExpression=Attr("type").eq(type),
                        Limit=limit
                    )
                else:
                    response = self.table.scan(
                        FilterExpression=(
                            (Attr("title").contains(search_term) | 
                            Attr("pageContent").contains(search_term)) &
                            Attr("type").eq(type)
                        ),
                        Limit=limit
                    )
            else:  # both city and type provided
                if not search_term or search_term.strip() == "":
                    response = self.table.scan(
                        FilterExpression=Attr("city").eq(city) & Attr("type").eq(type),
                        Limit=limit
                    )
                else:
                    response = self.table.scan(
                        FilterExpression=(
                            (Attr("title").contains(search_term) | 
                            Attr("pageContent").contains(search_term)) &
                            Attr("city").eq(city) &
                            Attr("type").eq(type)
                        ),
                        Limit=limit
                    )
            return self._convert_decimals(response.get("Items", []))
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error searching pages: {str(e)}"
            )

class AnalyticsRepository(Repository):
    """Repository for Analytics DynamoDB operations"""
    
    def __init__(self, table):
        self.table = table
    
    # Analytics-specific methods would go here
    def get_recent_events(self, limit: int = 100) -> List[dict]:
        """Retrieve recent analytics events"""
        try:
            response = self.table.scan(Limit=limit)
            return PageRepository._convert_decimals(response.get("Items", []))
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving analytics data: {str(e)}"
            )
        
    def get_event_analytics(self, event_name: Optional[str], event_type: Optional[str], limit: int = 100, oldest: Optional[int] = None, group: Optional[str] = None) -> List[dict]:
        """Retrieve analytics data for a specific event"""
        try:
            if event_name:
                response = self.table.scan(
                    FilterExpression=Attr("event").eq(event_name) & Attr("timestamp").gte(oldest) if oldest else Attr("event").eq(event_name),
                    Limit=limit
                )
            elif event_type:
                print(f"Fetching analytics for event type: {event_type} since {oldest}")
                response = self.table.scan(
                    FilterExpression=Attr("event").contains(event_type) & Attr("timestamp").gte(oldest) if oldest else Attr("event").contains(event_type),
                    Limit=limit
                )
            ## group by timestamp and sum counts
            results = AnalyticsRepository._convert_decimals(response.get("Items", []))

            ## default group by timestamp, which is per minute
            ## options include minute, hour, day
            print(group)
            aggregated = {}
            for item in results:
                ts = item["timestamp"]
                if group == "hour":
                    ts = ts - (ts % 3600)
                elif group == "day":
                    ts = ts - (ts % (3600*24))
                
                if ts not in aggregated:
                    aggregated[ts] = {
                        "event": item["event"],
                        "timestamp": ts,
                        "count": 0
                    }
                aggregated[ts]["count"] += item["count"]

            return list(aggregated.values())
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving analytics data for event '{event_name}': {str(e)}" if event_name else f"Error retrieving analytics data for event type '{event_type}': {str(e)}"
            )
        
    def log_event(self, event: str, timestamp: Optional[str] = None) -> None:
        """Log a page view event"""
        if not timestamp:
            from datetime import datetime, timezone
            # Get current UTC datetime object by minute
            utc_now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
            timestamp = int(utc_now.timestamp())
        
        log_entry = {
            "event": event,
            "timestamp": timestamp,
        }
        
        try:
            self.table.update_item(
                Key=self._convert_floats(log_entry),
                UpdateExpression="ADD #count :inc",
                ExpressionAttributeNames={"#count": "count"},
                ExpressionAttributeValues={":inc": Decimal(1)},
                ReturnValues="UPDATED_NEW"
            )
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error logging page view: {str(e)}"
            )
    