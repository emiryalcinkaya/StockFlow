from app.db.session import SessionLocal
from app.db.models.role import Role


def seed_roles():
    db = SessionLocal()

    roles = [
        {"name": "admin", "description": "Full system access"},
        {"name": "cashier", "description": "Can process sales"},
    ]

    for role_data in roles:
        existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()

        if not existing_role:
            role = Role(
                name=role_data["name"],
                description=role_data["description"]
            )
            db.add(role)

    db.commit()
    db.close()


if __name__ == "__main__":
    seed_roles()
