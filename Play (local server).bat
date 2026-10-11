@echo off
rem Alternative launcher: serves the game at http://localhost:8000 using Python.
cd /d "%~dp0"
start "" http://localhost:8000
python -m http.server 8000
