import { App, PluginSettingTab, Setting } from "obsidian";
import type MoveScheduledTaskPlugin from "./main";
import type { PluginSettings } from "./types";

export const DEFAULT_SETTINGS: PluginSettings = {
  taskTag: "#scheduled",
  dailyNoteFolder: "",
  dailyNoteFormat: "YYYY-MM-DD",
  targetHeading: "## Tasks",
  createDailyNote: true,
  removeOriginal: true,
};

export class MoveScheduledTaskSettingTab extends PluginSettingTab {
  plugin: MoveScheduledTaskPlugin;

  constructor(app: App, plugin: MoveScheduledTaskPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Task tag")
      .setDesc(
        'Tag that marks a task as scheduled (include the #). Example: #scheduled'
      )
      .addText((text) =>
        text
          .setPlaceholder("#scheduled")
          .setValue(this.plugin.settings.taskTag)
          .onChange(async (value) => {
            this.plugin.settings.taskTag = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Daily notes folder")
      .setDesc(
        "Path to the folder containing your daily notes. Leave empty for vault root."
      )
      .addText((text) =>
        text
          .setPlaceholder("Daily Notes")
          .setValue(this.plugin.settings.dailyNoteFolder)
          .onChange(async (value) => {
            this.plugin.settings.dailyNoteFolder = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Daily note filename format")
      .setDesc(
        "Format for daily note filenames. Tokens: YYYY (year), MM (month), DD (day)."
      )
      .addText((text) =>
        text
          .setPlaceholder("YYYY-MM-DD")
          .setValue(this.plugin.settings.dailyNoteFormat)
          .onChange(async (value) => {
            this.plugin.settings.dailyNoteFormat = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Target section heading")
      .setDesc(
        "Heading under which tasks are inserted in the daily note. Leave empty to append at end."
      )
      .addText((text) =>
        text
          .setPlaceholder("## Tasks")
          .setValue(this.plugin.settings.targetHeading)
          .onChange(async (value) => {
            this.plugin.settings.targetHeading = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Create daily note if missing")
      .setDesc("Automatically create the daily note file if it does not exist.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.createDailyNote)
          .onChange(async (value) => {
            this.plugin.settings.createDailyNote = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Remove task from original file")
      .setDesc(
        "Remove the task from its source file after moving it to the daily note."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.removeOriginal)
          .onChange(async (value) => {
            this.plugin.settings.removeOriginal = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
