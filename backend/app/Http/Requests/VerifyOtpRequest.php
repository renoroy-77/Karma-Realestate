<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge([
                'email' => strtolower(trim((string) $this->input('email'))),
            ]);
        }
        if ($this->has('otp')) {
            $this->merge([
                'otp' => trim((string) $this->input('otp')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|max:255',
            'otp' => 'required|string|size:6',
        ];
    }
}
