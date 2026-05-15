const DATAVIEW_DATE_RE = /\bdue::(\d{4}-\d{2}-\d{2})\b/;
const TASKS_EMOJI_DATE_RE = /📅\s*(\d{4}-\d{2}-\d{2})/;
const BARE_ISO_DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/;

function isValidDate(isoDate: string): boolean {
  const d = new Date(isoDate + "T00:00:00");
  return !isNaN(d.getTime());
}

export function extractDate(line: string): string | null {
  const patterns = [DATAVIEW_DATE_RE, TASKS_EMOJI_DATE_RE, BARE_ISO_DATE_RE];

  for (const pattern of patterns) {
    const match = pattern.exec(line);
    if (match?.[1] && isValidDate(match[1])) {
      return match[1];
    }
  }

  return null;
}

export function stripDateAnnotations(line: string): string {
  return line
    .replace(DATAVIEW_DATE_RE, "")
    .replace(TASKS_EMOJI_DATE_RE, "")
    .replace(BARE_ISO_DATE_RE, "")
    .replace(/\s{2,}/g, " ")
    .trimEnd();
}
