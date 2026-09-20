<?php

namespace Database\Seeders;

use App\Models\AdminUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('ADMIN_SEED_PASSWORD');

        if (app()->isProduction()) {
            if (empty($password)) {
                throw new RuntimeException('ADMIN_SEED_PASSWORD environment variable must be explicitly configured in production.');
            }
        } else {
            $password = $password ?: 'KarmaAdmin@2026';
        }

        AdminUser::updateOrCreate(
            ['email' => env('ADMIN_SEED_EMAIL', 'admin@karmarealestate.in')],
            [
                'name' => 'KARMA Admin Team',
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );
    }
}
