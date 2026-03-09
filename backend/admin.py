# admin.py
from fastapi import APIRouter, Depends, Request
from auth import get_current_admin
import database

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
async def get_admin_stats(request: Request, admin_id: str = Depends(get_current_admin)):
    # Access to data
    active_cases = database.cases_collection.count_documents({"status": "missing", "deleted": False})
    total_users = database.users_collection.count_documents({})
    
    suspicious = database.logs_collection.count_documents({
        "action": {"$in": ["login_failed", "admin_access_denied"]}
    })
    
    blocked_count = database.users_collection.count_documents({"blocked": True})

    recent_logs = list(database.logs_collection.find().sort("createdAt", -1).limit(5))
    
    activities = []
    for log in recent_logs:
        activities.append({
            "id": str(log["_id"]),
            "action": log["action"],
            "user": log.get("details", "System"),
            "time": log.get("createdAt").isoformat() if log.get("createdAt") else "Unknown"
        })

    return {
        "active_cases": active_cases,
        "total_users": total_users,
        "suspicious": suspicious,
        "blocked": blocked_count,
        "activities": activities
    }


@router.patch("/users/{user_id}/block")
async def block_user(user_id: str, block: bool, admin_id: str = Depends(get_current_admin)):
    from main import users_collection, db
    
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"blocked": block}}
    )
    
    action = "blocked" if block else "unblocked"
    # To know which admin blocked whom
    create_log(db, f"user_{action}", admin_id, f"User {user_id} was {action}", None)
    
    return {"message": f"User successfully {action}"}