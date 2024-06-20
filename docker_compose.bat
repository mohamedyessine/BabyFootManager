@echo off
REM Ensure Docker is running
docker info >nul 2>&1
if ERRORLEVEL 1 (
    echo Docker does not seem to be running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Navigate to the directory containing docker-compose.yml
cd /d "%~dp0"

REM Run Docker Compose
docker-compose up

pause
