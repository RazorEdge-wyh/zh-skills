/**
 * skills 模块测试：技能清单与安装逻辑。
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { listSkills, installSkills } = require('../src/skills');

test('listSkills 返回 5 个技能且每个都有 SKILL.md', () => {
  const skills = listSkills();
  assert.strictEqual(skills.length, 5);
  for (const s of skills) {
    assert.ok(s.name.endsWith('-zh'), `${s.name} 应以 -zh 结尾`);
    assert.ok(s.description.length > 10, `${s.name} 应有描述`);
    const file = path.join(__dirname, '..', 'skills', s.name, 'SKILL.md');
    assert.ok(fs.existsSync(file), `${s.name} 缺 SKILL.md`);
  }
});

test('installSkills 拷贝到临时项目的 .claude/skills 且幂等', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zh-skills-test-'));
  try {
    const first = installSkills(tmp);
    assert.strictEqual(first.installed.length, 5);
    assert.deepStrictEqual(first.errors, []);

    // 二次安装应全部跳过（幂等）
    const second = installSkills(tmp);
    assert.strictEqual(second.skipped.length, 5);
    assert.strictEqual(second.installed.length, 0);

    // 文件真实存在且是完整 SKILL.md
    const target = path.join(tmp, '.claude', 'skills', 'commit-zh', 'SKILL.md');
    assert.ok(fs.existsSync(target));
    assert.match(fs.readFileSync(target, 'utf8'), /^---\n/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('installSkills 指定未知技能时报错', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zh-skills-test-'));
  try {
    const result = installSkills(tmp, ['not-exist']);
    assert.strictEqual(result.errors.length, 1);
    assert.match(result.errors[0], /未知技能/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
