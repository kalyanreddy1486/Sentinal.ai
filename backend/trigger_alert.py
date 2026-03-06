import asyncio
import sys
sys.path.insert(0, '.')

from database import SessionLocal
from alerts.alert_manager import alert_manager

async def trigger_anomaly():
    db = SessionLocal()
    alert_manager.db = db
    
    # Simulate critical sensor data for Machine A (Turbine Alpha)
    sensor_data = {
        'temperature': 102.5,
        'pressure': 78.2,
        'rpm': 3950,
        'fuel_flow': 58.5
    }
    
    # Create a critical diagnosis
    diagnosis = {
        'failure_type': 'Critical Bearing Overheating',
        'confidence': 92,
        'severity': 'CRITICAL',
        'time_to_breach': '5 minutes',
        'action': 'EMERGENCY SHUTDOWN REQUIRED. Bearing temperature critical. Immediate inspection needed.',
        'root_cause': 'Bearing lubrication failure causing excessive friction',
        'recommended_parts': ['Main bearing assembly', 'Lubrication pump'],
        'safety_concerns': 'Risk of catastrophic failure. Evacuate area.',
        'additional_notes': 'Temperature rising rapidly. Previous readings showed gradual increase.'
    }
    
    print('Triggering first confirmation for Machine A...')
    result1 = await alert_manager.process_diagnosis('A', diagnosis, sensor_data)
    print(f'First confirmation result: {result1}')
    
    # Wait a moment then trigger second confirmation
    print('Waiting 2 seconds before second confirmation...')
    await asyncio.sleep(2)
    
    print('Triggering second confirmation...')
    result2 = await alert_manager.process_diagnosis('A', diagnosis, sensor_data)
    print(f'Second confirmation result: {result2}')
    
    # Check active alerts
    active_alerts = alert_manager.get_all_active_alerts()
    print(f'Active alerts: {len(active_alerts)}')
    for alert in active_alerts:
        print(f"  - {alert['alert_id']}: {alert['status']}")
    
    db.close()

if __name__ == "__main__":
    asyncio.run(trigger_anomaly())
