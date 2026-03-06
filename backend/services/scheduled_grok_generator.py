"""
Scheduled Grok Data Generator Service.
Generates sensor data for all machines every 2 minutes using Grok AI.
"""

import asyncio
from typing import Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from database import SessionLocal
from models.machine import Machine
from models.sensor_reading import SensorReading
from simulation.grok_client import grok_client
from simulation.presets import get_machine_preset
from websocket.manager import ConnectionManager
from engine.monitoring_engine import MonitoringEngine
from alerts.alert_manager import alert_manager
from ai.gemini_client import gemini_client


class ScheduledGrokGenerator:
    """
    Background service that generates sensor data for all machines every 2 minutes.
    Uses Grok AI for physics-based degradation simulation.
    """
    
    def __init__(self, connection_manager: Optional[ConnectionManager] = None):
        self.connection_manager = connection_manager
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.interval_seconds = 120  # 2 minutes
        self.machine_states: Dict[str, Dict] = {}  # Track current state per machine
        
    async def start(self):
        """Start the scheduled generator."""
        if self.running:
            return
            
        self.running = True
        self.task = asyncio.create_task(self._generation_loop())
        print(f"[GrokScheduler] Started - generating data every {self.interval_seconds}s")
        
    async def stop(self):
        """Stop the scheduled generator."""
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        print("[GrokScheduler] Stopped")
        
    async def _generation_loop(self):
        """Main loop that generates data every 2 minutes."""
        while self.running:
            try:
                await self._generate_for_all_machines()
            except Exception as e:
                print(f"[GrokScheduler] Error in generation loop: {e}")
                
            # Wait for next interval
            await asyncio.sleep(self.interval_seconds)
            
    async def _generate_for_all_machines(self):
        """Generate sensor data for all active machines."""
        db = SessionLocal()
        try:
            # Get all machines from database
            machines = db.query(Machine).all()
            
            if not machines:
                print("[GrokScheduler] No machines found")
                return
                
            print(f"[GrokScheduler] Generating data for {len(machines)} machines...")
            
            for machine in machines:
                await self._generate_for_machine(db, machine)
                
            print(f"[GrokScheduler] Generation complete for {len(machines)} machines")
            
        finally:
            db.close()
            
    async def _generate_for_machine(self, db: Session, machine: Machine, force_critical: bool = False):
        """Generate sensor data for a single machine using Grok."""
        try:
            machine_id = machine.machine_id
            
            # Get or initialize machine state
            if machine_id not in self.machine_states:
                self.machine_states[machine_id] = {
                    "reading_count": 0,
                    "degradation_factor": 1.0,
                    "current_values": self._get_initial_values(machine)
                }
            
            state = self.machine_states[machine_id]
            state["reading_count"] += 1
            
            # Increase degradation factor slowly over time
            if state["reading_count"] % 10 == 0:
                state["degradation_factor"] += 0.05
            
            # Generate data using Grok
            new_values = await grok_client.generate_sensor_data(
                machine_type=machine.type,
                current_values=state["current_values"],
                degradation_factor=state["degradation_factor"],
                reading_number=state["reading_count"]
            )
            
            # FORCE CRITICAL VALUES for testing alerts
            if force_critical or state["reading_count"] % 5 == 0:  # Every 5th reading is critical
                # Set temperature to critical level (above 90% of threshold)
                if "temperature" in new_values:
                    new_values["temperature"] = 102.0  # Critical threshold is around 105
                if "vibration" in new_values:
                    new_values["vibration"] = 4.5  # Critical threshold around 5.0
                if "rpm" in new_values:
                    new_values["rpm"] = 3950  # Critical threshold around 4000
                print(f"[GrokScheduler] {machine.name}: FORCED CRITICAL VALUES for alert testing")
            
            # Update state with new values
            state["current_values"] = new_values
            
            # Store in database
            sensor_reading = SensorReading(
                machine_id=machine.id,
                timestamp=datetime.utcnow(),
                data_source="grok",
                reading_number=state["reading_count"],
                degradation_factor=state["degradation_factor"],
                sensor_values=new_values
            )
            db.add(sensor_reading)
            
            # Update machine status
            machine.last_reading_at = datetime.utcnow()
            self._update_machine_health(machine, new_values)
            
            # Run 3-tier monitoring analysis
            await self._run_monitoring_analysis(db, machine, new_values)
            
            db.commit()
            
            # Broadcast via WebSocket if available
            if self.connection_manager:
                await self._broadcast_data(machine, new_values, state)
                
            print(f"[GrokScheduler] {machine.name}: Generated reading #{state['reading_count']}")
            
        except Exception as e:
            print(f"[GrokScheduler] Error generating for {machine.name}: {e}")
            db.rollback()
            
    def _get_initial_values(self, machine: Machine) -> Dict:
        """Get initial sensor values based on machine preset or config."""
        # Try to get from preset
        preset = get_machine_preset(machine.type)
        if preset and "degradation_profile" in preset:
            return {
                sensor: profile["base"]
                for sensor, profile in preset["degradation_profile"].items()
            }
        
        # Fallback: use machine's sensor configuration
        if machine.thresholds:
            sensors = list(machine.thresholds.keys())
            return {sensor: 50.0 for sensor in sensors}  # Default base value
        
        # Ultimate fallback
        return {"temperature": 75.0, "vibration": 2.0, "rpm": 3000, "pressure": 90.0}
        
    def _update_machine_health(self, machine: Machine, sensor_values: Dict):
        """Update machine health score based on sensor values."""
        if not machine.thresholds:
            return
            
        total_deviation = 0
        sensor_count = 0
        
        for sensor, value in sensor_values.items():
            if sensor in machine.thresholds:
                threshold = machine.thresholds[sensor]
                max_val = threshold.get("max", value * 1.2)
                min_val = threshold.get("min", value * 0.8)
                
                # Calculate deviation from normal range
                if "normal_ranges" in machine.normal_ranges and sensor in machine.normal_ranges:
                    normal = machine.normal_ranges[sensor]
                    normal_high = normal.get("high", max_val)
                    normal_low = normal.get("low", min_val)
                else:
                    normal_high = max_val * 0.9
                    normal_low = min_val * 1.1
                
                if value > normal_high:
                    deviation = (value - normal_high) / (max_val - normal_high)
                elif value < normal_low:
                    deviation = (normal_low - value) / (normal_low - min_val)
                else:
                    deviation = 0
                    
                total_deviation += min(deviation, 1.0)
                sensor_count += 1
        
        if sensor_count > 0:
            avg_deviation = total_deviation / sensor_count
            machine.health_score = max(0, min(100, 100 - (avg_deviation * 100)))
            machine.failure_probability = min(100, avg_deviation * 100 * 1.5)
            
    async def _broadcast_data(self, machine: Machine, sensor_values: Dict, state: Dict):
        """Broadcast generated data via WebSocket."""
        if not self.connection_manager:
            return
            
        data = {
            "machine_id": machine.machine_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data_source": "grok",
            "sensors": sensor_values,
            "reading_number": state["reading_count"],
            "degradation_factor": state["degradation_factor"],
            "health_score": machine.health_score,
            "failure_probability": machine.failure_probability,
            "tier": {
                "level": machine.current_tier,
                "label": self._get_tier_label(machine.current_tier)
            }
        }
        
        await self.connection_manager.send_to_machine_subscribers(
            machine.machine_id, data
        )
        
    def _get_tier_label(self, tier_level: int) -> str:
        """Get tier label from level."""
        labels = {1: "NORMAL", 2: "TRENDING", 3: "CRITICAL"}
        return labels.get(tier_level, "UNKNOWN")
        
    async def trigger_immediate(self, machine_id: Optional[str] = None):
        """Trigger immediate generation for one or all machines."""
        db = SessionLocal()
        try:
            if machine_id:
                machine = db.query(Machine).filter(Machine.machine_id == machine_id).first()
                if machine:
                    await self._generate_for_machine(db, machine)
            else:
                await self._generate_for_all_machines()
        finally:
            db.close()
            
    async def _run_monitoring_analysis(self, db: Session, machine: Machine, sensor_values: Dict):
        """Run 3-tier monitoring and trigger alerts if critical."""
        try:
            # Initialize monitoring engine for this machine
            thresholds = machine.thresholds or {}
            normal_ranges = machine.normal_ranges or {}
            
            engine = MonitoringEngine(
                machine_id=machine.machine_id,
                thresholds=thresholds,
                normal_ranges=normal_ranges
            )
            
            # Build reading
            reading = {
                'timestamp': datetime.utcnow().isoformat(),
                'sensors': sensor_values
            }
            
            # Process through 3-tier system
            result = engine.process_reading(reading)
            
            # Update machine tier
            machine.current_tier = result['tier']['level']
            
            # Check if Gemini was triggered (Tier 3 - Critical)
            if result.get('gemini_triggered'):
                print(f"[GrokScheduler] {machine.name}: TIER 3 CRITICAL - Triggering Gemini diagnosis")
                
                # Get diagnosis from Gemini
                diagnosis = await gemini_client.diagnose_failure(
                    machine_id=machine.machine_id,
                    machine_type=machine.type,
                    sensor_data=sensor_values,
                    tier_info=result['tier']
                )
                
                # Process through alert manager (2-confirmation system)
                alert_manager.db = db
                alert_result = await alert_manager.process_diagnosis(
                    machine_id=machine.machine_id,
                    diagnosis=diagnosis,
                    sensor_data=sensor_values
                )
                
                print(f"[GrokScheduler] Alert result: {alert_result['status']}")
                
        except Exception as e:
            print(f"[GrokScheduler] Monitoring analysis error: {e}")
    
    def get_status(self) -> Dict:
        """Get current scheduler status."""
        return {
            "running": self.running,
            "interval_seconds": self.interval_seconds,
            "machines_tracked": len(self.machine_states),
            "machine_ids": list(self.machine_states.keys())
        }


# Global scheduler instance
scheduled_grok_generator = ScheduledGrokGenerator()
