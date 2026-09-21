import base64
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_fernet_key() -> bytes:
    key_str = settings.FERNET_KEY
    if not key_str:
        # Fallback predictable key for dev if missing
        key_str = "yB14Y5c0Z57y5Kq_ZzU93B2F0Jp7W5xY1mZ6g5k4a2c="
    
    # Fernet requires a 32-byte URL-safe base64 key
    key_bytes = key_str.encode("utf-8")
    if len(key_bytes) < 32:
        key_bytes = key_bytes.ljust(32, b"0")
    elif len(key_bytes) > 32 and not key_str.endswith("="):
        key_bytes = key_bytes[:32]
        
    try:
        # Check if valid base64
        base64.urlsafe_b64decode(key_bytes)
        return key_bytes
    except Exception:
        # Generate valid urlsafe base64 from bytes
        return base64.urlsafe_b64encode(key_bytes[:32])

def encrypt_credential(plain_text: str) -> str:
    if not plain_text:
        return ""
    fernet = Fernet(_get_fernet_key())
    return fernet.encrypt(plain_text.encode("utf-8")).decode("utf-8")

def decrypt_credential(cipher_text: str) -> str:
    if not cipher_text:
        return ""
    try:
        fernet = Fernet(_get_fernet_key())
        return fernet.decrypt(cipher_text.encode("utf-8")).decode("utf-8")
    except Exception:
        return "[Decryption Failed]"

def mask_credential(plain_text: str) -> str:
    if not plain_text:
        return "Not Set"
    if len(plain_text) <= 4:
        return "****"
    return plain_text[:2] + "****" + plain_text[-2:]
