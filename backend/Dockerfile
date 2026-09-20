FROM php:8.4-fpm-alpine

# Install system dependencies and both MySQL & PostgreSQL drivers
RUN apk add --no-cache \
    nginx \
    curl \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    postgresql-dev \
    zip \
    unzip \
    bash \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql pdo_pgsql gd zip exif bcmath opcache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Install production PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

# Configure Nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Configure Entrypoint
RUN chmod +x entrypoint.sh

EXPOSE 8080 8000

CMD ["./entrypoint.sh"]
