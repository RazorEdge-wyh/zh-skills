---
name: commit-zh
description: 写 git commit message 时使用。按 Conventional Commits 规范产出中文 commit message：类型 + 作用域 + 中文描述，动词开头，一行能看懂。特别适合中文团队统一提交风格。
---

# 中文工程规范 · Commit Message（commit-zh）

当需要生成 git commit message 时激活本技能。产出**中文描述的 Conventional Commits**。

## 格式

```
<type>(<scope>): <中文描述>

[可选正文：为什么这样改]
```

- 类型 | 必填，小写
- 作用域 | 可选，改动的模块，如 `auth`、`pipeline`
- 描述 | 中文，**动词开头**，一行 ≤ 50 字符，句末不加句号
- 正文 | 解释**为什么**，不用解释改了什么（diff 里看得到）

## 类型速查

| type | 含义 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 支持手机号登录` |
| `fix` | 修 bug | `fix(api): 修复分页越界导致的崩溃` |
| `docs` | 文档 | `docs: 补充部署说明` |
| `style` | 格式/样式 | `style(button): 统一按钮圆角` |
| `refactor` | 重构 | `refactor(parser): 拆分 200 行主函数` |
| `perf` | 性能 | `perf(query): 用索引避免全表扫描` |
| `test` | 测试 | `test(cart): 增加并发下单用例` |
| `build` | 构建 | `build: 升级 webpack 到 5` |
| `ci` | CI 配置 | `ci: 缓存依赖加速构建` |
| `chore` | 杂项 | `chore: 清理废弃依赖` |
| `revert` | 回滚 | `revert: 回滚 #123 的改动` |

## 描述写法

- **动词开头**：`修复…` `增加…` `优化…` `调整…` `移除…` `升级…` `重构…`
- **说"改了效果"，不说"改了代码"**：
  - ❌ `feat: 新增一个函数处理登录`
  - ✅ `feat(auth): 支持手机号验证码登录`
- 一个 commit 一个意图；多个意图拆多个 commit。
- 修复用 issue 编号：`fix: 修复订单金额精度问题（#42）`

## 好 / 坏示例

| 状态 | commit |
|------|--------|
| ✅ | `fix(cart): 修复商品数量为 0 时仍可结算` |
| ✅ | `perf(index): 用双端队列替换数组头部 shift` |
| ❌ | `update`（无类型、无信息） |
| ❌ | `feat: 改了一些东西` |
| ❌ | `fix bug`（英文 + 无描述） |
| ❌ | `feat(login): 增加登录功能并修复退出问题并优化了样式`（多意图揉一起） |

## 变更说明（可选规范）

大版本 / 破坏性变更在正文或 `BREAKING CHANGE:` 中写：

```
feat(api): 查询接口改为分页返回

BREAKING CHANGE: 原 `list` 接口不再返回全量数据，
改为 `{ list, total, page }` 结构，调用方需适配。
```

## 团队统一配置建议

- 开启 `.git/hooks/commit-msg` 校验或使用 `commitlint`（规则：`@commitlint/config-conventional`）。
- 规格化后可一键生成 changelog：`conventional-changelog -p angular -i CHANGELOG.md -s`。
- 历史 commit 不规范没关系，**从今天开始规范**即可，不要翻旧账。
