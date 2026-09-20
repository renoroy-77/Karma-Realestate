<?php

namespace App\Enums;

enum LeadStatus: string
{
    case NEW = 'new';
    case CONTACTED = 'contacted';
    case INTERESTED = 'interested';
    case NOT_INTERESTED = 'not_interested';
    case CLOSED = 'closed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Priority weight for resolving statuses when merging leads.
     * Higher weight represents a further stage along the funnel.
     */
    public function priority(): int
    {
        return match ($this) {
            self::CLOSED => 5,
            self::INTERESTED => 4,
            self::CONTACTED => 3,
            self::NEW => 2,
            self::NOT_INTERESTED => 1,
        };
    }
}
