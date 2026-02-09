/**
 * Google Calendar–style day view event layout.
 * Interval partitioning + smart expansion. Pure logic, no UI.
 */

export interface DayEventInput {
  id: string;
  title: string;
  start: number; // minutes from midnight (0–24*60)
  end: number;   // minutes from midnight
}

export interface DayEventLayoutResult {
  id: string;
  title: string;
  start: number;
  end: number;
  top: number;       // px
  height: number;    // px
  left: number;      // 0–100 (%)
  width: number;     // 0–100 (%)
  columnIndex: number;
  totalColumns: number;
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Step 1 — Sort by start, then by end.
 */
function sortEvents(events: DayEventInput[]): DayEventInput[] {
  return [...events].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.end - b.end;
  });
}

/**
 * Step 2 — Collision groups: events in the same group overlap in time (transitively).
 */
function buildCollisionGroups(sorted: DayEventInput[]): DayEventInput[][] {
  if (sorted.length === 0) return [];
  const groups: DayEventInput[][] = [];
  let currentGroup: DayEventInput[] = [sorted[0]];
  let groupMaxEnd = sorted[0].end;

  for (let i = 1; i < sorted.length; i++) {
    const ev = sorted[i];
    if (ev.start < groupMaxEnd) {
      currentGroup.push(ev);
      if (ev.end > groupMaxEnd) groupMaxEnd = ev.end;
    } else {
      groups.push(currentGroup);
      currentGroup = [ev];
      groupMaxEnd = ev.end;
    }
  }
  groups.push(currentGroup);
  return groups;
}

/**
 * Step 3 — Assign each event in a group to the first column where it doesn't
 * overlap the last event in that column.
 */
function assignColumns(group: DayEventInput[]): number[] {
  const columns: number[] = [];
  const lastEndByColumn: number[] = [];

  for (const ev of group) {
    let col = 0;
    while (col < lastEndByColumn.length && ev.start < lastEndByColumn[col]) {
      col++;
    }
    if (col === lastEndByColumn.length) {
      lastEndByColumn.push(ev.end);
    } else {
      lastEndByColumn[col] = ev.end;
    }
    columns.push(col);
  }
  return columns;
}

/**
 * Step 5 — Smart expansion: for each event, how many columns to the right
 * it can expand without colliding with another event in time.
 */
function expandWidth(
  group: DayEventInput[],
  columnIndices: number[],
  totalColumns: number,
  eventIndex: number
): number {
  const ev = group[eventIndex];
  const c = columnIndices[eventIndex];
  let expandCount = 0;
  for (let col = c + 1; col < totalColumns; col++) {
    const hasCollision = group.some(
      (other, i) =>
        columnIndices[i] === col && overlaps(
          { start: ev.start, end: ev.end },
          { start: other.start, end: other.end }
        )
    );
    if (hasCollision) break;
    expandCount++;
  }
  return 1 + expandCount;
}

/**
 * Reusable event layout for a 24h day view.
 * Uses pxPerMinute only for top/height; left/width are in %.
 */
export function computeDayEventLayout(
  events: DayEventInput[],
  pxPerMinute: number
): DayEventLayoutResult[] {
  if (events.length === 0) return [];

  const sorted = sortEvents(events);
  const groups = buildCollisionGroups(sorted);

  const results: DayEventLayoutResult[] = [];

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    const columnIndices = assignColumns(group);
    const totalColumns = Math.max(...columnIndices) + 1;
    const baseWidthPct = 100 / totalColumns;

    for (let e = 0; e < group.length; e++) {
      const ev = group[e];
      const col = columnIndices[e];
      const span = expandWidth(group, columnIndices, totalColumns, e);
      const widthPct = baseWidthPct * span;
      const leftPct = col * baseWidthPct;

      results.push({
        id: ev.id,
        title: ev.title,
        start: ev.start,
        end: ev.end,
        top: ev.start * pxPerMinute,
        height: Math.max((ev.end - ev.start) * pxPerMinute, 2),
        left: leftPct,
        width: widthPct,
        columnIndex: col,
        totalColumns,
      });
    }
  }

  return results;
}

/** Sample events for testing: full overlap, partial overlap, nested overlap, non-overlapping after group */
export const SAMPLE_DAY_EVENTS: DayEventInput[] = [
  { id: '1', title: 'Morning block', start: 2 * 60 + 30, end: 6 * 60 + 30 },           // 2:30–6:30
  { id: '2', title: 'Overlap A', start: 3 * 60 + 30, end: 14 * 60 + 45 },              // 3:30–2:45pm (nested with 1, partial with 3)
  { id: '3', title: 'Overlap B', start: 3 * 60 + 30, end: 7 * 60 + 30 },               // 3:30–7:30 (full overlap with 2 start)
  { id: '4', title: 'No overlap', start: 10 * 60 + 45, end: 14 * 60 + 45 },            // 10:45–2:45pm (nested in 2, same end)
  { id: '5', title: 'Later solo', start: 12 * 60 + 15, end: 16 * 60 + 15 },          // 12:15–4:15pm (partial with 2)
  { id: '6', title: 'Evening', start: 18 * 60, end: 20 * 60 },                       // 6–8pm (non-overlapping after group)
];
