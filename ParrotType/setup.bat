@echo off
cd /d "%~dp0"
py -m venv env
call env\Scripts\activate
py -m pip install -r requirements.txt
py manage.py migrate
pause
