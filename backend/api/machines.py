"""
Machine API Routes for SENTINEL AI.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Machine, SensorReading
from services.scheduled_grok_generator import scheduled_grok_generator

router = APIRouter(prefix="/machines", tags=["machines"])


@router.get("/")
def list_machines(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all machines with optional filtering."""
    query = db.query(Machine)
    
    if status:
        query = query.filter(Machine.status == status)
    
    machines = query.offset(skip).limit(limit).all()
    return {
        "machines": machines,
        "count": len(machines),
        "total": db.query(Machine).count()
    }


@router.get("/{machine_id}")
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    """Get a specific machine by ID."""
    machine = db.query(Machine).filter(Machine.machine_id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.post("/")
def create_machine(machine_data: dict, db: Session = Depends(get_db)):
    """Create a new machine."""
    machine = Machine(**machine_data)
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


@router.get("/{machine_id}/readings")
def get_machine_readings(
    machine_id: str,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get recent sensor readings for a machine."""
    readings = db.query(SensorReading).filter(
        SensorReading.machine_id == machine_id
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()
    
    return {
        "machine_id": machine_id,
        "readings": readings,
        "count": len(readings)
    }


@router.get("/{machine_id}/health")
def get_machine_health(machine_id: str, db: Session = Depends(get_db)):
    """Get machine health status."""
    machine = db.query(Machine).filter(Machine.machine_id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    # Get latest reading
    latest = db.query(SensorReading).filter(
        SensorReading.machine_id == machine_id
    ).order_by(SensorReading.timestamp.desc()).first()
    
    return {
        "machine_id": machine_id,
        "status": machine.status,
        "health_score": latest.health_score if latest else None,
        "current_tier": latest.current_tier if latest else 1,
        "last_updated": latest.timestamp.isoformat() if latest else None
    }


@router.post("/{machine_id}/generate")
async def trigger_generation(machine_id: str, db: Session = Depends(get_db)):
    """Trigger immediate Grok data generation for a specific machine."""
    machine = db.query(Machine).filter(Machine.machine_id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    await scheduled_grok_generator.trigger_immediate(machine_id)
    return {
        "message": f"Data generation triggered for {machine.name}",
        "machine_id": machine_id
    }


@router.get("/scheduler/status")
def get_scheduler_status():
    """Get Grok scheduler status."""
    return scheduled_grok_generator.get_status()


@router.post("/scheduler/toggle")
async def toggle_scheduler():
    """Enable or disable the scheduled Grok generator."""
    if scheduled_grok_generator.running:
        await scheduled_grok_generator.stop()
        return {"status": "stopped", "message": "Scheduler disabled"}
    else:
        await scheduled_grok_generator.start()
        return {"status": "running", "message": "Scheduler enabled"}
