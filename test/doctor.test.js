/**
 * doctor 模块测试：健康/不健康项目评分。
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { runDoctor } = require('../src/doctor');

function makeTemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zh-skills-doctor-'));
}

function write(dir, relPath, content) {
  const file = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

/** 构造一个符合中文工程规范的健康项目 */
function makeHealthyProject() {
  const dir = makeTemp();
  write(dir, 'README.md', `# demo-app\n\n一个演示项目，用于展示中文工程规范。\n\n## 快速开始\n\nnpm install\nnpm run dev\n`);
  write(dir, 'LICENSE', 'MIT License');
  write(dir, 'CHANGELOG.md', '# Changelog\n\n## 0.1.0\n- 初始版本\n');
  write(dir, 'CLAUDE.md', '# CLAUDE.md\n\n## 命令\n\nnpm test\nnpm run build\n');
  write(dir, '.claude/skills/commit-zh/SKILL.md', '---\nname: commit-zh\ndescription: x\n---\n');
  write(dir, '.gitignore', 'node_modules\n');
  write(dir, '.prettierrc', '{}\n');
  write(dir, 'src/index.js', 'function calcTotal(amount, count) {\n  return amount * count;\n}\nmodule.exports = { calcTotal };\n');
  return dir;
}

/** 构造一个不规范项目：拼音命名、无文档、无 CLAUDE.md、console.log 泛滥 */
function makeUnhealthyProject() {
  const dir = makeTemp();
  write(dir, 'src/app.js', 'const jine = 100;\nconst shijian = Date.now();\nconsole.log(jine);\nconsole.log(shijian);\nconsole.log("debug1");\nconsole.log("debug2");\nconsole.log("debug3");\nconsole.log("debug4");\n');
  return dir;
}

test('健康项目应得高分（>= 90）', () => {
  const dir = makeHealthyProject();
  try {
    const report = runDoctor(dir);
    assert.ok(report.total >= 90, `期望 >=90，实际 ${report.total}`);
    assert.strictEqual(report.problems.length, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('不规范项目应得低分（< 50）并报出问题', () => {
  const dir = makeUnhealthyProject();
  try {
    const report = runDoctor(dir);
    assert.ok(report.total < 50, `期望 <50，实际 ${report.total}`);
    assert.ok(report.problems.length > 0);
    // 拼音命名应被检出
    assert.ok(report.problems.some((p) => p.key === 'name' && /拼音/.test(p.msg)), '未检出拼音命名');
    // CLAUDE.md 缺失应被检出
    assert.ok(report.problems.some((p) => p.key === 'ai' && /CLAUDE/.test(p.msg)), '未检出 CLAUDE.md 缺失');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('README 翻译腔会被检出', () => {
  const dir = makeTemp();
  write(dir, 'README.md', '# demo\n\n本工具通过对数据进行一个排序的操作。\n请注意，我们需要确保数据正确。\n');
  try {
    const report = runDoctor(dir);
    assert.ok(report.problems.some((p) => p.key === 'doc' && /翻译腔/.test(p.msg)), '未检出翻译腔');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('空目录（无任何文件）也能出报告不抛异常且得分低', () => {
  const dir = makeTemp();
  try {
    const report = runDoctor(dir);
    assert.ok(report.total < 30, `空目录应低分，实际 ${report.total}`);
    assert.strictEqual(report.level, 'danger');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
