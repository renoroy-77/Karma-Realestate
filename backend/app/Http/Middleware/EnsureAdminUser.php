<?php

namespace App\Http\Middleware;

use App\Models\AdminUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminUser
{
    /**
     * Handle an incoming request.
     *
     * Ensure the authenticated Sanctum entity is an active AdminUser.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof AdminUser || ! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin privileges required.',
            ], 403);
        }

        return $next($request);
    }
}
