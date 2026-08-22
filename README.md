<div align="center">

# zh-skills

### 给中文开发者的 AI 编程「中文工程规范」技能包

让 Claude Code / Cursor 写出的代码，符合中国团队的规范：
**中文注释、英文命名、无翻译腔、地道文档、规范 commit。**

<br/>

![npm version](https://img.shields.io/npm/v/zh-skills)
![npm downloads](https://img.shields.io/npm/dt/zh-skills)
![GitHub stars](https://img.shields.io/github/stars/RazorEdge-wyh/zh-skills?style=social)
![License](https://img.shields.io/github/license/RazorEdge-wyh/zh-skills)
![Node](https://img.shields.io/badge/node-%3E%3D16-green)
![Zero deps](https://img.shields.io/badge/依赖-0-blueviolet)

**一条命令安装，5 个技能开箱即用，纯 Markdown 可审查，零依赖。**

<br/>

```bash
npm i -g github:RazorEdge-wyh/zh-skills && zh-skills init    # 一条命令装进 .claude/skills/
zh-skills doctor                                             # 一键给项目做"中文工程健康体检"
```

</div>

---

## 为什么会有这个项目

你的 AI 编程助手（Claude Code / Cursor / Codex）写出来的代码，是不是总有这些"不对味"的地方？

```js
// ❌ AI 常见输出
const jine = 100;                    // 拼音命名
const shijian = Date.now();          // 拼音命名
// 对数据进行一个排序的操作          // 翻译腔注释
function getData() { /* ... */ }     // 神秘缩写

// ✅ 中文团队想要的样子
const amount = 100;                  // 英文命名，语义清晰
const createdAt = Date.now();        // 英文命名
// 按创建时间倒序，让最新数据靠前    // 注释解释"为什么"
function fetchOrders() { /* ... */ } // 动词开头，语义明确
```

还有这些"机翻味"文档：

> ❌ 本工具通过对数据进行一个排序的操作，需要注意的是，请确保你已经安装了 Node。
> ✅ 本工具给数据排序。请先装好 Node。

**根源**：现役的 Agent 技能库（Superpowers、mattpocock/skills、karpathy-skills）都是英文的、为英文项目设计的——它们不会教 AI 写出符合**中文团队**规范的代码。

**zh-skills 就是那块空白**：把中国工程师的工程规范（命名、注释、文档、commit、审查）封装成 Claude Code 原生支持的 Skills，让 AI 一进项目就自动遵守。

---

## 特性

- **零依赖、纯 Markdown**：技能文件就是 `.claude/skills/*/SKILL.md`，人人都能看、能改、能 review，不用学任何新东西。
- **一条命令安装**：`zh-skills init`，自动装进当前项目的 `.claude/skills/`，Claude Code 下次启动即生效。
- **亮点功能 `doctor`**：一键给项目做"中文工程健康体检"，给 README/命名/AI 协作/代码卫生打分，输出可执行的修复清单。
- **开箱即用 5 个技能**：审查、写文档、写 commit、重构、体检，覆盖日常协作全流程。
- **多工具友好**：顺带生成 `AGENTS.md`，Cursor / Codex / Devin 也能读到规范。

---

## 快速开始

```bash
# 1) 安装（任选其一）
npm i -g github:RazorEdge-wyh/zh-skills      # 从 GitHub 直装（无需登录 GitHub）
#   或发布到 npm 后： npm i -g zh-skills

# 2) 在任意项目里一键安装技能
zh-skills init
```

装完之后你的项目长这样：

```text
your-project/
├── .claude/
│   └── skills/          # ← 5 个中文工程规范技能
│       ├── code-review-zh/
│       ├── write-doc-zh/
│       ├── commit-zh/
│       ├── refactor-zh/
│       └── health-check-zh/
├── CLAUDE.md            # AI 项目说明书（自动生成）
└── AGENTS.md            # 供 Cursor/Codex 阅读（自动生成）
```

**然后呢？** 打开 Claude Code，直接让它"审查一下代码""写个 commit message""给 README 提点意见"——它会自动激活对应技能，按中文工程规范干活。

---

## `zh-skills doctor`：项目健康体检

想知道你的项目"中文规范执行得怎么样"？一条命令，现场出报告：

```text
$ zh-skills doctor

🏥 zh-skills · 中文工程健康体检
总分：72/100  🟡 良好  有零星问题，修一下更好
────────────────────────────────────────────
A. 文档健康  25/30
  ✔ README 存在且有定位
  ✔ README 有快速开始
  · 文档无翻译腔 -5        ← 检出「进行一个」等机翻句式
  ...
B. AI 协作  20/25
C. 命名健康  10/25
  · 代码中无拼音命名 -15   ← 检出 src/app.js:12 的 shijian
  ...
────────────────────────────────────────────
⚠ 待修复（按收益排序）
  1. [name] src/app.js:12 疑似拼音命名，建议改成英文
  2. [doc] README.md 翻译腔句式「进行一个」
  ...
```

纯本地启发式检查，不联网、不改代码，只出报告。适合：
- 接手一个老项目前先摸底；
- PR 合入前的"规范门禁"；
- 团队规范落地后，每月体检一次看分数涨没涨。

> **Dogfooding**：本仓库自己跑 `zh-skills doctor` 就是 **100/100 🟢 优秀**——
> 规范工具，先规范自己。

---

## 技能一览

| 技能 | 什么时候触发 | 管什么 |
|---|---|---|
| `code-review-zh` | 审查 / review / 检查代码 | 命名、注释、可读性、错误处理、边界、安全、性能 |
| `write-doc-zh` | 写 / 改文档或注释 | README 结构、去翻译腔、接口文档、中英文排版 |
| `commit-zh` | 生成 git commit message | Conventional Commits + 中文描述、动词开头 |
| `refactor-zh` | 重构 / 清理 / 优化代码 | 拼音改英文、拆函数、去重复，行为不变小步提交 |
| `health-check-zh` | 体检 / 健康检查项目 | 中文工程健康度评分 + 修复清单 |

每个技能都是经过打磨的 `SKILL.md`，**有规则、有示例、有输出格式约定**，不是一句"注意中文"的废话。详细内容见 [docs/skills.md](docs/skills.md)。

---

## 命令参考

```text
zh-skills init [--yes] [--dir <path>]   安装规范技能（可选生成 CLAUDE.md / AGENTS.md）
zh-skills doctor [--dir <path>]         项目健康体检
zh-skills list                          列出可用技能
zh-skills help                          帮助
zh-skills --version                     版本
```

---

## 工作原理（3 分钟看懂）

1. Claude Code 原生支持 **Skills**：项目 `.claude/skills/` 下的每个 `SKILL.md` 都会在对话时按 `description` 自动匹配激活。
2. zh-skills 做的只有两件事：**把规范写成高质量的 SKILL.md**，**把安装做成一条命令**。
3. 所以它**零依赖、完全离线、行为透明**——技能文件就在你项目里，随时可改，改成你们团队的版本。

> 想深入了解 Skills 机制？看看 [Superpowers](https://github.com/obra/superpowers)、[mattpocock/skills](https://github.com/mattpocock/skills)、[karpathy-skills](https://github.com/andrej-karpathy-skills) 这些现象级项目——zh-skills 是它们的中文工程规范补充。

---

## 路线图

- [ ] 更多技能：数据库/SQL 命名、单元测试规范、Vue/React 组件规范
- [ ] 团队技能仓库：把团队规范集中管理，多项目共享
- [ ] 导出 `.cursor/rules`，Cursor 用户开箱即用
- [ ] `doctor` 增加更多检查项（依赖体积、重复代码率）

欢迎提 [Issue](https://github.com/RazorEdge-wyh/zh-skills/issues) 或 PR。

---

## License

MIT © [王越豪（湖南科技大学 26 届）](https://github.com/RazorEdge-wyh)

---

## English (brief)

**zh-skills** is a skills pack that teaches your AI coding agent (Claude Code / Cursor) to follow **Chinese engineering conventions** — Chinese comments, English naming, no translationese, idiomatic docs, and conventional commits. Zero dependencies, pure Markdown, one-line install.

```bash
npm i -g github:RazorEdge-wyh/zh-skills && zh-skills init   # install skills into .claude/skills/
zh-skills doctor                                            # health-check your project
```

- 5 ready-made skills: code review, doc writing, commit message, refactoring, health check.
- No deps, fully offline, every rule is a readable Markdown file you can edit.
- Works wherever Claude Code works (also generates `AGENTS.md` for Cursor/Codex).
