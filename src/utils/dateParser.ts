const START_DATE_EMOJI_RE = /🛫\s*(\d{4}-\d{2}-\d{2})/;
const SCHEDULE_DATE_EMOJI_RE = /⏳\s*(\d{4}-\d{2}-\d{2})/;
const BARE_ISO_DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/;

function isValidDate(isoDate: string): boolean {
  const d = new Date(isoDate + "T00:00:00");
  return !isNaN(d.getTime());
}

export function extractScheduleDate(line: string): string | null {
  const match = SCHEDULE_DATE_EMOJI_RE.exec(line);
  if (match?.[1] && isValidDate(match[1])) {
    return match[1];
  }

  return null;
}

export function extractStartDate(line: string): string | null {
  const match = START_DATE_EMOJI_RE.exec(line);
  if (match?.[1] && isValidDate(match[1])) {
    return match[1];
  }

  return null;
}

export function stripDateAnnotations(line: string): string {
  return line
    .replace(SCHEDULE_DATE_EMOJI_RE, "")
    .replace(START_DATE_EMOJI_RE, "")
    .replace(BARE_ISO_DATE_RE, "")
    .replace(/\s{2,}/g, " ")
    .trimEnd();
}
