#!/usr/bin/env python3
"""Seed database with machines"""

from database import SessionLocal, init_db
from models.machine import Machine
import json

init_db()
db = SessionLocal()

# Check if machines exist
count = db.query(Machine).count()
print(f'Current machines: {count}')

if count == 0:
    # Seed machines
    machines = [
        Machine(
            machine_id='A',
            name='Turbine Alpha',
            type='gas_turbine',
            location='Bay 1',
            thresholds={
                "temperature": {"min": 500, "max": 1200, "critical": 1300},
                "pressure": {"min": 10, "max": 30, "critical": 35},
                "vibration": {"min": 0, "max": 10, "critical": 12},
                "rpm": {"min": 3000, "max": 8000, "critical": 8500}
            },
            normal_ranges={
                "temperature": {"low": 600, "high": 1000},
                "pressure": {"low": 15, "high": 25},
                "vibration": {"low": 1, "high": 5},
                "rpm": {"low": 3500, "high": 7500}
            },
            shift_schedule={
                "shifts": [
                    {"name": "Day", "start": "06:00", "end": "14:00"},
                    {"name": "Evening", "start": "14:00", "end": "22:00"},
                    {"name": "Night", "start": "22:00", "end": "06:00"}
                ],
                "maintenance_windows": ["13:45", "21:45", "05:45"],
                "weekend_maintenance": True
            },
            status='normal',
            health_score=85.0
        ),
        Machine(
            machine_id='B',
            name='Compressor Beta',
            type='air_compressor',
            location='Bay 2',
            thresholds={
                "temperature": {"min": 40, "max": 120, "critical": 130},
                "pressure": {"min": 5, "max": 15, "critical": 18},
                "current": {"min": 10, "max": 50, "critical": 60}
            },
            normal_ranges={
                "temperature": {"low": 50, "high": 100},
                "pressure": {"low": 7, "high": 12},
                "current": {"low": 15, "high": 40}
            },
            shift_schedule={
                "shifts": [
                    {"name": "Day", "start": "06:00", "end": "18:00"},
                    {"name": "Night", "start": "18:00", "end": "06:00"}
                ],
                "maintenance_windows": ["17:45", "05:45"],
                "weekend_maintenance": True
            },
            status='normal',
            health_score=92.0
        ),
        Machine(
            machine_id='C',
            name='Pump Gamma',
            type='hydraulic_pump',
            location='Bay 3',
            thresholds={
                "temperature": {"min": 30, "max": 90, "critical": 100},
                "pressure": {"min": 50, "max": 200, "critical": 220},
                "flow_rate": {"min": 10, "max": 100, "critical": 110}
            },
            normal_ranges={
                "temperature": {"low": 40, "high": 80},
                "pressure": {"low": 80, "high": 180},
                "flow_rate": {"low": 30, "high": 90}
            },
            shift_schedule={
                "shifts": [
                    {"name": "Continuous", "start": "00:00", "end": "23:59"}
                ],
                "maintenance_windows": ["12:00"],
                "weekend_maintenance": False
            },
            status='normal',
            health_score=78.0
        ),
        Machine(
            machine_id='D',
            name='Motor Delta',
            type='electric_motor',
            location='Bay 4',
            thresholds={
                "temperature": {"min": 30, "max": 80, "critical": 90},
                "current": {"min": 5, "max": 25, "critical": 30},
                "vibration": {"min": 0, "max": 5, "critical": 6}
            },
            normal_ranges={
                "temperature": {"low": 40, "high": 70},
                "current": {"low": 8, "high": 20},
                "vibration": {"low": 0.5, "high": 3}
            },
            shift_schedule={
                "shifts": [
                    {"name": "Day", "start": "08:00", "end": "17:00"}
                ],
                "maintenance_windows": ["12:30"],
                "weekend_maintenance": True
            },
            status='normal',
            health_score=95.0
        )
    ]
    
    for m in machines:
        db.add(m)
    
    db.commit()
    print(f'Added {len(machines)} machines')

db.close()
print('Done!')
