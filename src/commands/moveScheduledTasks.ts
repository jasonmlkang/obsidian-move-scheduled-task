import { App, Notice, TFile } from "obsidian";
import { findScheduledTasks } from "../utils/taskScanner";
import { getDailyNotePath, getOrCreateDailyNote } from "../utils/dailyNoteHelper";
import { getFilesWithIncompleteTasks } from "../utils/dataviewHelper";
import type { MoveResult, PluginSettings, TaskMatch } from "../types";

export async function moveScheduledTasksCommand(
  app: App,
  settings: PluginSettings
): Promise<void> {
  const allFiles = await getFilesWithIncompleteTasks(app);
  const allTasks: TaskMatch[] = [];

  for (const file of allFiles) {
    const content = await app.vault.read(file);
    const tasks = findScheduledTasks(content, settings.taskTag, file.path);
    allTasks.push(...tasks);
  }

  if (allTasks.length === 0) {
    new Notice("No scheduled tasks to move.");
    return;
  }

  // Group tasks by target daily note path to skip self-referencing tasks
  const tasksByDate = groupByDate(allTasks, settings);

  const result: MoveResult = { moved: [], skipped: [] };

  for (const [date, tasks] of tasksByDate) {
    const targetPath = getDailyNotePath(date, settings);

    const nonSelfTasks = tasks.filter((t) => {
      if (t.sourcePath === targetPath) {
        result.skipped.push({ task: t, reason: "already in correct daily note" });
        return false;
      }
      return true;
    });

    if (nonSelfTasks.length === 0) continue;

    const dailyNote = await getOrCreateDailyNote(app, date, settings);
    if (!dailyNote) {
      for (const task of nonSelfTasks) {
        result.skipped.push({ task, reason: "daily note not found and creation is disabled" });
      }
      continue;
    }

    await insertTasksIntoDailyNote(app, dailyNote, nonSelfTasks, settings);
    result.moved.push(...nonSelfTasks);
  }

  if (settings.removeOriginal && result.moved.length > 0) {
    await removeTasksFromSources(app, result.moved);
  }

  showResultNotice(result);
}

function groupByDate(
  tasks: TaskMatch[],
  _settings: PluginSettings
): Map<string, TaskMatch[]> {
  const map = new Map<string, TaskMatch[]>();
  for (const task of tasks) {
    const list = map.get(task.date) ?? [];
    list.push(task);
    map.set(task.date, list);
  }
  return map;
}

async function insertTasksIntoDailyNote(
  app: App,
  file: TFile,
  tasks: TaskMatch[],
  settings: PluginSettings
): Promise<void> {
  await app.vault.process(file, (content) => {
    const lines = content.split("\n");
    const insertLines: string[] = [];
    for (const t of tasks) {
      insertLines.push(t.lineText);
      for (const n of t.nestedLines) insertLines.push(n.lineText);
    }

    if (!settings.targetHeading) {
      return [...lines, ...insertLines].join("\n");
    }

    const headingIndex = lines.findIndex((l) => l === settings.targetHeading);
    if (headingIndex === -1) {
      return [...lines, "", settings.targetHeading, ...insertLines].join("\n");
    }

    const before = lines.slice(0, headingIndex + 1);
    const after = lines.slice(headingIndex + 1);
    return [...before, ...insertLines, ...after].join("\n");
  });
}

async function removeTasksFromSources(
  app: App,
  tasks: TaskMatch[]
): Promise<void> {
  const bySource = new Map<string, TaskMatch[]>();
  for (const task of tasks) {
    const list = bySource.get(task.sourcePath) ?? [];
    list.push(task);
    bySource.set(task.sourcePath, list);
  }

  for (const [sourcePath, sourceTasks] of bySource) {
    const file = app.vault.getFileByPath(sourcePath);
    if (!(file instanceof TFile)) continue;

    await app.vault.process(file, (content) => {
      const lines = content.split("\n");
      const indicesToRemove = new Set<number>();
      for (const t of sourceTasks) {
        if (lines[t.lineIndex] !== t.lineText) continue;
        indicesToRemove.add(t.lineIndex);
        for (const n of t.nestedLines) {
          if (lines[n.lineIndex] === n.lineText) indicesToRemove.add(n.lineIndex);
        }
      }
      return lines.filter((_, i) => !indicesToRemove.has(i)).join("\n");
    });
  }
}

function showResultNotice(result: MoveResult): void {
  const movedCount = result.moved.length;
  const skippedCount = result.skipped.length;

  if (movedCount === 0 && skippedCount === 0) {
    new Notice("No scheduled tasks to move.");
    return;
  }

  const parts: string[] = [];
  if (movedCount > 0) {
    parts.push(`Moved ${movedCount} task${movedCount === 1 ? "" : "s"} to daily notes.`);
  }
  if (skippedCount > 0) {
    parts.push(`Skipped ${skippedCount} task${skippedCount === 1 ? "" : "s"}.`);
  }

  new Notice(parts.join(" "), 5000);
}
