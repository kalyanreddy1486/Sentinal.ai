# SENTINEL AI - Project Implementation Steps

## Overview
This document breaks down the SENTINEL AI project into discrete, executable steps. Each step is self-contained and builds upon previous steps.

---

## Phase 1: Project Setup & Foundation

### Step 1: Initialize Project Structure
**Files to create:**
- `backend/` directory with FastAPI structure
- `frontend/` directory with React/Vite structure
- `requirements.txt` for Python dependencies
- `package.json` for Node dependencies
- `.env.example` for environment variables

**Key deliverables:**
- Working project scaffold
- Development environment ready
- Git repository initialized

---

### Step 2: Backend Core - FastAPI Setup
**Files to create:**
- `backend/main.py` - FastAPI app entry point
- `backend/config.py` - Configuration management
- `backend/database.py` - SQLite connection setup
- `backend/models/` - SQLAlchemy models

**Key deliverables:**
- FastAPI server running on localhost:8000
- SQLite database connected
- Health check endpoint working

---

### Step 3: Database Schema Design
**Files to modify/create:**
- `backend/models/machine.py` - Machine model
- `backend/models/alert.py` - Alert model
- `backend/models/mechanic.py` - Mechanic model
- `backend/models/sensor_reading.py` - Sensor data model

**Key deliverables:**
- All database tables created
- Relationships defined (machine → alerts, machine → mechanics)
- Migration script ready

---

### Step 4: WebSocket Infrastructure
**Files to create:**
- `backend/websocket/manager.py` - Connection manager
- `backend/websocket/machine_stream.py` - Machine data streaming

**Key deliverables:**
- WebSocket endpoint `/ws/machine/{id}` working
- Connection manager handles multiple clients
- Test client can receive messages

---

## Phase 2: Core Backend Logic

### Step 5: 3-Tier Monitoring Engine
**Files to create:**
- `backend/engine/tier_detector.py` - Tier classification logic
- `backend/engine/trend_analyzer.py` - Trend detection
- `backend/engine/monitoring_engine.py` - Main engine orchestrator

**Key deliverables:**
- Tier 1 (Normal): No AI calls
- Tier 2 (Trending): Math-based detection
- Tier 3 (Critical): Gemini trigger logic

---

### Step 6: Grok Integration - Data Simulation
**Files to create:**
- `backend/simulation/grok_client.py` - Grok API client
- `backend/simulation/machine_simulator.py` - Physics-based degradation
- `backend/simulation/presets.py` - Machine type presets

**Key deliverables:**
- Grok generates realistic sensor data
- 4 pre-configured machines (Turbine Alpha, Compressor Beta, Pump Gamma, Motor Delta)
- Degradation patterns based on machine type

---

### Step 7: Gemini Integration - Diagnosis Engine
**Files to create:**
- `backend/ai/gemini_client.py` - Gemini API client
- `backend/ai/diagnosis_engine.py` - Failure diagnosis logic
- `backend/ai/prompts.py` - Prompt templates

**Key deliverables:**
- Gemini receives sensor data + context
- Returns JSON diagnosis (failure_type, confidence, time_to_breach, action)
- 80% confidence threshold filter

---

### Step 8: Two-Confirmation Alert System
**Files to create:**
- `backend/alerts/confirmation_filter.py` - Two-confirmation logic
- `backend/alerts/alert_manager.py` - Alert lifecycle management

**Key deliverables:**
- First confirmation flags potential alert
- 60-second wait period
- Second confirmation triggers actual alert
- False positive tracking

---

## Phase 3: Alert & Notification System

### Step 9: Gmail SMTP Integration
**Files to create:**
- `backend/notifications/gmail_client.py` - SMTP client
- `backend/notifications/email_templates.py` - HTML email templates

**Key deliverables:**
- HTML diagnosis report sent via Gmail
- Configurable recipient list
- Email queue for reliability

---

### Step 10: Twilio WhatsApp Integration
**Files to create:**
- `backend/notifications/twilio_client.py` - Twilio API client
- `backend/notifications/whatsapp_templates.py` - Short message templates

**Key deliverables:**
- WhatsApp messages to mechanic phones
- Short urgent message format
- Delivery status tracking

---

### Step 11: Escalation Chain System
**Files to create:**
- `backend/alerts/escalation_engine.py` - Timer-based escalation
- `backend/alerts/escalation_rules.py` - Escalation rule definitions

**Key deliverables:**
- 15min → Supervisor
- 30min → Plant Manager
- 45min → Full escalation
- Auto-escalation on threshold breach during open alert

---

### Step 12: Mechanic Management
**Files to create:**
- `backend/api/mechanics.py` - CRUD endpoints for mechanics
- `backend/services/mechanic_assigner.py` - Assignment logic

**Key deliverables:**
- Assign mechanics to machines
- Get mechanic by machine ID
- Mechanic response tracking

---

## Phase 4: Smart Maintenance Scheduling

### Step 13: Maintenance Scheduler Core
**Files to create:**
- `backend/scheduler/scheduler_engine.py` - Main scheduling logic
- `backend/scheduler/shift_parser.py` - Shift schedule parser
- `backend/scheduler/impact_calculator.py` - Production impact calculator

