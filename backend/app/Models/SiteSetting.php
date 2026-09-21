<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $table = 'site_settings';

    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    /**
     * Get setting value by key, with optional default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (! $setting || $setting->value === null) {
            return $default;
        }

        $decoded = json_decode($setting->value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $setting->value;
    }

    /**
     * Set setting value by key.
     */
    public static function set(string $key, mixed $value, string $group = 'general'): self
    {
        $serialized = is_array($value) || is_object($value) ? json_encode($value) : (string) $value;

        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $serialized, 'group' => $group]
        );
    }

    /**
     * Get all settings as key => value dictionary.
     */
    public static function getAllKeyValues(): array
    {
        $all = static::all();
        $dict = [];

        foreach ($all as $item) {
            $decoded = json_decode($item->value, true);
            $dict[$item->key] = json_last_error() === JSON_ERROR_NONE ? $decoded : $item->value;
        }

        return $dict;
    }
}
