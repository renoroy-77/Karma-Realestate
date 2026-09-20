#!/bin/bash
set -e

# Support dynamic port binding for Render / Koyeb ($PORT)
if [ ! -z "$PORT" ]; then
    sed -i "s/listen 8000/listen $PORT/g" /etc/nginx/http.d/default.conf
    sed -i "s/listen \[::\]:8000/listen \[::\]:$PORT/g" /etc/nginx/http.d/default.conf
fi

# Ensure storage link exists
php artisan storage:link || true

# Clear cached configs for environment variables
php artisan config:clear || true
php artisan route:clear || true

# Auto-migrate if database is configured
if [ ! -z "$DB_HOST" ]; then
    echo "Running migrations..."
    php artisan migrate --force || true
fi

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
echo "Starting Nginx..."
exec nginx -g "daemon off;"
