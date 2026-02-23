"""
Records an audit log entry in the database for tracking user actions and system events.

This function captures the action performed, the associated user, specific details, 
and attempts to resolve the client's real IP address from the request headers 
(handling proxies like Nginx/Cloudflare via X-Forwarded-For).

Args:
    db: The MongoDB database instance.
    action (str): A descriptive string of the event (e.g., 'case_created', 'user_login').
    user_id (str | None, optional): The unique identifier of the user performing the action.
    details (str | None, optional): Additional context or metadata about the event.
    request (Request | None, optional): The FastAPI request object used to extract client IP.

Returns:
    None: The function returns nothing and fails silently if the database is not provided.
"""

from datetime import datetime
from fastapi import Request

def create_log(db, action: str, user_id: str | None = None, details: str | None = None, request: Request | None = None):
    if db is None:
        return

    logs_collection = db["logs"]

    ip = None
    if request:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            ip = forwarded.split(",")[0]
        else:
            ip = request.client.host

    log_document = {
        "action": action,
        "user_id": user_id,
        "details": details,
        "ip": ip,
        "createdAt": datetime.utcnow()
    }

    logs_collection.insert_one(log_document)

