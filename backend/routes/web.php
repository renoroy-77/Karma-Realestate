<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'KARMA Real Estate API',
        'status' => 'operational',
        'version' => '1.0.0',
        'sitemap' => url('/sitemap.xml'),
        'frontend' => config('app.frontend_url', 'http://localhost:3000'),
    ]);
});

Route::get('/robots.txt', function () {
    $sitemapUrl = url('/sitemap.xml');
    $content = "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nSitemap: {$sitemapUrl}\n";

    return response($content, 200, [
        'Content-Type' => 'text/plain; charset=UTF-8',
    ]);
});

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
