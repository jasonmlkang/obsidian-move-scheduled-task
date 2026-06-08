export interface PluginSettings {
  taskTag: string;
  dailyNoteFolder: string;
  dailyNoteFormat: string;
  targetHeading: string;
  createDailyNote: boolean;
  removeOriginal: boolean;
}

export interface TaskMatch {
  lineIndex: number;
  lineText: string;
  nestedLines: { lineIndex: number; lineText: string }[];
  date: string;
  sourcePath: string;
}

export interface MoveResult {
  moved: TaskMatch[];
  skipped: { task: TaskMatch; reason: string }[];
}
