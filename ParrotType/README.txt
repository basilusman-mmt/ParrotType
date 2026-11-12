PARROTTYPE

QUICK START ON WINDOWS

1. Extract the ParrotType folder.
2. Double-click run.bat.
3. Open http://127.0.0.1:8000 in your browser.

You can also run Django commands without changing directories:
- Open a terminal in the extracted ParrotType folder and run: py manage.py migrate
- Or run commands from any directory by giving manage.py its full path:
  py "C:\path\to\ParrotType\manage.py" migrate

The manage.py file is directly inside the ParrotType folder. There is no nested project folder.

The app uses SQLite by default. User accounts, test results, and profiles are stored locally in db.sqlite3.
The word list is stored in data/words.txt and contains 62,920 unique lowercase English words.

To create an admin account:
py manage.py createsuperuser

Admin page:
http://127.0.0.1:8000/admin/

Before deploying publicly, change SECRET_KEY, set DEBUG to False, and configure ALLOWED_HOSTS.
