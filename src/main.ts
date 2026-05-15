import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, MoveScheduledTaskSettingTab } from "./settings";
import { moveScheduledTasksCommand } from "./commands/moveScheduledTasks";
import type { PluginSettings } from "./types";

export default class MoveScheduledTaskPlugin extends Plugin {
  settings!: PluginSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.addCommand({
      id: "move-scheduled-tasks",
      name: "Move scheduled tasks to daily notes",
      callback: () => moveScheduledTasksCommand(this.app, this.settings),
    });

    this.addSettingTab(new MoveScheduledTaskSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
