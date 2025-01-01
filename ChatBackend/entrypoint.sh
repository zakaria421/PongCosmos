#!/bin/bash
set -a  # Automatically export all variables

# source env/.env

set +a  # Stop exporting

# Wait for the database to be ready
sleep 30


python3 manage.py makemigrations
python3 manage.py migrate
exec daphne -b 0.0.0.0 -p 8002 chatapp.asgi:application