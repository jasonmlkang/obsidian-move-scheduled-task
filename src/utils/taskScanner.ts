import { extractScheduleDate, extractStartDate } from "./dateParser";
import type { TaskMatch } from "../types";

const INCOMPLETE_TASK_RE = /^(\s*)-\s\[\s\]\s(.+)$/;
const CODE_FENCE_RE = /^```/;

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
      tasks.push({ lineIndex: i, lineText: line, date: today, sourcePath });
      continue;
    }

    const scheduleDate = extractScheduleDate(line);
    if (scheduleDate) {
      tasks.push({ lineIndex: i, lineText: line, date: scheduleDate, sourcePath });
      continue;
    }
  }

  return tasks;
}
