import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { computeDayEventLayout, type DayEventInput, type DayEventLayoutResult } from '@/lib/dayEventLayout';
import { Clock } from 'lucide-react';

const PX_PER_MINUTE_DEFAULT = 1;
const SNAP_MINUTES = 15;
const MIN_EVENT_MINUTES = 15;
const DRAG_THRESHOLD_PX = 4;
const SHORT_HEIGHT_PX = 40;
const TINY_HEIGHT_PX = 22;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DayTimelineViewProps {
  events: DayEventInput[];
  showCurrentTime?: boolean;
  pxPerMinute?: number;
  eventColors?: Record<string, string>;
  /** Click on an event block → open detail popup */
  onEventClick?: (id: string) => void;
  /** Drag-to-move / drag-to-resize → update start/end */
  onEventUpdate?: (id: string, newStartMinutes: number, newEndMinutes: number) => void;
  /** Click on an empty time slot → open creation form */
  onSlotClick?: (startMinutes: number) => void;
  /** Highlight a specific event (e.g. the one being edited) */
  selectedEventId?: string | null;
  /** Max height of the scroll container (CSS value) */
  maxHeight?: string;
  emptyMessage?: string;
}

interface DragVisual {
  eventId: string;
  type: 'move' | 'resize';
  deltaPx: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function snap(minutes: number): number {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

function clampMins(v: number): number {
  return Math.max(0, Math.min(24 * 60, v));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DayTimelineView({
  events,
  showCurrentTime = false,
  pxPerMinute = PX_PER_MINUTE_DEFAULT,
  eventColors = {},
  onEventClick,
  onEventUpdate,
  onSlotClick,
  selectedEventId,
  maxHeight = 'min(2880px, 70vh)',
  emptyMessage = 'No schedule for this day',
}: DayTimelineViewProps) {
  /* ---- Layout computation (pure, memoised) ---- */
  const layout = useMemo(
    () => computeDayEventLayout(events, pxPerMinute),
    [events, pxPerMinute],
  );

  const totalHeight = 24 * 60 * pxPerMinute;
  const hourHeight = 60 * pxPerMinute;
  const quarterHeight = 15 * pxPerMinute;

  /* ---- Refs ---- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);
  const hadDragRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  /* ---- State ---- */
  const [currentTimeTop, setCurrentTimeTop] = useState<number | null>(null);
  const [hoverEventId, setHoverEventId] = useState<string | null>(null);
  const [dragVisual, setDragVisual] = useState<DragVisual | null>(null);

  /* ================================================================ */
  /*  1. Current-time marker — updates every 60 s                     */
  /* ================================================================ */
  useEffect(() => {
    if (!showCurrentTime) {
      setCurrentTimeTop(null);
      return;
    }
    const tick = () => {
      const now = new Date();
      setCurrentTimeTop((now.getHours() * 60 + now.getMinutes()) * pxPerMinute);
    };
    tick();
    const iv = setInterval(tick, 60_000);
    return () => clearInterval(iv);
  }, [showCurrentTime, pxPerMinute]);

  /* ================================================================ */
  /*  2. Auto-scroll to current time (once on mount)                  */
  /* ================================================================ */
  useEffect(() => {
    if (!hasAutoScrolled.current && currentTimeTop != null && scrollRef.current) {
      const ch = scrollRef.current.clientHeight;
      scrollRef.current.scrollTop = Math.max(0, currentTimeTop - ch / 3);
      hasAutoScrolled.current = true;
    }
  }, [currentTimeTop]);

  /* ================================================================ */
  /*  3. Cleanup drag listeners on unmount                            */
  /* ================================================================ */
  useEffect(() => () => { cleanupRef.current?.(); }, []);

  /* ================================================================ */
  /*  4. Drag-to-move / Drag-to-resize                                */
  /*     Uses a threshold so simple clicks are not hijacked.          */
  /* ================================================================ */
  const handlePointerDown = useCallback(
    (e: React.MouseEvent, eventId: string, type: 'move' | 'resize') => {
      if (!onEventUpdate) return;
      e.preventDefault();
      e.stopPropagation();

      const ev = events.find((x) => x.id === eventId);
      if (!ev) return;

      const startY = e.clientY;
      const startScroll = scrollRef.current?.scrollTop ?? 0;
      let active = false;

      /* ---- mousemove ---- */
      const onMove = (me: MouseEvent) => {
        const dy = me.clientY - startY;
        const ds = (scrollRef.current?.scrollTop ?? 0) - startScroll;
        const delta = dy + ds;

        if (!active && Math.abs(delta) > DRAG_THRESHOLD_PX) {
          active = true;
          document.body.style.userSelect = 'none';
          document.body.style.cursor =
            type === 'move' ? 'grabbing' : 'ns-resize';
        }
        if (active) {
          setDragVisual({ eventId, type, deltaPx: delta });
        }
      };

      /* ---- mouseup ---- */
      const onUp = (me: MouseEvent) => {
        teardown();

        if (!active) return; // was a click – let onClick handle it

        hadDragRef.current = true;
        // Reset flag after the click event that might follow in the
        // same event-loop tick has been processed.
        setTimeout(() => { hadDragRef.current = false; }, 0);

        const dy = me.clientY - startY;
        const ds = (scrollRef.current?.scrollTop ?? 0) - startScroll;
        const deltaMins = (dy + ds) / pxPerMinute;

        if (type === 'move') {
          const newStart = clampMins(snap(ev.start + deltaMins));
          const dur = ev.end - ev.start;
          const newEnd = clampMins(newStart + dur);
          if (newStart !== ev.start) onEventUpdate(eventId, newStart, newEnd);
        } else {
          const snapped = clampMins(snap(ev.end + deltaMins));
          const newEnd = Math.max(ev.start + MIN_EVENT_MINUTES, snapped);
          if (newEnd !== ev.end) onEventUpdate(eventId, ev.start, newEnd);
        }
      };

      /* ---- teardown ---- */
      const teardown = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        setDragVisual(null);
        cleanupRef.current = null;
      };

      cleanupRef.current = teardown;
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [events, onEventUpdate, pxPerMinute],
  );

  /* ================================================================ */
  /*  5. Click on empty slot → create new event                       */
  /* ================================================================ */
  const handleGridClick = useCallback(
    (e: React.MouseEvent) => {
      if (hadDragRef.current) return;
      if (!onSlotClick || !gridRef.current) return;
      if ((e.target as HTMLElement).closest('[data-event-block]')) return;

      const rect = gridRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const mins = clampMins(snap(y / pxPerMinute));
      onSlotClick(mins);
    },
    [onSlotClick, pxPerMinute],
  );

  /* ================================================================ */
  /*  6. Visual style per event (with drag override)                  */
  /* ================================================================ */
  const getStyle = useCallback(
    (ev: DayEventLayoutResult) => {
      let top = ev.top;
      let height = ev.height;

      if (dragVisual && dragVisual.eventId === ev.id) {
        if (dragVisual.type === 'move') {
          top += dragVisual.deltaPx;
        } else {
          height = Math.max(
            MIN_EVENT_MINUTES * pxPerMinute,
            height + dragVisual.deltaPx,
          );
        }
      }

      return { top: top + 1, height: Math.max(height - 2, 4) };
    },
    [dragVisual, pxPerMinute],
  );

  const isDragging = dragVisual != null;

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div
      ref={scrollRef}
      className="w-full overflow-y-auto rounded-b-xl"
      style={{ maxHeight }}
    >
      <div className="flex" style={{ minHeight: totalHeight }}>
        {/* ======== Hour labels (left column) ======== */}
        <div
          className="flex-shrink-0 flex flex-col border-r text-right pr-2 text-xs font-medium select-none"
          style={{
            width: 56,
            height: totalHeight,
            borderColor: 'var(--landing-border)',
            backgroundColor: 'var(--landing-accent)',
            color: 'var(--landing-text)',
          }}
        >
          {Array.from({ length: 25 }, (_, i) => (
            <div
              key={i}
              className="flex items-start justify-end pt-0.5"
              style={{
                height: i === 24 ? 0 : hourHeight,
                opacity: i % 6 === 0 ? 1 : 0.65,
              }}
            >
              {i < 24 && formatHour(i)}
            </div>
          ))}
        </div>

        {/* ======== Grid + events (right area) ======== */}
        <div
          ref={gridRef}
          className="flex-1 relative min-w-0"
          style={{
            height: totalHeight,
            backgroundColor: 'var(--landing-bg)',
            cursor: onSlotClick && !isDragging ? 'cell' : undefined,
          }}
          onClick={handleGridClick}
        >
          {/* ---- Quarter-hour grid lines ---- */}
          {Array.from({ length: 24 * 4 + 1 }, (_, i) => {
            const isHour = i % 4 === 0;
            return (
              <div
                key={i}
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: i * quarterHeight,
                  height: 1,
                  backgroundColor: isHour
                    ? 'var(--landing-border)'
                    : 'color-mix(in srgb, var(--landing-border) 35%, transparent)',
                }}
              />
            );
          })}

          {/* ---- Alternating hour shading ---- */}
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: h * hourHeight,
                height: hourHeight,
                backgroundColor:
                  h % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.018)',
              }}
            />
          ))}

          {/* ---- Current-time marker (highest z) ---- */}
          {currentTimeTop != null && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
              style={{ top: currentTimeTop - 1, height: 2 }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: '#dc2626',
                  marginLeft: -6,
                  boxShadow: '0 0 6px rgba(220,38,38,0.5)',
                }}
              />
              <div
                className="flex-1 h-0.5"
                style={{
                  backgroundColor: '#dc2626',
                  boxShadow: '0 0 8px rgba(220,38,38,0.4)',
                }}
              />
            </div>
          )}

          {/* ---- Event blocks ---- */}
          {layout.map((ev) => {
            const { top, height } = getStyle(ev);
            const color = eventColors[ev.id] || '#1a73e8';
            const isSelected = selectedEventId === ev.id;
            const isHovered = hoverEventId === ev.id && !isDragging;
            const isDraggingThis = dragVisual?.eventId === ev.id;
            const tiny = height < TINY_HEIGHT_PX;
            const short = height < SHORT_HEIGHT_PX;

            return (
              <div
                key={ev.id}
                data-event-block
                role={onEventClick ? 'button' : undefined}
                tabIndex={onEventClick ? 0 : undefined}
                className={[
                  'absolute rounded-md text-white overflow-hidden border-l-[3px] transition-shadow duration-150',
                  isDraggingThis
                    ? 'z-30 shadow-xl opacity-90'
                    : isSelected
                      ? 'z-20 ring-2 ring-white/60 shadow-lg'
                      : isHovered
                        ? 'z-10 shadow-md'
                        : 'shadow-sm',
                ].join(' ')}
                style={{
                  top,
                  left: `calc(${ev.left + 0.3}%)`,
                  width: `calc(${ev.width - 0.6}%)`,
                  height,
                  backgroundColor: color,
                  borderLeftColor: 'rgba(255,255,255,0.25)',
                  cursor: isDragging
                    ? undefined
                    : onEventUpdate
                      ? 'grab'
                      : onEventClick
                        ? 'pointer'
                        : 'default',
                  userSelect: 'none',
                }}
                title={`${ev.title}\n${formatTimeFromMinutes(ev.start)} – ${formatTimeFromMinutes(ev.end)}`}
                onMouseEnter={() => !isDragging && setHoverEventId(ev.id)}
                onMouseLeave={() => setHoverEventId(null)}
                onMouseDown={(e) => handlePointerDown(e, ev.id, 'move')}
                onClick={(e) => {
                  if (hadDragRef.current) return;
                  e.stopPropagation();
                  onEventClick?.(ev.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onEventClick?.(ev.id);
                  }
                }}
              >
                {/* ---- Adaptive content ---- */}
                {tiny ? (
                  <div className="px-1 flex items-center h-full">
                    <span className="text-[10px] font-semibold truncate leading-none drop-shadow-sm">
                      {ev.title}
                    </span>
                  </div>
                ) : short ? (
                  <div className="px-2 py-0.5 flex items-center gap-1.5 h-full">
                    <span className="font-semibold text-xs truncate leading-tight drop-shadow-sm">
                      {ev.title}
                    </span>
                    <span className="text-[10px] opacity-80 shrink-0 drop-shadow-sm">
                      {formatTimeFromMinutes(ev.start)}
                    </span>
                  </div>
                ) : (
                  <div className="px-2 py-1.5 flex flex-col justify-start min-h-0">
                    <span className="font-semibold text-sm truncate leading-tight drop-shadow-sm">
                      {ev.title}
                    </span>
                    <span className="text-xs opacity-90 mt-0.5 leading-tight drop-shadow-sm">
                      {formatTimeFromMinutes(ev.start)} –{' '}
                      {formatTimeFromMinutes(ev.end)}
                    </span>
                  </div>
                )}

                {/* ---- Resize handle (bottom edge) ---- */}
                {onEventUpdate && !tiny && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-2.5 cursor-ns-resize group/resize"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handlePointerDown(e, ev.id, 'resize');
                    }}
                  >
                    <div className="mx-auto w-8 h-1 rounded-full bg-white/30 group-hover/resize:bg-white/60 transition-colors mt-0.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* ---- Empty state ---- */}
          {events.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ color: 'var(--landing-text)', opacity: 0.5 }}
            >
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{emptyMessage}</p>
                {onSlotClick && (
                  <p className="text-xs mt-1 opacity-70">
                    Click anywhere on the timeline to schedule
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DayTimelineView;
