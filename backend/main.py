from fastapi import FastAPI, HTTPException, File, UploadFile, Form, APIRouter, Depends, status, Request, Response
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import shutil
import os
from config import MONGODB_URI, SECRET_KEY, ALGORITHM

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
    global client, db, cases_collection, users_collection
    try:
        client = MongoClient(
            MONGODB_URI,
            server_api=ServerApi("1")
        )
        client.admin.command("ping")
        db = client["missing_persons"]
        cases_collection = db["cases"] 
        users_collection = db["users"]
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

@app.get("/")
def root():
    return {"status": "API is running"}

@app.post("/auth/signup")
def signup(user: UserSignup):
    require_db()

    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    user_document = {
        "email": user.email,
        "password": hashed_pw,
        "phone": user.phone,
        "createdAt": datetime.utcnow()
    }

    result = users_collection.insert_one(user_document)

    return {
        "message": "User created successfully",
        "user_id": str(result.inserted_id)
    }


@app.post("/auth/login")
def login(user: UserLogin):
    require_db()

    db_user = users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": str(db_user["_id"])
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.get("/cases")
def get_cases():
    require_db()
    # return cases
    return list(cases_collection.find({}, {"_id": 0}))

@app.get("/cases/{case_id}")
def get_case(case_id: int):
    require_db()
    for case in list(cases_collection.find({}, {"_id": 0})):
        if case["id"] == case_id:
            return case
    raise HTTPException(status_code=404, detail="Case not found")

# Créez un dossier pour stocker les images
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.post("/cases")
async def create_case(
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
    case_document.pop("_id", None)

    return case_document