import { extractScheduleDate, stripDateAnnotations } from "./dateParser";
import type { TaskMatch } from "../types";

const INCOMPLETE_TASK_RE = /^(\s*)-\s\[\s\]\s(.+)$/;
const CODE_FENCE_RE = /^```/;

export function findScheduledTasks(
  content: string,
  tag: string,
  sourcePath: string
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

    const date = extractScheduleDate(line);
    if (!date) continue;

    tasks.push({
      lineIndex: i,
      lineText: line,
      date,
      sourcePath,
    });
  }

  return tasks;
}

function stripTag(line: string, tag: string): string {
  return line.replace(tag, "").replace(/\s{2,}/g, " ").trimEnd();
}
