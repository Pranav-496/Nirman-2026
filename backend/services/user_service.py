import json
import os
from typing import Optional, Dict

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
USERS_DB_PATH = os.path.join(DATA_DIR, "users.json")

def _load_users() -> list:
    if not os.path.exists(USERS_DB_PATH):
        return []
    with open(USERS_DB_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def _save_users(users: list):
    with open(USERS_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

def get_user_by_email(email: str) -> Optional[Dict]:
    users = _load_users()
    for user in users:
        if user["email"].lower() == email.lower():
            return user
    return None

def create_user(email: str, password_hash: str, name: str, is_admin: bool = True) -> Dict:
    users = _load_users()
    new_user = {
        "id": str(len(users) + 1),
        "email": email.lower(),
        "password_hash": password_hash,
        "name": name,
        "is_admin": is_admin
    }
    users.append(new_user)
    _save_users(users)
    return new_user
