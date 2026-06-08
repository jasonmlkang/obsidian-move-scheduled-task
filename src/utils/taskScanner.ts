import { extractScheduleDate, extractStartDate } from "./dateParser";
import type { TaskMatch } from "../types";

const INCOMPLETE_TASK_RE = /^(\s*)-\s\[\s\]\s(.+)$/;
const CODE_FENCE_RE = /^```/;

function indentOf(line: string): number {
  return line.match(/^(\s*)/)?.[1]?.length ?? 0;
}

function collectNested(
  lines: string[],
  taskIndex: number
): { lineIndex: number; lineText: string }[] {
  const taskIndent = indentOf(lines[taskIndex] ?? "");
  const nested: { lineIndex: number; lineText: string }[] = [];
  for (let j = taskIndex + 1; j < lines.length; j++) {
    const next = lines[j] ?? "";
    if (next.trim() === "" || indentOf(next) <= taskIndent) break;
    nested.push({ lineIndex: j, lineText: next });
  }
  return nested;
}

export function findScheduledTasks(
  content: string,
  tag: string,
  sourcePath: string,
  today: string = new Date().toISOString().slice(0, 10)
): TaskMatch[] {
  const lines = content.split("\n");
  const tasks: TaskMatch[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";

    if (CODE_FENCE_RE.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;
    if (!INCOMPLETE_TASK_RE.test(line)) continue;
    if (!line.includes(tag)) continue;

    const startDate = extractStartDate(line);
    if (startDate && startDate <= today) {
      tasks.push({ lineIndex: i, lineText: line, nestedLines: collectNested(lines, i), date: today, sourcePath });
      continue;
    }

    const scheduleDate = extractScheduleDate(line);
    if (scheduleDate) {
      tasks.push({ lineIndex: i, lineText: line, nestedLines: collectNested(lines, i), date: scheduleDate, sourcePath });
      continue;
    }
  }

  return tasks;
}
