# Changelog

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)，CHANGELOG 由 commit 历史自动生成。

## [0.1.0] - 2026-08-22

### 新增
- 5 个中文工程规范技能：`code-review-zh` / `write-doc-zh` / `commit-zh` / `refactor-zh` / `health-check-zh`
- `zh-skills init`：一键安装技能，可顺带生成 `CLAUDE.md` / `AGENTS.md`
- `zh-skills doctor`：项目中文工程健康体检（100 分制，四维评分）
- `zh-skills list`：列出可用技能
- 零依赖 CLI，仅用 Node 标准库，内置测试（`node --test`）
