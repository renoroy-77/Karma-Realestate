<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Admin login with Sanctum bearer token issuance.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $admin = AdminUser::where('email', $request->email)->first();

        if (! $admin || ! Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid admin credentials provided.'],
            ]);
        }

        if (! $admin->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your admin account has been deactivated.',
            ], 403);
        }

        $admin->update(['last_login_at' => now()]);

        // Generate Sanctum token
        $token = $admin->createToken('admin-token', ['*'])->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
                'last_login_at' => $admin->last_login_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Revoke active admin token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get authenticated admin profile.
     */
    public function me(Request $request): JsonResponse
    {
        $admin = $request->user();

        return response()->json([
            'success' => true,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
                'last_login_at' => $admin->last_login_at?->toISOString(),
            ],
        ]);
    }
}
