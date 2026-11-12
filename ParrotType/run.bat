@echo off
cd /d "%~dp0"

if not exist env (
    py -m venv env
)

call env\Scripts\activate

pip install -r requirements.txt
py manage.py migrate
py manage.py runserver

pause