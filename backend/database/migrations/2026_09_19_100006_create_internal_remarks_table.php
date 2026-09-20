<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->text('remark');
            $table->timestamps();

            $table->unique('property_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_remarks');
    }
};
