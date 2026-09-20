<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookSiteVisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'visitor_name' => 'required|string|max:255',
            'visitor_email' => 'required|email|max:255',
            'visitor_phone' => 'required|string|max:30',
            'preferred_date' => 'required|date|after_or_equal:today',
            'preferred_time_slot' => 'required|string|max:50',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
