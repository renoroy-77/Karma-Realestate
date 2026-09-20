#!/bin/bash
set -e

# Support dynamic port binding on Render ($PORT)
if [ ! -z "$PORT" ]; then
    sed -i "s/listen 8000/listen $PORT/g" /etc/nginx/http.d/default.conf
    sed -i "s/listen \[::\]:8000/listen \[::\]:$PORT/g" /etc/nginx/http.d/default.conf
fi

# Ensure public storage symlink exists
php artisan storage:link || true

# Clear cached configurations
php artisan config:clear || true
php artisan route:clear || true

# Run database migrations if DB is configured
if [ ! -z "$DATABASE_URL" ] || [ ! -z "$DB_HOST" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || true
    echo "Running database seeders..."
    php artisan db:seed --force || true
fi

# Start PHP-FPM in background
php-fpm -D

# Start Laravel Task Scheduler in background (free cron execution)
echo "Starting Laravel Task Scheduler..."
php artisan schedule:work &

# Start Nginx in foreground
echo "Starting Nginx web server..."
exec nginx -g "daemon off;"
