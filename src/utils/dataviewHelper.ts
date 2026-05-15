import { App, TFile } from "obsidian";

interface DataviewDataArray<T> {
  where(predicate: (item: T) => boolean): DataviewDataArray<T>;
  readonly length: number;
  [Symbol.iterator](): Iterator<T>;
}

interface DataviewTask {
  completed: boolean;
}

interface DataviewPage {
  file: {
    path: string;
    tasks: DataviewDataArray<DataviewTask>;
  };
}

interface DataviewApi {
  pages(query?: string): DataviewDataArray<DataviewPage>;
}

function getDataviewApi(app: App): DataviewApi | null {
  const appAny = app as unknown as {
    plugins?: { plugins?: Record<string, unknown> };
  };
  const plugin = appAny.plugins?.plugins?.["dataview"] as
    | { api?: DataviewApi }
    | undefined;
  return plugin?.api ?? null;
}

export async function getFilesWithIncompleteTasks(app: App): Promise<TFile[]> {
  const dv = getDataviewApi(app);

  if (dv) {
    try {
      const pages = dv
        .pages()
        .where((p) => p.file.tasks.where((t) => !t.completed).length > 0);

      const files: TFile[] = [];
      for (const page of pages) {
        const file = app.vault.getFileByPath(page.file.path);
        if (file instanceof TFile) {
          files.push(file);
        }
      }
      console.log(`[Move Scheduled Task] Found ${files.length} files with incomplete tasks using Dataview.`);
      return files;
    } catch (err) {
      console.warn(
        "[Move Scheduled Task] Dataview query failed, falling back to full scan:",
        err
      );
    }
  }

  return app.vault.getMarkdownFiles();
}
