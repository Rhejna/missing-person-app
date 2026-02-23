from fastapi import FastAPI, HTTPException, File, UploadFile, Form, APIRouter, Depends, status, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient, GEOSPHERE
from pymongo.server_api import ServerApi
import shutil
import os
from config import MONGODB_URI, SECRET_KEY, ALGORITHM
from logs import create_log
from bson import ObjectId

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration
origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], #origins,
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # allow all headers
)

security = HTTPBearer()

# MongoDB connection
client: MongoClient | None = None
db = None
cases_collection = None

@app.on_event("startup")
def startup_db():
    global client, db, cases_collection, users_collection, authorities_collection
    try:
        client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi("1")
        )
        client.admin.command("ping")
        db = client["missing_persons"]
        cases_collection = db["cases"] 
        users_collection = db["users"]
        authorities_collection = db["authorities"]
        print("✅ Connected to MongoDB")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)



# --- Case creation ---
class CaseCreate(BaseModel):
    firstName: str
    lastName: str
    age: int
    description: str
    lastSeenLocation: str
    lastSeenDate: str
    lastSeenTime: Optional[str] = None
    reporterName: str
    reporterRelation: str
    reporterPhone: str
    reporterEmail: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    phone: str
    fullName: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=60))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_next_case_id():
    last_case = cases_collection.find_one(
        sort=[("id", -1)]
    )
    if last_case:
        return last_case["id"] + 1
    return 1


# --- Routes ---
def require_db():
    if cases_collection is None:
        raise HTTPException(
            status_code=503,
            detail="Database not connected"
        )
    # Activate the index and treat the "location" field like a map.
    authorities_collection.create_index([("location", GEOSPHERE)])

@app.get("/")
def root():
    return {"status": "API is running"}


@app.post("/auth/signup")
def signup(user: UserSignup, request: Request):
    require_db()

    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    user_document = {
        "email": user.email,
        "password": hashed_pw,
        "phone": user.phone,
        "fullName": user.fullName,
        "createdAt": datetime.utcnow()
    }

    result = users_collection.insert_one(user_document)

    create_log(db, "user_signup", str(result.inserted_id), f"New user: {user.email}", request)

    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }


@app.post("/auth/login")
def login(user: UserLogin, request: Request):
    require_db()

    db_user = users_collection.find_one({"email": user.email})

    if not db_user:
        create_log(db, "login_failed", None, f"Failed login: {user.email}", request)
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        create_log(db, "login_failed", None, f"Failed login: {user.email}", request)
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": str(db_user["_id"])
        }
    )

    create_log(db, "user_login", str(db_user["_id"]), f"Login success: {user.email}", request)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get("/me")
def get_me(user_id: str = Depends(get_current_user)):
    require_db()

    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "fullName": user["fullName"],
        "email": user["email"],
        "phone": user["phone"]
    }

@app.get("/cases")
def get_cases():
    require_db()
    # return cases
    cases = list(
        cases_collection.find(
            {"deleted": False},
            {"_id": 0}
        )
    )

    return cases


