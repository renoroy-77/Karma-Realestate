<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'media_type' => 'required|in:photo,video,virtual_tour',
            'file' => [
                'nullable',
                'file',
                function ($attribute, $value, $fail) {
                    $mediaType = request()->input('media_type');
                    $ext = strtolower($value->getClientOriginalExtension() ?: '');
                    if ($mediaType === 'photo') {
                        $allowed = ['jpeg', 'jpg', 'png', 'webp'];
                        if (!in_array($ext, $allowed)) {
                            $fail('The photo must be a file of type: jpeg, jpg, png, webp.');
                        }
                    } elseif ($mediaType === 'video') {
                        $allowed = ['mp4', 'webm', 'mov', 'm4v', 'avi', 'mkv'];
                        if (!in_array($ext, $allowed)) {
                            $fail('The video must be a file of type: mp4, webm, mov, m4v.');
                        }
                    }
                },
                'max:102400', // 100MB max
            ],
            'video_url' => 'nullable|string|max:500',
            'is_cover' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ];
    }
}
