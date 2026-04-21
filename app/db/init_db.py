from app.db.base import Base
from app.db.session import engine

from app.db.models.role import Role
from app.db.models.user import User
from app.db.models.product import Product


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
