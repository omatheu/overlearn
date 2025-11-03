'use client';

import { cn } from '@/lib/utils';

interface CalendarEventLike {
  metadata?: Record<string, unknown>;
}

interface CalendarEventMetadataProps {
  event: CalendarEventLike;
  className?: string;
}

export function CalendarEventMetadata({ event, className }: CalendarEventMetadataProps) {
  const metadata = event.metadata;

  if (!metadata) {
    return null;
  }

  const location = typeof metadata.location === 'string' ? metadata.location : null;
  const url = typeof metadata.url === 'string' ? metadata.url : null;
  const attendees = Array.isArray(metadata.attendees)
    ? metadata.attendees.filter((attendee): attendee is string => typeof attendee === 'string')
    : [];

  if (!location && !url && attendees.length === 0) {
    return null;
  }

  return (
    <div className={cn('ml-8 flex flex-col gap-1 text-xs text-muted-foreground', className)}>
      {location && <span>Local: {location}</span>}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline"
        >
          Abrir link
        </a>
      )}
      {attendees.length > 0 && (
        <span>Participantes: {attendees.join(', ')}</span>
      )}
    </div>
  );
}

