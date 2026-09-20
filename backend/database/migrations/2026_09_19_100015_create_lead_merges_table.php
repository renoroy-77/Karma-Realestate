<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lead_merges', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('duplicate_lead_id')->index();
            $table->foreignId('primary_lead_id')->constrained('leads')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_merges');
    }
};
