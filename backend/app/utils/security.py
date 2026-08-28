import hashlib
from datetime import datetime, timedelta
from typing import Optional
import jwt
from app.config import settings

# Attempt to load passlib for bcrypt. Fallback to hashlib if dependencies fail.
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    HAS_BCRYPT = True
except Exception:
    HAS_BCRYPT = False

def hash_password(password: str) -> str:
    if HAS_BCRYPT:
        try:
            return pwd_context.hash(password)
        except Exception:
            pass
    # Fallback salt-based SHA256
    salt = settings.JWT_SECRET
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if HAS_BCRYPT and hashed_password.startswith("$2"):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            pass
    salt = settings.JWT_SECRET
    expected_256 = hashlib.sha256((plain_password + salt).encode("utf-8")).hexdigest()
    return expected_256 == hashed_password



def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        return None
