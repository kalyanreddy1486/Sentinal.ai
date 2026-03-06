#!/usr/bin/env python3
"""
SENTINEL AI - Real Data Test Engine
====================================
Replays real ginning press sensor data row-by-row.
Each row in the CSV represents a 2-minute snapshot from the machine.

Modes:
  --mode real   Each row plays at the TRUE 2-minute cadence (120s wait)
  --mode demo   Each row plays every 10 seconds  (for judge presentation)
  --mode fast   Each row plays every 3 seconds   (quick local testing)

Usage:
  python test_real_data.py --mode demo     # recommended for judges
  python test_real_data.py --mode real     # real 2-min cadence
  python test_real_data.py --mode fast     # quick test
"""

import csv
import time
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

# Force UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── Load .env manually ────────────────────────────────────────────────────────
env_path = Path(__file__).parent / "backend" / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, val = line.partition("=")
                os.environ.setdefault(key.strip(), val.strip())

# ─── Twilio WhatsApp ────────────────────────────────────────────────────────────
try:
    from twilio.rest import Client as TwilioClient
    TWILIO_SID   = os.environ.get("TWILIO_ACCOUNT_SID", "")
    TWILIO_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM  = os.environ.get("TWILIO_PHONE_NUMBER", "whatsapp:+14155238886")
    TWILIO_TO    = "whatsapp:+916302320907"
    twilio_ok    = bool(TWILIO_SID and TWILIO_TOKEN)
    if twilio_ok:
        twilio = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
    print("[Twilio] Configured ✅" if twilio_ok else "[Twilio] NOT configured ❌")
except ImportError:
    twilio_ok = False
    print("[Twilio] Library not installed")

# ─── Ginning Press Thresholds ──────────────────────────────────────────────────
THRESHOLDS = {
    "pressure_bar": {
        "normal_min": 90,   "normal_max": 100,
        "warn_low":   85,   "warn_high":  105,
        "crit_low":   80,   "crit_high":  110,
        "unit": "bar",
    },
    "temperature_c": {
        "normal_min": 60,   "normal_max": 75,
        "warn_low":   55,   "warn_high":  80,
        "crit_low":   50,   "crit_high":  85,
        "unit": "°C",
    },
    "vibration_mm_s": {
        "normal_min": 1.5,  "normal_max": 3.0,
        "warn_low":   1.0,  "warn_high":  4.0,
        "crit_low":   0.5,  "crit_high":  4.0,   # >4 is anomaly
        "unit": "mm/s",
    },
    "rpm": {
        "normal_min": 1400, "normal_max": 1500,
        "warn_low":   1350, "warn_high":  1550,
        "crit_low":   1300, "crit_high":  1600,
        "unit": "RPM",
    },
}

SENSOR_LABELS = {
    "pressure_bar":   "Pressure  ",
    "temperature_c":  "Temp      ",
    "vibration_mm_s": "Vibration ",
    "rpm":            "RPM       ",
}

ANOMALY_REASONS = {
    "pressure_bar":   {
        "high": "Hydraulic overload — pressure too high",
        "low":  "Leakage or pump failure — pressure too low",
    },
    "temperature_c":  {
        "high": "Motor/hydraulic overheating — immediate shutdown risk",
        "low":  "Sensor fault — sudden temperature drop",
    },
    "vibration_mm_s": {
        "high": "Bearing failure / shaft misalignment / loose components",
        "low":  "Sensor issue — abnormally low vibration",
    },
    "rpm":            {
        "high": "Motor overspeed — belt slip or controller fault",
        "low":  "Motor underload — belt slip or mechanical fault",
    },
}


