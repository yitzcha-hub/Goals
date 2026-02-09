import React, { useMemo } from 'react';
import { computeDayEventLayout, type DayEventInput, type DayEventLayoutResult } from '@/lib/dayEventLayout';

const PX_PER_MINUTE = 2;

export interface DayTimelineViewProps {
  events: DayEventInput[];
  showCurrentTime?: boolean;
  pxPerMinute?: number;
  eventColors?: Record<string, string>;
  onEventClick?: (id: string) => void;
  emptyMessage?: string;
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function formatTimeFromMinutes(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${min.toString().padStart(2, '0')}${period}`;
}

export function DayTimelineView({
  events,
  showCurrentTime = false,
  pxPerMinute = PX_PER_MINUTE,
  eventColors = {},
  onEventClick,
  emptyMessage = 'No schedule for this day',
}: DayTimelineViewProps) {
  const layout = useMemo(() => computeDayEventLayout(events, pxPerMinute), [events, pxPerMinute]);
  const totalHeight = 24 * 60 * pxPerMinute;
  const hourHeight = 60 * pxPerMinute;
  const quarterHeight = 15 * pxPerMinute;
  const currentTimeTop = useMemo(() => {
    if (!showCurrentTime) return null;
    const now = new Date();
    return (now.getHours() * 60 + now.getMinutes()) * pxPerMinute;
  }, [showCurrentTime, pxPerMinute]);

  return (
    <div className="flex w-full overflow-hidden rounded-b-xl">
      <div
        className="flex-shrink-0 flex flex-col border-r text-right pr-2 text-xs font-medium"
        style={{ width: 56, height: totalHeight, borderColor: 'var(--landing-border)', backgroundColor: 'var(--landing-accent)', color: 'var(--landing-text)' }}
      >
        {Array.from({ length: 25 }, (_, i) => (
          <div key={i} className="flex items-start justify-end pt-0.5" style={{ height: i === 24 ? 0 : hourHeight, opacity: i % 6 === 0 ? 1 : 0.65 }}>
            {i < 24 && formatHour(i)}
          </div>
        ))}
      </div>
      <div className="flex-1 relative overflow-auto min-w-0" style={{ height: totalHeight, backgroundColor: 'var(--landing-bg)' }}>
        {Array.from({ length: 24 * 4 + 1 }, (_, i) => (
          <div key={i} className="absolute left-0 right-0 border-b border-opacity-40" style={{ top: i * quarterHeight, height: 1, borderColor: 'var(--landing-border)' }} />
        ))}
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="absolute left-0 right-0 pointer-events-none" style={{ top: h * hourHeight, height: hourHeight, backgroundColor: h % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }} />
        ))}
        {currentTimeTop != null && (
          <div className="absolute left-0 right-0 z-10 pointer-events-none flex items-center" style={{ top: currentTimeTop - 1, height: 2 }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#dc2626', marginLeft: -4 }} />
            <div className="flex-1 h-0.5" style={{ backgroundColor: '#dc2626', boxShadow: '0 0 6px rgba(220,38,38,0.6)' }} />
          </div>
        )}
        {layout.map((ev: DayEventLayoutResult) => (
          <div
            key={ev.id}
            role={onEventClick ? 'button' : undefined}
            className="absolute rounded-md px-2 py-1.5 text-white shadow-sm flex flex-col justify-center min-h-[24px] overflow-hidden border-0 cursor-default transition-all duration-200 hover:shadow-md hover:z-10"
            style={{
              top: ev.top + 1,
              left: `${ev.left + 0.5}%`,
              width: `${ev.width - 1}%`,
              height: ev.height - 2,
              backgroundColor: eventColors[ev.id] || '#1a6b4f',
              cursor: onEventClick ? 'pointer' : 'default',
            }}
            title={`${ev.title} · ${formatTimeFromMinutes(ev.start)} – ${formatTimeFromMinutes(ev.end)}`}
            onClick={() => onEventClick?.(ev.id)}
          >
            <span className="font-medium text-sm truncate leading-tight">{ev.title}</span>
            <span className="text-xs opacity-90 mt-0.5 leading-tight">{formatTimeFromMinutes(ev.start)} – {formatTimeFromMinutes(ev.end)}</span>
          </div>
        ))}
        {events.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: 'var(--landing-text)', opacity: 0.5 }}>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DayTimelineView;
