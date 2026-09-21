import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.db.session import SessionLocal

logger = logging.getLogger("job_agent.scheduler")

scheduler = BackgroundScheduler()

def scheduled_agent_loop():
    logger.info("Executing background scheduled agent loop...")
    db = SessionLocal()
    try:
        from app.models.entities import User
        users = db.query(User).filter(User.is_active == True).all()
        for user in users:
            from app.services.orchestrator import run_agent_pipeline
            run_agent_pipeline(user.id, db)
    except Exception as e:
        logger.error(f"Error in background agent scheduler: {e}", exc_info=True)
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(scheduled_agent_loop, 'interval', minutes=30, id='agent_loop_job', replace_existing=True)
        scheduler.start()
        logger.info("APScheduler background agent worker started.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("APScheduler background agent worker stopped.")
