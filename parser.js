/**
 * parser.js — Theta Tau Pi Points Tracker
 * Spec version: 1.0.1
 *
 * Pure data-transformation functions only.
 * File I/O and SheetJS calls live in main.js.
 *
 * Exports (globals):
 *   parseAttendanceValue(raw) → { type, count }
 *   isTotalsRow(row)          → boolean
 *   buildMembersFromRows(rows) → MemberRecord[]
 *
 * MemberRecord shape:
 * {
 *   name: string,
 *   classYear: string,
 *   attendance: {
 *     [category: string]: {
 *       attended:   number,
 *       excused:    number,
 *       absent:     number,
 *       applicable: boolean
 *     }
 *   }
 * }
 */

// ─── Row indices (0-based) ───────────────────────────────────────────────────
const ROW_CATEGORIES    = 2;
const ROW_MEMBERS_START = 3;

// ─── Column indices (0-based) ────────────────────────────────────────────────
const COL_MEMBER_NAME  = 0;
const COL_CLASS_YEAR   = 1;
const COL_EVENTS_START = 2;

// ─── Attendance value parser ─────────────────────────────────────────────────

/**
 * Parse a single attendance cell value into a structured result.
 *
 * @param {*} raw - Raw cell value from SheetJS (string, number, or undefined)
 * @returns {{ type: 'attended'|'absent'|'excused'|'na', count: number }}
 */
function parseAttendanceValue(raw) {
  if (raw === undefined || raw === null) {
    return { type: "na", count: 0 };
  }

  const cell = String(raw).trim();

  if (cell === "---") {
    return { type: "na", count: 0 };
  }

  if (cell.toLowerCase() === "excused") {
    return { type: "excused", count: 1 };
  }

  if (cell.toLowerCase() === "present") {
    return { type: "attended", count: 1 };
  }

  if (cell.toLowerCase() === "absent") {
    return { type: "absent", count: 1 };
  }

  // X / Y  (Request Points format)
  const pointsMatch = cell.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (pointsMatch) {
    const earned = parseFloat(pointsMatch[1]);
    if (earned === 0) return { type: "absent", count: 1 };
    return { type: "attended", count: earned };
  }

  console.warn(`[parser] Unrecognised attendance value: "${cell}" — treating as absent`);
  return { type: "absent", count: 1 };
}

// ─── Totals-row detection ────────────────────────────────────────────────────

/**
 * Returns true if this row should be skipped (totals row or blank name).
 *
 * @param {Array} row
 * @returns {boolean}
 */
function isTotalsRow(row) {
  const nameCell = row[COL_MEMBER_NAME];
  if (nameCell === undefined || nameCell === null || String(nameCell).trim() === "") {
    return true;
  }
  return String(nameCell).toLowerCase().includes("total");
}

// ─── Row → MemberRecord[] ────────────────────────────────────────────────────

/**
 * Transform a 2-D array of raw sheet rows into MemberRecord objects.
 * This is the pure core — no File or XLSX calls here.
 *
 * @param {Array<Array>} rows - Output of XLSX.utils.sheet_to_json({ header: 1 })
 * @returns {MemberRecord[]}
 */
function buildMembersFromRows(rows) {
  if (rows.length <= ROW_MEMBERS_START) {
    throw new Error("Spreadsheet has no member rows.");
  }

  // Trim all category headers once up front
  const categoryRow = rows[ROW_CATEGORIES] || [];
  const categories = categoryRow.map((c) =>
    c !== undefined && c !== null ? String(c).trim() : ""
  );

  const members = [];
  

  for (let rowIdx = ROW_MEMBERS_START; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    if (!row || isTotalsRow(row)) continue;

    const name      = String(row[COL_MEMBER_NAME] ?? "").trim();
    const classYear = String(row[COL_CLASS_YEAR]  ?? "").trim();
    if (!name) continue;

    const attendance = {};

    for (let colIdx = COL_EVENTS_START; colIdx < row.length; colIdx++) {
      const category = categories[colIdx];
      if (!category) continue;

      if (!attendance[category]) {
        attendance[category] = { attended: 0, excused: 0, absent: 0, applicable: false };
      }

      const parsed = parseAttendanceValue(row[colIdx]);

      switch (parsed.type) {
        case "attended":
          attendance[category].attended   += parsed.count;
          attendance[category].applicable  = true;
          break;
        case "excused":
          attendance[category].excused    += parsed.count;
          attendance[category].applicable  = true;
          break;
        case "absent":
          attendance[category].absent     += parsed.count;
          attendance[category].applicable  = true;
          break;
        case "na":
          break;
      }
    }

    members.push({ name, classYear, attendance });
  }

  return members;
}