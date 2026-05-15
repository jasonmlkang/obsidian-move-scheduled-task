import { App, TFile } from "obsidian";
import type { PluginSettings } from "../types";

export function formatDate(
  isoDate: string,
  format: string
): string {
  const parts = isoDate.split("-");
  const year = parts[0] ?? "";
  const month = parts[1] ?? "";
  const day = parts[2] ?? "";

  return format.replace("YYYY", year).replace("MM", month).replace("DD", day);
}

export function getDailyNotePath(
  isoDate: string,
  settings: PluginSettings
): string {
  const filename = formatDate(isoDate, settings.dailyNoteFormat);
  if (settings.dailyNoteFolder) {
    return `${settings.dailyNoteFolder}/${filename}.md`;
  }
  return `${filename}.md`;
}

export async function getOrCreateDailyNote(
  app: App,
  isoDate: string,
  settings: PluginSettings
): Promise<TFile | null> {
  const path = getDailyNotePath(isoDate, settings);
  const existing = app.vault.getFileByPath(path);

  if (existing) return existing;
  if (!settings.createDailyNote) return null;

  const formattedDate = formatDate(isoDate, settings.dailyNoteFormat);
  const initialContent = buildInitialContent(formattedDate, settings);

  try {
    const folder = settings.dailyNoteFolder;
    if (folder) {
      const folderExists = app.vault.getFolderByPath(folder);
      if (!folderExists) {
        await app.vault.createFolder(folder);
      }
    }
    return await app.vault.create(path, initialContent);
  } catch (err) {
    console.error(`[Move Scheduled Task] Failed to create daily note: ${path}`, err);
    return null;
  }
}

function buildInitialContent(
  formattedDate: string,
  settings: PluginSettings
): string {
  const lines = [`# ${formattedDate}`, ""];
  if (settings.targetHeading) {
    lines.push(settings.targetHeading, "");
  }
  return lines.join("\n");
}