@app.get("/cases/{case_id}")
def get_case(case_id: int):
    require_db()
    # This happens on the database server, which is extremely fast
    case = cases_collection.find_one(
        {
            "id": case_id,
            "deleted": False
        }, 
        {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.get("/my-cases")
def get_my_cases(user_id: str = Depends(get_current_user)):
    require_db()
    cases = list(
        cases_collection.find(
            {"user_id": user_id, "deleted": False},
            {"_id": 0}
        )
    )
    return cases


@app.get("/cases/{case_id}/edit")
def get_case_for_edit(case_id: int, user_id: str = Depends(get_current_user)):
    require_db()

    case = cases_collection.find_one(
        {
            "id": case_id,
            "user_id": user_id,
            "deleted": False
        },
        {"_id": 0}
    )

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    return case



# Créez un dossier pour stocker les images
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.post("/cases")
async def create_case(
    request: Request,
    user_id: str = Depends(get_current_user),
    firstName: str = Form(...),
    lastName: str = Form(...),
    age: int = Form(...),
    description: str = Form(...),
    lastSeenLocation: str = Form(...),
    lastSeenDate: str = Form(...),
    reporterName: str = Form(...),
    reporterRelation: str = Form(...),
    reporterPhone: str = Form(...),
    reporterEmail: str = Form(...),
    lastSeenTime: Optional[str] = Form(None),
    photo: UploadFile = File(...)
):
    require_db()
    new_id = get_next_case_id()

    last_seen = lastSeenDate
    if lastSeenTime:
        last_seen += f" at {lastSeenTime}"

    # Sauvegarde de l'image
    file_extension = photo.filename.split(".")[-1]
    file_name = f"case_{new_id}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    case_document = {
        "id": new_id,
        "user_id": user_id,
        "name": f"{firstName} {lastName}",
        "age": age,
        "lastSeen": last_seen,
        "location": lastSeenLocation,
        "photo": f"/uploads/{file_name}",
        "status": "missing",
        "deleted": False,
        "verified": False,
        "description": description,
        "reporterContact": f"{reporterName} ({reporterRelation})",
        "reporterPhone": reporterPhone,
        "reportedDate": datetime.now().strftime("%b %d, %Y"),
        "caseNumber": f"MISS-{datetime.now().year}-{str(new_id).zfill(4)}",
        "updates": [
            {
                "date": datetime.now().strftime("%b %d, %Y"),
                "status": "Case reported",
                "type": "reported",
            }
        ],
        "comments": [],
    }

    cases_collection.insert_one(case_document)
    create_log(db, "case_created", user_id, f"Case ID: {new_id}", request)
    case_document.pop("_id", None)

    return case_document


@app.put("/cases/{case_id}")
async def update_case(
    request: Request,
    case_id: int,
    firstName: str = Form(...),
    lastName: str = Form(...),
    age: int = Form(...),
    description: str = Form(...),
    lastSeenLocation: str = Form(...),
    lastSeenDate: str = Form(...),
    reporterName: str = Form(...),
    reporterRelation: str = Form(...),
    reporterPhone: str = Form(...),
    reporterEmail: Optional[str] = Form(None), # Made Optional
    lastSeenTime: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    user_id: str = Depends(get_current_user),
):
    require_db()

    case = cases_collection.find_one({"id": case_id, "user_id": user_id})
    if not case:
        raise HTTPException(status_code=404, detail="Not allowed")

    # Combine them back into the DB format
    if lastSeenTime:
        combined_last_seen = f"{lastSeenDate} at {lastSeenTime}"
    else:
        combined_last_seen = lastSeenDate

    update_data = {
        "name": f"{firstName} {lastName}",
        "age": age,
        "description": description,
        "location": lastSeenLocation,
        "reporterContact": f"{reporterName} ({reporterRelation})",
        "reporterPhone": reporterPhone,
        # Ensure we keep these fields updated for the frontend fetch
        "lastSeen": combined_last_seen,
    }

    if photo:
        file_extension = photo.filename.split(".")[-1]
        file_name = f"case_{case_id}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        update_data["photo"] = f"/uploads/{file_name}"

    cases_collection.update_one({"id": case_id}, {"$set": update_data})

    # NEW LOG
    create_log(db, "case_updated", user_id, f"Case ID: {case_id}", request)

    return {"message": "Case updated successfully"}

@app.patch("/cases/{case_id}/status")
def update_status(request: Request, case_id: int, new_status: str, user_id: str = Depends(get_current_user)):
    require_db()

    case = cases_collection.find_one({"id": case_id, "user_id": user_id})
    if not case:
        raise HTTPException(status_code=404)

    cases_collection.update_one(
        {"id": case_id},
        {
            "$set": {"status": new_status},
            "$push": {
                "updates": {
                    "date": datetime.now().strftime("%b %d, %Y"),
                    "status": f"Status changed to {new_status}",
                    "type": "status_update",
                }
            }
        }
    )

    # NEW LOG
    create_log(db, "status_changed", user_id, f"Case {case_id} moved to {new_status}", request)

    return {"message": "Status updated"}


@app.patch("/cases/{case_id}/delete")
def delete_case(request: Request, case_id: int, user_id: str = Depends(get_current_user)):
    require_db()

    case = cases_collection.find_one({"id": case_id, "user_id": user_id})
    if not case:
        raise HTTPException(status_code=404)

    cases_collection.update_one(
        {"id": case_id},
        {"$set": {"deleted": True}}
    )

    # NEW LOG
    create_log(db, "case_archived", user_id, f"Case ID: {case_id} was deleted/archived", request)

    return {"message": "Case archived"}


def parse_authority(doc):
    return {
        "name": doc.get("name", "Unknown Authority"),
        "type": doc.get("type", "ngo"),
        "phones": doc.get("phones", []), # Ensure this is an array
        "address": doc.get("address", "Address not available"),
        "hours": doc.get("hours", "Contact for hours"),
        "location": {
            "lat": doc["location"]["coordinates"][1] if "location" in doc else 0,
            "lng": doc["location"]["coordinates"][0] if "location" in doc else 0
        }
    }

@app.get("/api/authorities")
def get_nearest_authorities(lat: float, lng: float):
    require_db()
    
    try:
        pipeline = [
            {
                "$geoNear": {
                    "near": { "type": "Point", "coordinates": [lng, lat] },
                    "distanceField": "dist_meters",
                    "spherical": True
                }
            },
            { "$limit": 4 }
        ]
        
        # Convert cursor to list immediately to catch errors early
        results = list(authorities_collection.aggregate(pipeline))
        
        if not results:
            return [] # Return empty list if no authorities found nearby

        output = []
        for doc in results:
            parsed = parse_authority(doc)
            dist = doc.get('dist_meters', 0)
            parsed["distance"] = f"{round(dist / 1000, 1)} km"
            output.append(parsed)
            
        return output
        
    except Exception as e:
        print(f"❌ Geospatial Error: {e}")
        raise HTTPException(status_code=500, detail="Database map index missing or data improperly formatted.")
