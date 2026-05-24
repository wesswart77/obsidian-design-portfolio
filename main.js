var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DesignPortfolioPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  portfolioFolder: "Portfolio",
  inspirationFolder: "Portfolio/Inspiration"
};
var PORTFOLIO_VIEW_TYPE = "design-portfolio-view";
var PortfolioView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.activeTab = "case-studies";
    this.plugin = plugin;
  }
  getViewType() {
    return PORTFOLIO_VIEW_TYPE;
  }
  getDisplayText() {
    return "Design Portfolio";
  }
  getIcon() {
    return "palette";
  }
  async onOpen() {
    await this.render();
  }
  async render() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("dp-container");
    const header = container.createEl("div", { cls: "dp-header" });
    header.createEl("h2", { text: "Portfolio" });
    const tabBar = container.createEl("div", { cls: "dp-tabs" });
    const tabs = [
      { id: "case-studies", label: "Case Studies" },
      { id: "inspiration", label: "Inspiration" }
    ];
    for (const tab of tabs) {
      const btn = tabBar.createEl("button", {
        text: tab.label,
        cls: `dp-tab${this.activeTab === tab.id ? " active" : ""}`
      });
      btn.addEventListener("click", () => {
        this.activeTab = tab.id;
        this.render();
      });
    }
    const actions = container.createEl("div", { cls: "dp-actions" });
    if (this.activeTab === "case-studies") {
      const addCaseBtn = actions.createEl("button", { text: "+ Case Study", cls: "dp-btn-primary" });
      addCaseBtn.addEventListener("click", () => {
        new CaseStudyModal(this.app, this.plugin, () => this.render()).open();
      });
      const moodBtn = actions.createEl("button", { text: "+ Mood Board", cls: "dp-btn" });
      moodBtn.addEventListener("click", async () => {
        await this.plugin.createMoodBoard();
        this.render();
      });
    } else {
      const addInspBtn = actions.createEl("button", { text: "+ Inspiration", cls: "dp-btn-primary" });
      addInspBtn.addEventListener("click", () => {
        new InspirationModal(this.app, this.plugin, () => this.render()).open();
      });
    }
    if (this.activeTab === "case-studies") {
      await this.renderCaseStudies(container);
    } else {
      await this.renderInspiration(container);
    }
  }
  async renderCaseStudies(container) {
    var _a, _b, _c;
    const files = this.plugin.app.vault.getMarkdownFiles().filter((f) => {
      const inPortfolio = f.path.startsWith(this.plugin.settings.portfolioFolder + "/");
      const inInspiration = f.path.startsWith(this.plugin.settings.inspirationFolder + "/");
      const cache = this.plugin.app.metadataCache.getFileCache(f);
      const fm = cache == null ? void 0 : cache.frontmatter;
      return inPortfolio && !inInspiration && (fm == null ? void 0 : fm.type) === "case-study";
    });
    if (files.length === 0) {
      container.createEl("p", { text: "No case studies yet. Create your first!", cls: "dp-empty" });
      return;
    }
    container.createEl("p", { text: `${files.length} case ${files.length !== 1 ? "studies" : "study"}`, cls: "dp-count" });
    const byYear = {};
    for (const file of files) {
      const cache = this.plugin.app.metadataCache.getFileCache(file);
      const year = (_b = (_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.year) != null ? _b : "Undated";
      if (!byYear[year])
        byYear[year] = [];
      byYear[year].push(file);
    }
    const sortedYears = Object.keys(byYear).sort((a, b) => b.localeCompare(a));
    for (const year of sortedYears) {
      const group = container.createEl("div", { cls: "dp-year-group" });
      group.createEl("div", { text: year, cls: "dp-year-heading" });
      for (const file of byYear[year].sort((a, b) => a.basename.localeCompare(b.basename))) {
        const cache = this.plugin.app.metadataCache.getFileCache(file);
        const fm = (_c = cache == null ? void 0 : cache.frontmatter) != null ? _c : {};
        const card = group.createEl("div", { cls: "dp-card" });
        const title = card.createEl("div", { text: file.basename, cls: "dp-card-title" });
        title.addEventListener("click", () => {
          this.plugin.app.workspace.openLinkText(file.path, "", false);
        });
        const metaParts = [];
        if (fm.client)
          metaParts.push(`Client: ${fm.client}`);
        if (fm.role)
          metaParts.push(`Role: ${fm.role}`);
        if (metaParts.length)
          card.createEl("div", { text: metaParts.join(" \xB7 "), cls: "dp-card-meta" });
        if (fm.tools)
          card.createEl("div", { text: `Tools: ${fm.tools}`, cls: "dp-card-meta" });
        if (fm.tags && Array.isArray(fm.tags) && fm.tags.length) {
          const tagsEl = card.createEl("div", { cls: "dp-tags" });
          for (const tag of fm.tags) {
            tagsEl.createEl("span", { text: tag, cls: "dp-tag" });
          }
        }
      }
    }
  }
  async renderInspiration(container) {
    var _a, _b, _c, _d, _e;
    const files = this.plugin.app.vault.getMarkdownFiles().filter((f) => {
      var _a2;
      const cache = this.plugin.app.metadataCache.getFileCache(f);
      return f.path.startsWith(this.plugin.settings.inspirationFolder + "/") && ((_a2 = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a2.type) === "inspiration";
    });
    if (files.length === 0) {
      container.createEl("p", { text: "No inspiration captured yet.", cls: "dp-empty" });
      return;
    }
    container.createEl("p", { text: `${files.length} inspiration${files.length !== 1 ? "s" : ""}`, cls: "dp-count" });
    const byTag = {};
    for (const file of files) {
      const cache = this.plugin.app.metadataCache.getFileCache(file);
      const tags = (_b = (_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.tags) != null ? _b : [];
      const firstTag = (_c = tags[0]) != null ? _c : "Untagged";
      if (!byTag[firstTag])
        byTag[firstTag] = [];
      byTag[firstTag].push(file);
    }
    const sortedTags = Object.keys(byTag).sort();
    for (const tag of sortedTags) {
      const group = container.createEl("div", { cls: "dp-year-group" });
      group.createEl("div", { text: tag, cls: "dp-year-heading" });
      for (const file of byTag[tag].sort((a, b) => b.stat.mtime - a.stat.mtime)) {
        const cache = this.plugin.app.metadataCache.getFileCache(file);
        const fm = (_d = cache == null ? void 0 : cache.frontmatter) != null ? _d : {};
        const card = group.createEl("div", { cls: "dp-card" });
        const title = card.createEl("div", { text: file.basename, cls: "dp-card-title" });
        title.addEventListener("click", () => {
          this.plugin.app.workspace.openLinkText(file.path, "", false);
        });
        if (fm.source_url) {
          card.createEl("div", { text: fm.source_url, cls: "dp-card-meta" });
        }
        const allTags = (_e = fm.tags) != null ? _e : [];
        if (allTags.length) {
          const tagsEl = card.createEl("div", { cls: "dp-tags" });
          for (const t of allTags) {
            tagsEl.createEl("span", { text: t, cls: "dp-tag" });
          }
        }
      }
    }
  }
};
var CaseStudyModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("dp-modal");
    contentEl.createEl("h2", { text: "New Case Study" });
    const data = {
      projectName: "",
      client: "",
      year: String(new Date().getFullYear()),
      role: "",
      tools: "",
      tags: "",
      brief: "",
      outcome: ""
    };
    new import_obsidian.Setting(contentEl).setName("Project name").addText((t) => {
      t.setPlaceholder("e.g. Brand Refresh 2024").onChange((v) => data.projectName = v);
      t.inputEl.focus();
    });
    new import_obsidian.Setting(contentEl).setName("Client").addText(
      (t) => t.setPlaceholder("Client or company name").onChange((v) => data.client = v)
    );
    new import_obsidian.Setting(contentEl).setName("Year").addText(
      (t) => t.setValue(data.year).setPlaceholder("e.g. 2024").onChange((v) => data.year = v)
    );
    new import_obsidian.Setting(contentEl).setName("Your role").addText(
      (t) => t.setPlaceholder("e.g. Lead Designer, UX Researcher").onChange((v) => data.role = v)
    );
    new import_obsidian.Setting(contentEl).setName("Tools used (comma-separated)").addText(
      (t) => t.setPlaceholder("e.g. Figma, Illustrator, Framer").onChange((v) => data.tools = v)
    );
    new import_obsidian.Setting(contentEl).setName("Tags (comma-separated)").addText(
      (t) => t.setPlaceholder("e.g. branding, web, mobile").onChange((v) => data.tags = v)
    );
    new import_obsidian.Setting(contentEl).setName("Brief").addTextArea((a) => {
      a.setPlaceholder("What was the project brief?").onChange((v) => data.brief = v);
      a.inputEl.rows = 3;
      a.inputEl.addClass("dp-textarea");
    });
    new import_obsidian.Setting(contentEl).setName("Outcome").addTextArea((a) => {
      a.setPlaceholder("What was the result?").onChange((v) => data.outcome = v);
      a.inputEl.rows = 3;
      a.inputEl.addClass("dp-textarea");
    });
    new import_obsidian.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Create Case Study").setCta().onClick(async () => {
        if (!data.projectName.trim()) {
          new import_obsidian.Notice("Project name is required.");
          return;
        }
        await this.plugin.createCaseStudy(data);
        this.onDone();
        this.close();
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};
var InspirationModal = class extends import_obsidian.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("dp-modal");
    contentEl.createEl("h2", { text: "Capture Inspiration" });
    const data = { title: "", sourceUrl: "", tags: "", notes: "" };
    new import_obsidian.Setting(contentEl).setName("Title").addText((t) => {
      t.setPlaceholder("What inspired you?").onChange((v) => data.title = v);
      t.inputEl.focus();
    });
    new import_obsidian.Setting(contentEl).setName("Source URL").addText(
      (t) => t.setPlaceholder("https://...").onChange((v) => data.sourceUrl = v)
    );
    new import_obsidian.Setting(contentEl).setName("Tags (comma-separated)").addText(
      (t) => t.setPlaceholder("e.g. typography, color, layout").onChange((v) => data.tags = v)
    );
    new import_obsidian.Setting(contentEl).setName("Notes").addTextArea((a) => {
      a.setPlaceholder("Why does this inspire you?").onChange((v) => data.notes = v);
      a.inputEl.rows = 4;
      a.inputEl.addClass("dp-textarea");
    });
    new import_obsidian.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Save Inspiration").setCta().onClick(async () => {
        if (!data.title.trim()) {
          new import_obsidian.Notice("Title is required.");
          return;
        }
        await this.plugin.createInspiration(data);
        this.onDone();
        this.close();
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};
var DesignPortfolioPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.registerView(PORTFOLIO_VIEW_TYPE, (leaf) => new PortfolioView(leaf, this));
    this.addCommand({
      id: "new-case-study",
      name: "New case study",
      callback: () => new CaseStudyModal(this.app, this, () => this.refreshView()).open()
    });
    this.addCommand({
      id: "new-inspiration",
      name: "New inspiration",
      callback: () => new InspirationModal(this.app, this, () => this.refreshView()).open()
    });
    this.addCommand({
      id: "new-mood-board",
      name: "New mood board",
      callback: () => this.createMoodBoard()
    });
    this.addCommand({
      id: "open-portfolio",
      name: "Open portfolio",
      callback: () => this.openPortfolioView()
    });
    this.addRibbonIcon("palette", "Design Portfolio", () => this.openPortfolioView());
    this.addSettingTab(new DesignPortfolioSettingTab(this.app, this));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(PORTFOLIO_VIEW_TYPE);
  }
  refreshView() {
    const leaves = this.app.workspace.getLeavesOfType(PORTFOLIO_VIEW_TYPE);
    if (leaves.length)
      leaves[0].view.render();
  }
  async ensureFolder(path) {
    if (!await this.app.vault.adapter.exists(path)) {
      await this.app.vault.createFolder(path);
    }
  }
  async createCaseStudy(data) {
    await this.ensureFolder(this.settings.portfolioFolder);
    const tagList = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const toolList = data.tools.split(",").map((t) => t.trim()).filter(Boolean);
    const frontmatter = `---
type: case-study
project: "${data.projectName}"
client: "${data.client}"
year: "${data.year}"
role: "${data.role}"
tools: "${toolList.join(", ")}"
tags: [${tagList.map((t) => `"${t}"`).join(", ")}]
date_created: ${(0, import_obsidian.moment)().format("YYYY-MM-DD")}
---`;
    const body = `${frontmatter}

## Brief

${data.brief || "_Describe the project brief here._"}

## My Role

${data.role ? `As **${data.role}**, I was responsible for:` : "_Describe your role and responsibilities._"}

-

## Process

### Discovery
-

### Ideation
-

### Design
-

### Delivery
-

## Outcome

${data.outcome || "_Describe the project outcome and impact._"}

## Learnings

-

## Assets

_Links to deliverables, mockups, and supporting images:_

-
`;
    const safeName = data.projectName.replace(/[\\/:*?"<>|]/g, "-");
    const filePath = `${this.settings.portfolioFolder}/${safeName}.md`;
    const file = await this.app.vault.create(filePath, body);
    await this.app.workspace.openLinkText(file.path, "", false);
    new import_obsidian.Notice(`Case study created: ${data.projectName}`);
    return file;
  }
  async createInspiration(data) {
    await this.ensureFolder(this.settings.inspirationFolder);
    const tagList = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const body = `---
type: inspiration
title: "${data.title}"
source_url: "${data.sourceUrl}"
tags: [${tagList.map((t) => `"${t}"`).join(", ")}]
date_captured: ${(0, import_obsidian.moment)().format("YYYY-MM-DD")}
---

## Source

${data.sourceUrl ? `[${data.title}](${data.sourceUrl})` : "_No source URL provided._"}

## Notes

${data.notes || "_What inspired you about this?_"}
`;
    const safeName = data.title.replace(/[\\/:*?"<>|]/g, "-");
    const timestamp = (0, import_obsidian.moment)().format("YYYYMMDD-HHmmss");
    const filePath = `${this.settings.inspirationFolder}/${safeName}-${timestamp}.md`;
    const file = await this.app.vault.create(filePath, body);
    await this.app.workspace.openLinkText(file.path, "", false);
    new import_obsidian.Notice(`Inspiration saved: ${data.title}`);
    return file;
  }
  async createMoodBoard() {
    await this.ensureFolder(this.settings.portfolioFolder);
    const timestamp = (0, import_obsidian.moment)().format("YYYY-MM-DD");
    const title = `Mood Board ${timestamp}`;
    const body = `---
type: mood-board
title: "${title}"
date_created: ${timestamp}
tags: []
---

## Mood Board: ${title}

_A collection of images, colors, and references that define the visual direction._

---

### Image Grid

| | | |
|---|---|---|
| ![[image-1.png|200]] | ![[image-2.png|200]] | ![[image-3.png|200]] |
| *Caption 1* | *Caption 2* | *Caption 3* |
| ![[image-4.png|200]] | ![[image-5.png|200]] | ![[image-6.png|200]] |
| *Caption 4* | *Caption 5* | *Caption 6* |

---

### Color Palette

| Swatch | Hex | Role |
|--------|-----|------|
| | \`#FFFFFF\` | Primary |
| | \`#000000\` | Secondary |
| | \`#0066CC\` | Accent |

---

### Typography

- **Heading:**
- **Body:**
- **Display:**

---

### Mood Keywords

-

---

### Reference Links

-
`;
    const safeName = title.replace(/[\\/:*?"<>|]/g, "-");
    const filePath = `${this.settings.portfolioFolder}/${safeName}.md`;
    const file = await this.app.vault.create(filePath, body);
    await this.app.workspace.openLinkText(file.path, "", false);
    new import_obsidian.Notice(`Mood board created: ${title}`);
    return file;
  }
  async openPortfolioView() {
    const existing = this.app.workspace.getLeavesOfType(PORTFOLIO_VIEW_TYPE);
    if (existing.length) {
      this.app.workspace.revealLeaf(existing[0]);
      existing[0].view.render();
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: PORTFOLIO_VIEW_TYPE, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var DesignPortfolioSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Design Portfolio" });
    new import_obsidian.Setting(containerEl).setName("Portfolio folder").setDesc("Where case study and mood board notes are saved.").addText(
      (t) => t.setValue(this.plugin.settings.portfolioFolder).onChange(async (v) => {
        this.plugin.settings.portfolioFolder = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Inspiration folder").setDesc("Where inspiration capture notes are saved.").addText(
      (t) => t.setValue(this.plugin.settings.inspirationFolder).onChange(async (v) => {
        this.plugin.settings.inspirationFolder = v;
        await this.plugin.saveSettings();
      })
    );
  }
};
