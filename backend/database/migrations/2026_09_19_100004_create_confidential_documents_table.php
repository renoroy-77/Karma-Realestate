<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('confidential_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('doc_type', 50); // title_deed, ec, tax_receipt, possession_cert, owner_id, other
            $table->string('original_filename');
            $table->string('stored_path', 500); // Path inside storage/app/confidential/
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size_bytes');
            $table->boolean('is_watermarked')->default(true);
            $table->timestamps();

            $table->index('property_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('confidential_documents');
    }
};
