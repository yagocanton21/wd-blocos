from .products import router as products_router
from .stats import router as stats_router
from .auth import router as auth_router

__all__ = ["products_router", "stats_router", "auth_router"]
