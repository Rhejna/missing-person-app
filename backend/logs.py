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