# ─── Helpers ───────────────────────────────────────────────────────────────────
def classify(sensor: str, value: float):
    """Returns ('NORMAL'|'WARNING'|'ANOMALY', direction, reason)"""
    t = THRESHOLDS[sensor]
    unit = t["unit"]

    if value > t["crit_high"] or value < t["crit_low"]:
        direction = "high" if value > t["crit_high"] else "low"
        reason = ANOMALY_REASONS[sensor][direction]
        return "ANOMALY", direction, reason

    if value > t["warn_high"] or value < t["warn_low"]:
        direction = "high" if value > t["warn_high"] else "low"
        reason = ANOMALY_REASONS[sensor][direction]
        return "WARNING", direction, reason

    return "NORMAL", None, None


def color(level: str) -> str:
    return {"NORMAL": "\033[92m", "WARNING": "\033[93m", "ANOMALY": "\033[91m"}.get(level, "")

RESET = "\033[0m"
BOLD  = "\033[1m"
CYAN  = "\033[96m"
WHITE = "\033[97m"


def send_whatsapp(message: str):
    if not twilio_ok:
        print("  [WhatsApp] Skipped - Twilio not configured")
        return
    try:
        msg = twilio.messages.create(
            from_=TWILIO_FROM,
            to=TWILIO_TO,
            body=message
        )
        print(f"  [WhatsApp] ✅ Sent  SID: {msg.sid}")
    except Exception as e:
        print(f"  [WhatsApp] ❌ Failed: {e}")


def build_whatsapp_message(row_num: int, ts: str, anomalies: list, warnings: list) -> str:
    lines = [
        "🚨 *SENTINEL AI — ALERT*",
        f"🏭 Machine: Cotton Ginning Press",
        f"🕐 Time   : {ts}",
        f"📊 Reading: #{row_num}",
        "",
    ]
    if anomalies:
        lines.append("🔴 *ANOMALIES DETECTED:*")
        for sensor, value, unit, reason in anomalies:
            lines.append(f"  • {sensor}: {value:.2f} {unit}")
            lines.append(f"    ↳ {reason}")
        lines.append("")
    if warnings:
        lines.append("🟡 *WARNINGS:*")
        for sensor, value, unit, reason in warnings:
            lines.append(f"  • {sensor}: {value:.2f} {unit}")
        lines.append("")
    lines.append("⚡ Action required immediately!")
    return "\n".join(lines)


def print_header():
    print(f"\n{BOLD}{CYAN}{'='*65}")
    print("  SENTINEL AI  —  Cotton Ginning Press  —  Real Data Test")
    print(f"{'='*65}{RESET}")
    print(f"  Thresholds:")
    print(f"    Pressure  : Normal 90–100 bar  | Anomaly <80 or >110 bar")
    print(f"    Temp      : Normal 60–75 °C    | Anomaly >85 °C")
    print(f"    Vibration : Normal 1.5–3 mm/s  | Warning >3, Anomaly >4 mm/s")
    print(f"    RPM       : Normal 1400–1500   | Anomaly <1300 or >1600")
    print(f"{'─'*65}{RESET}\n")


def print_reading(row_num: int, ts: str, readings: dict, results: dict):
    print(f"{BOLD}{WHITE}[#{row_num:>3}] {ts}{RESET}")
    for sensor in ["pressure_bar", "temperature_c", "vibration_mm_s", "rpm"]:
        val   = readings[sensor]
        level, direction, reason = results[sensor]
        t     = THRESHOLDS[sensor]
        lbl   = SENSOR_LABELS[sensor]
        unit  = t["unit"]
        c     = color(level)
        badge = f"{c}{level:<7}{RESET}"
        indicator = ""
        if direction == "high":
            indicator = "▲"
        elif direction == "low":
            indicator = "▼"
        print(f"  {lbl}: {c}{val:>8.2f} {unit:<5}{RESET}  [{badge}] {indicator}")
        if reason:
            print(f"           ↳ {c}{reason}{RESET}")


