from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    phone: str = payload.get("sub")
    if phone is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.phone == phone).first()
    if user is None:
        raise credentials_exception
    return user

def check_role(required_roles: list[str]):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action forbidden for role '{current_user.role}'. Requires one of: {required_roles}"
            )
        return current_user
    return dependency

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register-citizen", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Clean phone (remove spaces, etc)
    phone_clean = user_in.phone.strip()
    
    # Check duplicate
    existing_user = db.query(User).filter(User.phone == phone_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this phone number already registered."
        )
        
    hashed = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        phone=phone_clean,
        email=user_in.email,
        password_hash=hashed,
        role=user_in.role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    phone_clean = credentials.phone.strip()
    user = db.query(User).filter(User.phone == phone_clean).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect phone number or password."
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.phone, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
