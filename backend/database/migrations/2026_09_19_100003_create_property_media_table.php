<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->enum('media_type', ['photo', 'video', 'virtual_tour']);
            $table->string('original_path', 500)->nullable();
            $table->string('thumb_path', 500)->nullable();   // 400px WebP
            $table->string('medium_path', 500)->nullable();  // 800px WebP
            $table->string('full_path', 500)->nullable();    // 1600px WebP
            $table->string('video_url', 500)->nullable();    // YouTube/external link
            $table->boolean('is_cover')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['property_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_media');
    }
};