# ─── Main Loop ─────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="SENTINEL AI Real Data Test")
    parser.add_argument(
        "--mode",
        choices=["real", "demo", "fast"],
        default="demo",
        help="real=120s (2-min cadence), demo=10s (judges), fast=3s (testing)"
    )
    args = parser.parse_args()

    INTERVAL = {"real": 120, "demo": 10, "fast": 3}[args.mode]
    MODE_LABEL = {
        "real": "REAL-TIME  — 2-minute cadence (matches dataset)",
        "demo": "DEMO MODE  — 10-second cadence (judge presentation)",
        "fast": "FAST MODE  — 3-second cadence (quick test)",
    }[args.mode]

    csv_path = Path(__file__).parent / "real data file" / "ginning_press_machine_normal_200_rows.csv"
    if not csv_path.exists():
        print(f"ERROR: CSV not found at {csv_path}")
        sys.exit(1)

    print_header()
    print(f"  Dataset  : {csv_path.name}  (200 readings × 2-min gaps)")
    print(f"  Mode     : {MODE_LABEL}")
    print(f"  Interval : {INTERVAL}s between each reading")
    print(f"  WhatsApp : {'✅ Active — alerts will fire to +91 6302320907' if twilio_ok else '❌ Disabled'}")
    print(f"\n  Press Ctrl+C to stop\n")
    print(f"{'─'*65}\n")
    time.sleep(2)

    # Counters
    total = 0
    normal_count = 0
    warning_count = 0
    anomaly_count = 0
    whatsapp_sent = 0
    last_alert_time = 0   # epoch seconds — enforce 1 alert per 60 real seconds

    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            ts = row["timestamp"]

            readings = {
                "pressure_bar":   float(row["pressure_bar"]),
                "temperature_c":  float(row["temperature_c"]),
                "vibration_mm_s": float(row["vibration_mm_s"]),
                "rpm":            float(row["rpm"]),
            }

            # Classify each sensor
            results = {s: classify(s, v) for s, v in readings.items()}

            anomalies = [
                (SENSOR_LABELS[s].strip(), v, THRESHOLDS[s]["unit"], results[s][2])
                for s, v in readings.items()
                if results[s][0] == "ANOMALY"
            ]
            warnings = [
                (SENSOR_LABELS[s].strip(), v, THRESHOLDS[s]["unit"], results[s][2])
                for s, v in readings.items()
                if results[s][0] == "WARNING"
            ]

            if anomalies:
                anomaly_count += 1
            elif warnings:
                warning_count += 1
            else:
                normal_count += 1

            # Print reading to terminal
            print_reading(total, ts, readings, results)

            # ── Alert rule: ANOMALY only, max 1 WhatsApp per 60 real seconds ──
            now = time.time()
            time_since_last = now - last_alert_time

            if anomalies and time_since_last >= 60:
                last_alert_time = now
                msg = build_whatsapp_message(total, ts, anomalies, [])
                print(f"\n  {'─'*40}")
                print(f"  Sending WhatsApp ANOMALY alert...")
                send_whatsapp(msg)
                print(f"  {'─'*40}\n")
                whatsapp_sent += 1
            elif anomalies and time_since_last < 60:
                wait_left = int(60 - time_since_last)
                print(f"  [Alert cooldown: {wait_left}s remaining before next alert]\n")
            # Warnings are shown in terminal only — no WhatsApp

            # Summary line
            print(f"  Stats → Normal:{normal_count} | Warning:{warning_count} | Anomaly:{anomaly_count} | WA Sent:{whatsapp_sent}\n")

            # Wait before next reading (respects chosen mode cadence)
            try:
                time.sleep(INTERVAL)
            except KeyboardInterrupt:
                break

    print(f"\n{BOLD}{CYAN}{'='*65}")
    print(f"  TEST COMPLETE")
    print(f"{'─'*65}")
    print(f"  Total readings : {total}")
    print(f"  Normal         : {normal_count}  ({normal_count/total*100:.1f}%)")
    print(f"  Warning        : {warning_count}  ({warning_count/total*100:.1f}%)")
    print(f"  Anomaly        : {anomaly_count}  ({anomaly_count/total*100:.1f}%)")
    print(f"  WA Alerts sent : {whatsapp_sent}")
    print(f"{'='*65}{RESET}\n")


if __name__ == "__main__":
    main()