**Key deliverables:**
- Parse shift schedules (06:00-14:00, 14:00-22:00)
- Identify maintenance windows (13:45, 21:45, weekends)
- Calculate production impact (LOW/MEDIUM/HIGH)

---

### Step 14: Gemini Maintenance Recommendations
**Files to create:**
- `backend/ai/maintenance_recommender.py` - Maintenance window recommender

**Key deliverables:**
- Gemini receives time_to_failure + shift schedule
- Returns optimal maintenance window
- Accounts for repair time needed

---

### Step 15: Shift Schedule Management
**Files to create/modify:**
- `backend/api/machines.py` - Add shift schedule endpoints
- `backend/models/shift_schedule.py` - Shift schedule model

**Key deliverables:**
- CRUD for shift schedules
- Link schedules to machines
- Validate schedule format

---

## Phase 5: Frontend Development

### Step 16: Frontend Setup - React + Vite
**Files to create:**
- `frontend/src/main.jsx` - React entry point
- `frontend/src/App.jsx` - Main app component
- `frontend/vite.config.js` - Vite configuration
- `frontend/tailwind.config.js` - Tailwind CSS setup

**Key deliverables:**
- React app running on localhost:5173
- Tailwind CSS configured
- Folder structure organized

---

### Step 17: Dashboard Layout & Navigation
**Files to create:**
- `frontend/src/components/Layout/Sidebar.jsx`
- `frontend/src/components/Layout/Header.jsx`
- `frontend/src/pages/Dashboard.jsx`

**Key deliverables:**
- Responsive sidebar navigation
- Header with system status
- Main content area for dashboard

---

### Step 18: Machine Cards & Health Rings
**Files to create:**
- `frontend/src/components/Machine/MachineCard.jsx`
- `frontend/src/components/Machine/HealthRing.jsx`
- `frontend/src/components/Machine/StatusBadge.jsx`

**Key deliverables:**
- Machine cards with health rings
- Color coding by tier (Green/Yellow/Red)
- Failure probability display

---

### Step 19: Real-Time Gauges (WebSocket)
**Files to create:**
- `frontend/src/hooks/useWebSocket.js` - WebSocket hook
- `frontend/src/components/Gauges/SensorGauge.jsx`
- `frontend/src/components/Gauges/LiveTelemetry.jsx`

**Key deliverables:**
- Live sensor gauges updating every 2 seconds
- Temperature, vibration, RPM, pressure displays
- WebSocket connection management

---

### Step 20: Alert Cards & Notifications
**Files to create:**
- `frontend/src/components/Alerts/AlertCard.jsx`
- `frontend/src/components/Alerts/AlertList.jsx`
- `frontend/src/components/Alerts/EscalationTimer.jsx`

**Key deliverables:**
- Alert cards with diagnosis info
- Red machine cards for critical alerts
- Countdown timer for escalation

---

### Step 21: Mechanic Response UI
**Files to create:**
- `frontend/src/components/Alerts/ResponseButtons.jsx`
- `frontend/src/components/Alerts/MechanicStatus.jsx`

**Key deliverables:**
- "On my way" button
- "False alarm" button
- "Already fixed" button
- "Need help" button

---

### Step 22: Maintenance Scheduler UI
**Files to create:**
- `frontend/src/components/Scheduler/MaintenanceWindow.jsx`
- `frontend/src/components/Scheduler/ProductionImpact.jsx`
- `frontend/src/components/Scheduler/ScheduleButton.jsx`

**Key deliverables:**
- Display recommended maintenance window
- Show production impact (LOW/MEDIUM/HIGH)
- One-tap schedule button

---

### Step 23: AI Copilot Chat (Claude)
**Files to create:**
- `frontend/src/components/Copilot/ChatWindow.jsx`
- `frontend/src/components/Copilot/ChatMessage.jsx`
- `frontend/src/hooks/useClaudeChat.js`

**Key deliverables:**
- Chat interface with Claude
- Live telemetry context in prompts
- Conversation history

---

### Step 24: Stress Test Simulator
**Files to create:**
- `frontend/src/components/Simulator/StressTestPanel.jsx`
- `frontend/src/components/Simulator/FaultSliders.jsx`
- `frontend/src/components/Simulator/PresetButtons.jsx`

**Key deliverables:**
- Fault injection sliders
- 4 preset scenarios
- Real-time effect on machines

---

### Step 25: Digital Twin Visualization
**Files to create:**
- `frontend/src/components/DigitalTwin/MachineSVG.jsx`
- `frontend/src/components/DigitalTwin/AnimationEngine.jsx`

**Key deliverables:**
- Animated SVG machine
- Color changes based on health
- Visual degradation indicators

---

### Step 26: Add New Machine Modal
**Files to create:**
- `frontend/src/components/Onboarding/AddMachineModal.jsx`
- `frontend/src/components/Onboarding/IndustryPresetSelector.jsx`
- `frontend/src/components/Onboarding/ShiftScheduleForm.jsx`

