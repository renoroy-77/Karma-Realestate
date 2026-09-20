<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'doc_type' => 'required|string|in:title_deed,ec,tax_receipt,possession_cert,owner_id,other',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600', // max 25MB
            'apply_watermark' => 'nullable|boolean',
        ];
    }
}
