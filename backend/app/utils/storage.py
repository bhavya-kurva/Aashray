import os
import uuid
from fastapi import UploadFile
from app.config import settings

# Configure Cloudinary if credentials are present
CLOUDINARY_CONFIGURED = False
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )
        CLOUDINARY_CONFIGURED = True
    except Exception:
        pass

async def save_upload_file(file: UploadFile) -> str:
    """
    Saves an uploaded file either to Cloudinary or to the local filesystem as a fallback.
    Returns the URL string.
    """
    if CLOUDINARY_CONFIGURED:
        try:
            # Upload stream directly to Cloudinary
            upload_result = cloudinary.uploader.upload(file.file)
            return upload_result.get("secure_url")
        except Exception:
            # If Cloudinary upload fails, fall back to local storage
            pass

    # Local Storage Fallback
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    _, ext = os.path.splitext(file.filename or "")
    if not ext:
        ext = ".jpg"
    unique_name = f"{uuid.uuid4()}{ext}"
    
    local_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    
    # Save the file stream locally
    file.file.seek(0)
    with open(local_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    return f"/static/{unique_name}"
