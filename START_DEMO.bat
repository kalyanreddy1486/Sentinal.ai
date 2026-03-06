@echo off
title SENTINEL AI - Real Data Demo
color 0A
echo.
echo  ===================================================
echo   SENTINEL AI - Cotton Ginning Press - LIVE DEMO
echo  ===================================================
echo.
echo  Starting real data test...
echo  WhatsApp alerts will fire to: +91 6302320907
echo.
echo  Press Ctrl+C to stop at any time
echo.
timeout /t 2 /nobreak >nul
python -X utf8 "%~dp0test_real_data.py" --mode demo
pause
