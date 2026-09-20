<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    /**
     * Generate dynamic XML sitemap for search engines with 24-hour cache.
     * Cache is automatically invalidated when listings are published/updated.
     */
    public function index(): Response
    {
        $xml = Cache::remember('sitemap_xml', 86400, function () {
            $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');

            // Static pages matching active React Router routes
            $staticPages = [
                [
                    'loc' => $frontendUrl.'/',
                    'lastmod' => now()->toAtomString(),
                    'changefreq' => 'daily',
                    'priority' => '1.0',
                ],
                [
                    'loc' => $frontendUrl.'/properties',
                    'lastmod' => now()->toAtomString(),
                    'changefreq' => 'daily',
                    'priority' => '0.9',
                ],
                [
                    'loc' => $frontendUrl.'/about',
                    'lastmod' => now()->subDays(7)->toAtomString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.7',
                ],
                [
                    'loc' => $frontendUrl.'/privacy-policy',
                    'lastmod' => now()->subDays(30)->toAtomString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.5',
                ],
            ];

            // Published properties matching frontend route /kannur/:type/:slug
            $properties = Property::query()
                ->where('is_published', true)
                ->whereIn('status', ['available', 'under_negotiation'])
                ->select(['type', 'slug', 'updated_at'])
                ->orderByDesc('updated_at')
                ->get();

            $propertyUrls = $properties->map(function ($property) use ($frontendUrl) {
                return [
                    'loc' => $frontendUrl.'/kannur/'.$property->type.'/'.$property->slug,
                    'lastmod' => ($property->updated_at ?? now())->toAtomString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.8',
                ];
            });

            $urls = array_merge($staticPages, $propertyUrls->all());

            $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

            foreach ($urls as $url) {
                $xml .= "  <url>\n";
                $xml .= '    <loc>'.htmlspecialchars($url['loc'], ENT_XML1, 'UTF-8')."</loc>\n";
                $xml .= '    <lastmod>'.$url['lastmod']."</lastmod>\n";
                $xml .= '    <changefreq>'.$url['changefreq']."</changefreq>\n";
                $xml .= '    <priority>'.$url['priority']."</priority>\n";
                $xml .= "  </url>\n";
            }

            $xml .= '</urlset>';

            return $xml;
        });

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }
}