**Key deliverables:**
- Modal for adding machines
- Industry preset dropdown
- Shift schedule input
- Under 5-minute setup flow

---

### Step 27: ROI Calculator
**Files to create:**
- `frontend/src/components/ROI/ROICalculator.jsx`
- `frontend/src/components/ROI/SavingsChart.jsx`

**Key deliverables:**
- Fleet size input
- Downtime cost input
- Savings calculation display

---

### Step 28: Sensor Charts & History
**Files to create:**
- `frontend/src/components/Charts/SensorHistoryChart.jsx`
- `frontend/src/components/Charts/HealthTrendChart.jsx`

**Key deliverables:**
- Historical sensor data charts
- Health trend over time
- Export functionality

---

## Phase 6: Advanced Features

### Step 29: NASA CMAPSS Validation Mode
**Files to create:**
- `backend/validation/nasa_loader.py` - CMAPSS dataset loader
- `backend/validation/accuracy_scorer.py` - Accuracy calculator
- `backend/api/validation.py` - Validation endpoints
- `frontend/src/pages/ValidationMode.jsx`

**Key deliverables:**
- Load NASA CMAPSS FD001 dataset
- Replay real historical readings
- Compare Gemini diagnosis vs ground truth
- Display accuracy score

---

### Step 30: Alert History & Logging
**Files to create:**
- `frontend/src/pages/AlertHistory.jsx`
- `backend/api/alerts.py` - Alert history endpoints

**Key deliverables:**
- Full alert history view
- Gemini accuracy tracking
- False positive logging

---

### Step 31: Notification Log
**Files to create:**
- `frontend/src/pages/NotificationLog.jsx`
- `backend/models/notification_log.py`

**Key deliverables:**
- Email/WhatsApp sent log
- Delivery status tracking
- Retry history

---

## Phase 7: Deployment & Polish

### Step 32: Environment Configuration
**Files to create/modify:**
- `.env.production` - Production environment variables
- `backend/config.py` - Environment-based config
- `docker-compose.yml` - Container orchestration

**Key deliverables:**
- Production config separate from dev
- Docker containers for backend/frontend
- Environment variable documentation

---

### Step 33: Vercel Deployment (Frontend)
**Files to create:**
- `vercel.json` - Vercel configuration
- `.github/workflows/deploy-frontend.yml` - CI/CD pipeline

**Key deliverables:**
- Frontend deployed to Vercel
- Automatic deployments on push
- Custom domain configured (optional)

---

### Step 34: Railway Deployment (Backend)
**Files to create:**
- `railway.json` - Railway configuration
- `Procfile` - Process definition
- `.github/workflows/deploy-backend.yml` - CI/CD pipeline

**Key deliverables:**
- Backend deployed to Railway
- WebSocket support configured
- Database persistence

---

### Step 35: Integration Testing
**Files to create:**
- `tests/integration/test_websocket.py`
- `tests/integration/test_alert_flow.py`
- `tests/integration/test_scheduling.py`

**Key deliverables:**
- End-to-end WebSocket tests
- Alert lifecycle tests
- Maintenance scheduling tests

---

### Step 36: Performance Optimization
**Tasks:**
- Optimize WebSocket message size
- Implement API response caching
- Add database query optimization
- Frontend bundle optimization

**Key deliverables:**
- Dashboard latency < 200ms
- Bundle size minimized
- Database queries optimized

---

## Step Dependencies Graph

```
Phase 1: Foundation
├── Step 1 → Step 2 → Step 3 → Step 4

Phase 2: Core Backend
├── Step 5 → Step 6 → Step 7 → Step 8
│   (Step 6 & 7 can be parallel)

Phase 3: Notifications
├── Step 9 → Step 10 → Step 11 → Step 12
    (Step 9 & 10 can be parallel)

Phase 4: Scheduling
├── Step 13 → Step 14 → Step 15

Phase 5: Frontend
├── Step 16 → Step 17 → Step 18 → Step 19 → Step 20
├── Step 21, 22, 23, 24, 25, 26, 27, 28 (parallel after 20)

Phase 6: Advanced
├── Step 29 → Step 30 → Step 31

Phase 7: Deploy
├── Step 32 → Step 33 → Step 34 → Step 35 → Step 36
```

---

## Quick Start Options

### Option A: Hackathon Demo (Minimum Viable)
**Steps:** 1-7, 9, 16-20, 22, 24, 33-34
**Time estimate:** 2-3 days
**Features:** Core monitoring, basic alerts, dashboard, stress test

### Option B: Full Hackathon Submission
**Steps:** 1-15, 16-28, 29, 33-34
**Time estimate:** 5-7 days
**Features:** Complete backend, full frontend, NASA validation, deployed

### Option C: Production Ready
**Steps:** All 36 steps
**Time estimate:** 3-4 weeks
**Features:** Full feature set, tested, optimized, production-hardened

---

## Next Steps

1. Review the steps above
2. Choose your target (Option A, B, or C)
3. Tell me which **Step #** to start with
4. I will implement that step completely before moving to the next
