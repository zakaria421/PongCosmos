#!/bin/bash

set -a  # Automatically export all variables
set +a  # Stop exporting

# Wait for the database to be ready
echo "Waiting For the Database........"
sleep 30
# Run migrations
echo "Running migrations..."

python3 manage.py makemigrations
python3 manage.py migrate

echo "Migrations applied successfully :)"
# Execute the provided command
exec "$@"
