from app.db.session import SessionLocal
from app.db.models.role import Role
from app.db.models.user import User
from app.core.security import hash_password


def seed_admin():
    db = SessionLocal()

    admin_role = db.query(Role).filter(Role.name == "admin").first()

    if not admin_role:
        print("Admin role not found.")
        db.close()
        return

    existing_admin = db.query(User).filter(User.username == "admin").first()

    if existing_admin:
        print("Admin user already exists.")
        db.close()
        return

    admin_user = User(
        full_name="System Admin",
        email="admin@stockflow.com",
        username="admin",
        hashed_password=hash_password("admin123"),
        is_active=True,
        role_id=admin_role.id
    )

    db.add(admin_user)
    db.commit()
    db.close()

    print("Admin user created successfully.")


if __name__ == "__main__":
    seed_admin()
