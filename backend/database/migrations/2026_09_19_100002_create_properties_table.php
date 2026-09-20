<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->enum('purpose', ['sale', 'rent', 'lease']);
            $table->enum('type', ['land', 'house', 'flat', 'warehouse', 'commercial']);
            $table->decimal('price', 15, 2);
            $table->string('price_basis', 50)->default('total'); // total, per_cent, per_sqft, per_month
            $table->boolean('negotiable')->default(false);
            $table->decimal('land_area', 10, 2)->nullable();
            $table->string('land_area_unit', 20)->default('cent'); // cent, acre, sqft
            $table->decimal('building_area_sqft', 10, 2)->nullable();
            $table->tinyInteger('bedrooms')->unsigned()->nullable();
            $table->tinyInteger('bathrooms')->unsigned()->nullable();
            $table->json('amenities')->nullable();
            $table->json('pros')->nullable();
            $table->json('cons')->nullable();
            $table->text('description')->nullable();
            $table->string('locality'); // Thottada, Talap, Payyanur
            $table->string('district', 100)->default('Kannur');
            $table->string('address_line', 500)->nullable(); // Exact address — MASKED for unverified
            $table->decimal('latitude', 10, 7)->nullable();  // GPS — MASKED for unverified
            $table->decimal('longitude', 10, 7)->nullable(); // GPS — MASKED for unverified
            $table->string('virtual_tour_url', 500)->nullable();
            $table->string('rera_number', 100)->nullable();
            $table->string('land_classification', 100)->nullable(); // Residential, Commercial, Agricultural
            $table->enum('status', ['available', 'under_negotiation', 'sold', 'rented', 'leased', 'delisted'])->default('available');
            $table->boolean('is_published')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('view_count')->default(0);

            // SEO Meta Tags
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();

            // Confidential Owner Information (Never public)
            $table->string('owner_name')->nullable();
            $table->string('owner_phone', 50)->nullable();
            $table->string('owner_email')->nullable();
            $table->text('owner_notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['purpose', 'type', 'status', 'is_published']);
            $table->index(['is_featured', 'is_published']);
            $table->index('locality');
            $table->index('price');
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
