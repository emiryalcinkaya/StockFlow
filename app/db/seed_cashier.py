from app.db.session import SessionLocal
from app.db.models.user import User
from app.db.models.role import Role
from app.core.security import hash_password


def seed_cashier():
    db = SessionLocal()

    cashier_role = db.query(Role).filter(Role.name == "cashier").first()
    if not cashier_role:
        print("Cashier role not found")
        db.close()
        return

    existing_user = db.query(User).filter(User.username == "cashier").first()
    if existing_user:
        print("Cashier user already exists")
        db.close()
        return

    cashier_user = User(
        full_name="Cashier User",
        email="cashier@stockflow.com",
        username="cashier",
        hashed_password=hash_password("cashier123"),
        is_active=True,
        role_id=cashier_role.id
    )

    db.add(cashier_user)
    db.commit()
    db.close()

    print("Cashier user created successfully")


if __name__ == "__main__":
    seed_cashier()
