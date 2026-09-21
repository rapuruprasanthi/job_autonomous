from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.settings import router as settings_router
from app.api.portals import router as portals_router
from app.api.knowledge import router as knowledge_router
from app.api.jobs import router as jobs_router
from app.api.applications import router as apps_router
from app.api.approvals import router as approvals_router
from app.api.orchestrator import router as orchestrator_router
from app.api.outreach import router as outreach_router
from app.api.dashboard import router as dashboard_router
from app.api.activity import router as activity_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(settings_router)
api_router.include_router(portals_router)
api_router.include_router(knowledge_router)
api_router.include_router(jobs_router)
api_router.include_router(apps_router)
api_router.include_router(approvals_router)
api_router.include_router(orchestrator_router)
api_router.include_router(outreach_router)
api_router.include_router(dashboard_router)
api_router.include_router(activity_router)
