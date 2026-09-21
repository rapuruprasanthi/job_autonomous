from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.db.session import get_db
from app.models.entities import User
from app.core.deps import get_current_user
from app.services.orchestrator import run_agent_pipeline

router = APIRouter(prefix="/orchestrator", tags=["Agent Orchestrator"])

@router.post("/run-now")
def trigger_agent_run_now(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Manually triggers the agent pipeline loop for the current candidate.
    """
    results = run_agent_pipeline(current_user.id, db)
    return {
        "message": "Agent pipeline run completed successfully.",
        "results": results
    }
