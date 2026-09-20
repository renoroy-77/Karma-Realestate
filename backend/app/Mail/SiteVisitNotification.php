<?php

namespace App\Mail;

use App\Models\SiteVisitRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SiteVisitNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public SiteVisitRequest $siteVisit,
    ) {}

    public function envelope(): Envelope
    {
        $title = $this->siteVisit->property ? $this->siteVisit->property->title : 'Property';

        return new Envelope(
            subject: 'New Site Visit Request: '.$title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.site_visit',
            with: [
                'visit' => $this->siteVisit,
                'property' => $this->siteVisit->property,
            ],
        );
    }
}
