<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->index();
            $table->string('phone', 50)->nullable()->index();
            $table->string('locality')->nullable();
            $table->string('source', 50)->default('otp_verify')->index();
            $table->enum('status', ['new', 'contacted', 'interested', 'not_interested', 'closed'])->default('new')->index();
            $table->boolean('email_verified')->default(false);
            $table->timestamps();

            $table->index('created_at');
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
