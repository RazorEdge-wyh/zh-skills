# CLAUDE.md

> zh-skills 自己的项目说明。这是一个"自举"项目：我们推广中文工程规范，自己的仓库也遵守这些规范。

## 项目是什么

zh-skills 是一组给中文开发者的 Claude Code 中文工程规范技能（Skills）+ 一个零依赖的 Node CLI。

- `skills/` 下的 5 个 `SKILL.md` 是产品本体（纯 Markdown，可被 Claude Code 原生加载）。
- `bin/zh-skills.js` + `src/` 是安装器与体检工具。

## 常用命令

```bash
npm test        # 运行测试（Node 内置 test runner，零依赖）
node bin/zh-skills.js doctor    # 对自己做健康体检
node bin/zh-skills.js list      # 列出技能
```

## 目录结构

```text
skills/        # 产品本体：5 个技能的 SKILL.md
src/           # CLI 逻辑：cli / init / doctor / skills / render
bin/           # 可执行入口（薄壳）
test/          # Node test runner 测试
docs/          # 技能详解文档
```

## 工程约定

- 变量/函数英文命名，注释中文，说明"为什么"而非"是什么"。
- commit message 遵循 Conventional Commits，中文描述（详见 skills/commit-zh）。
- **零依赖是硬约束**：只用 Node 标准库，不允许加任何 npm 依赖。
- 测试覆盖 src 下所有模块；改 src 必须跑 `npm test`。
- 修改 CLI 输出格式时，同步更新 README 里的演示文本。

## 需要注意

- `src/doctor.js` 里的启发式规则会"检测自己"，改词表/正则时留意会不会自匹配。
- `skills/*/SKILL.md` 的 frontmatter `description` 是技能触发的关键，改名字要同步改 `src/skills.js` 的 `SKILL_META`。
- README 是传播门面，新增命令/功能时务必同步更新 README 的中英文演示。
