#!/bin/bash

set -a  # Automatically export all variables
set +a  # Stop exporting

# Wait for the database to be ready
wait-for-it db:5432 --timeout=30 --strict -- echo "Database is ready!"

# Check and drop the conflicting sequence if it exists
echo "Checking for conflicting sequences..."
python3 manage.py dbshell <<EOF
DO \$\$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'django_admin_log_id_seq') THEN
       EXECUTE 'DROP SEQUENCE django_admin_log_id_seq';
   END IF;
END;
\$\$;
EOF
echo "Sequence conflict resolved (if any)."

# Run migrations
echo "Running migrations..."
python3 manage.py makemigrations
python3 manage.py migrate

# Execute the provided command
exec "$@"
