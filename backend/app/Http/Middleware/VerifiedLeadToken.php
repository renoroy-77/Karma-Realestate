<?php

namespace App\Http\Middleware;

use App\Models\Lead;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class VerifiedLeadToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $mode = 'optional'): Response
    {
        $token = $request->header('X-Lead-Token') ?? $request->bearerToken() ?? $request->query('lead_token');

        $lead = null;

        if ($token) {
            try {
                $payload = json_decode(Crypt::decryptString($token), true);
                if (is_array($payload)) {
                    // Check token expiration (30 days)
                    $createdAt = $payload['created_at'] ?? null;
                    $isExpired = $createdAt && (now()->timestamp - (int) $createdAt > 30 * 86400);

                    if (! $isExpired) {
                        if (! empty($payload['lead_id'])) {
                            $lead = Lead::find($payload['lead_id']);

                            // If lead was merged and deleted, resolve to primary lead
                            if (! $lead) {
                                $mergedPrimaryId = DB::table('lead_merges')
                                    ->where('duplicate_lead_id', $payload['lead_id'])
                                    ->value('primary_lead_id');

                                if ($mergedPrimaryId) {
                                    $lead = Lead::find($mergedPrimaryId);
                                }
                            }
                        }

                        // Fallback to verified email if ID could not be resolved
                        if (! $lead && ! empty($payload['email'])) {
                            $lead = Lead::where('email', $payload['email'])->first();
                        }
                    }
                }
            } catch (\Exception $e) {
                // Token invalid or expired
            }
        }

        if ($mode === 'required' && ! $lead) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email via OTP to access this feature.',
            ], 401);
        }

        $request->attributes->set('verified_lead', $lead);

        return $next($request);
    }
}
