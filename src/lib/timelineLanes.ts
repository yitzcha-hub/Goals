/**
 * Computes horizontal lane assignments for overlapping timeline events
 * so they appear side-by-side instead of stacked—making overlaps easily visible.
 */

export interface TimelineEvent {
  id: string;
  startTime: Date;
  endTime: Date;
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Assigns each event to a lane (0, 1, 2...) so overlapping events
 * get different lanes. Returns events with lane and totalLanes.
 */
export function assignEventLanes<T extends TimelineEvent>(
  events: T[]
): (T & { lane: number; totalLanes: number })[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const aStart = a.startTime.getTime();
    const bStart = b.startTime.getTime();
    if (aStart !== bStart) return aStart - bStart;
    return a.endTime.getTime() - b.endTime.getTime();
  });

  /** Per lane: list of (start, end) ranges already placed */
  const laneRanges: { start: number; end: number }[][] = [];
  const result: (T & { lane: number; totalLanes: number })[] = [];

  for (const ev of sorted) {
    const start = ev.startTime.getHours() + ev.startTime.getMinutes() / 60;
    const end = ev.endTime.getHours() + ev.endTime.getMinutes() / 60;
    const range = { start, end };

    let lane = 0;
    for (; lane < laneRanges.length; lane++) {
      const inLane = laneRanges[lane];
      const hasOverlap = inLane.some((r) => overlaps(range, r));
      if (!hasOverlap) break;
    }

    if (lane === laneRanges.length) {
      laneRanges.push([range]);
    } else {
      laneRanges[lane].push(range);
    }

    result.push({
      ...ev,
      lane,
      totalLanes: laneRanges.length,
    });
  }

  return result;
}
