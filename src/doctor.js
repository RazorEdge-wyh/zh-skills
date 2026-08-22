/**
 * `zh-skills doctor`：对项目做"中文工程健康体检"（静态启发式检查）。
 *
 * 检查维度与 skills/health-check-zh 对齐，共 100 分：
 *   A. 文档健康  30 分 —— README 定位、快速开始、翻译腔、LICENSE/CHANGELOG
 *   B. AI 协作   25 分 —— CLAUDE.md/AGENTS.md、skills/rules、命令说明
 *   C. 命名健康  25 分 —— 拼音命名、命名风格
 *   D. 代码卫生  20 分 —— console.log、TODO 残留、.gitignore
 *
 * 纯启发式、无副作用、可离线运行。报告对象与打印分离，便于测试。
 */

const fs = require('node:fs');
const path = require('node:path');

/** 常见拼音标识符词表（出现在变量/函数名中判为"疑似拼音命名"） */
const PINYIN_WORDS = [
  'jine', 'shijian', 'mingcheng', 'leixing', 'xinxi', 'zhuangtai', 'bianhao',
  'dizhi', 'shuju', 'liebiao', 'xiangmu', 'wenti', 'jieguo', 'fangfa',
  'canshu', 'yanzheng', 'zhuce', 'denglu', 'tuijian', 'guanli', 'tongji',
  'baocun', 'shanchu', 'xinzeng', 'xiugai', 'chaxun', 'bianliang', 'ziduan',
  'yonghu', 'shangpin', 'dingdan', 'wenjian', 'mulu', 'kongzhi', 'chuli',
  'fuwu', 'yingyong', 'biao', 'mima', 'zhanghu', 'quanxian', 'shezhi',
];

/** 翻译腔句式（出现在中文文档中判为"机翻痕迹"） */
const TRANSLATIONESE = [
  '进行一个', '通过使用', '需要注意的是', '我们可以', '该工具是',
  '被用于', '这将会', '需要确保', '请确保', '为了能够', '综上所述',
];

/** 需要扫描的代码文件扩展名 */
const CODE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.rb', '.php', '.c', '.cpp', '.h']);

/** 需要跳过的目录 */
// 跳过依赖/产物/测试目录：测试夹具常故意构造坏样本，不应计入业务代码健康度
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.svn', 'dist', 'build', 'coverage', '.next', '.nuxt', 'vendor', '__pycache__',
  'test', 'tests', '__tests__', 'spec', 'e2e',
]);

const LEVELS = [
  { min: 90, key: 'excellent', label: '🟢 优秀', note: '可以直接当团队样板' },
  { min: 70, key: 'good', label: '🟡 良好', note: '有零星问题，修一下更好' },
  { min: 50, key: 'fair', label: '🟠 一般', note: '中文规范基本没落地' },
  { min: 0, key: 'danger', label: '🔴 危险', note: 'AI 都读不懂，先补文档' },
];

function levelOf(score) {
  return LEVELS.find((l) => score >= l.min) || LEVELS[LEVELS.length - 1];
}

/** 递归收集目标目录下的代码文件（带数量上限） */
function collectCodeFiles(dir, limit = 300) {
  const out = [];
  const walk = (d) => {
    if (out.length >= limit) return;
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (out.length >= limit) return;
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) walk(path.join(d, e.name));
      } else if (CODE_EXT.has(path.extname(e.name))) {
        out.push(path.join(d, e.name));
      }
    }
  };
  walk(dir);
  return out;
}

/** 读取文件前 N 字符（防止读入巨型文件/二进制） */
function safeRead(file, maxBytes = 256 * 1024) {
  try {
    const stat = fs.statSync(file);
    if (stat.size > maxBytes) return '';
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

/** 提取行级命中（file + 行号 + 片段），控制在合理数量 */
function hitLines(text, regex) {
  const lines = text.split('\n');
  const hits = [];
  for (let i = 0; i < lines.length && hits.length < 5; i++) {
    if (regex.test(lines[i])) hits.push(i + 1);
  }
  return hits;
}

/**
 * 运行体检，返回报告对象（纯数据，便于测试与复用）。
 * @param {string} targetDir
 */
function runDoctor(targetDir) {
  const checks = [];
  const problems = [];

  const rootExists = (name) => fs.existsSync(path.join(targetDir, name));

  // ---------- A. 文档健康（30） ----------
  const docChecks = [];
  const readmePath = ['README.md', 'README.MD', 'readme.md', 'README.rst', 'README.txt'].map((n) => path.join(targetDir, n)).find((p) => fs.existsSync(p));
  let readmeText = '';
  if (readmePath) readmeText = safeRead(readmePath);

  const hasReadme = Boolean(readmePath);
  const hasQuickstart = /(快速开始|快速上手|快速启动|安装|Getting Started|Quick Start|Installation|Usage)/i.test(readmeText);
  const isChineseDoc = (readmeText.match(/[一-鿿]/g) || []).length > 5;
  const translationese = [];
  if (isChineseDoc) {
    // 跳过代码块（```）与块引用（>）——示例/引用常含翻译腔演示词，属正常引用
    const prose = readmeText
      .replace(/```[\s\S]*?```/g, '')
      .split('\n')
      .filter((l) => !/^\s*>/.test(l))
      .join('\n');
    for (const phrase of TRANSLATIONESE) {
      if (prose.includes(phrase)) translationese.push(phrase);
    }
  }
  const hasLicense = rootExists('LICENSE') || rootExists('LICENSE.md') || rootExists('LICENSE.txt') || rootExists('LICENCE');
  const hasChangelog = /CHANGELOG/i.test(fs.readdirSync(targetDir).join(' '));

  // "无翻译腔"仅在 README 存在时计分，空目录不给分
  const noTranslationeseScore = hasReadme && translationese.length === 0 ? 5 : 0;
  const docScore =
    (hasReadme ? 5 : 0) +
    (hasQuickstart ? 5 : 0) +
    noTranslationeseScore +
    (hasLicense ? 5 : 0) +
    (hasChangelog ? 5 : 0) +
    (hasReadme && (isChineseDoc || /\S/.test(readmeText.replace(/#.*$/gm, ''))) ? 5 : 0); // 首段有实质内容

  if (!hasReadme) problems.push({ key: 'doc', file: 'README.md', msg: '缺少 README，读者和 AI 都无从入手' });
  if (hasReadme && !hasQuickstart) problems.push({ key: 'doc', file: 'README.md', msg: '缺少快速开始章节，无法照着跑起来' });
  for (const phrase of translationese) problems.push({ key: 'doc', file: 'README.md', msg: `翻译腔句式「${phrase}」，建议改写成地道中文` });
  if (!hasLicense) problems.push({ key: 'doc', file: 'LICENSE', msg: '缺少 LICENSE' });
  if (!hasChangelog) problems.push({ key: 'doc', file: 'CHANGELOG.md', msg: '缺少 CHANGELOG（建议配 Conventional Commits 自动生成）' });

  docChecks.push(
    { title: 'README 存在且有定位', score: hasReadme ? 5 : 0, max: 5 },
    { title: 'README 有快速开始', score: hasQuickstart ? 5 : 0, max: 5 },
    { title: '文档无翻译腔', score: translationese.length ? 0 : 5, max: 5 },
    { title: '有 LICENSE', score: hasLicense ? 5 : 0, max: 5 },
    { title: '有 CHANGELOG', score: hasChangelog ? 5 : 0, max: 5 },
    { title: 'README 首段有实质内容', score: hasReadme && /\S/.test(readmeText.replace(/#.*$/gm, '')) ? 5 : 0, max: 5 }
  );

  // ---------- B. AI 协作（25） ----------
  const hasClaudeMd = rootExists('CLAUDE.md') || rootExists('AGENTS.md');
  // 优先读 CLAUDE.md（更详细），其次 AGENTS.md
  const agentFilePath = ['CLAUDE.md', 'AGENTS.md'].map((n) => path.join(targetDir, n)).find((p) => fs.existsSync(p));
  const claudeText = agentFilePath ? safeRead(agentFilePath) : '';
  const hasSkillDirs = rootExists(path.join('.claude', 'skills')) || rootExists(path.join('.cursor', 'rules')) || rootExists('.cursorrules');
  const hasCommands = /(npm (test|run|build)|yarn (test|run|build)|pnpm (test|run|build)|python .*(test|pytest)|go (test|build)|cargo (test|build)|mix test|make (test|build))/i.test(claudeText);

  if (!hasClaudeMd) problems.push({ key: 'ai', file: 'CLAUDE.md', msg: '缺少 CLAUDE.md/AGENTS.md，AI 不了解项目约定（可用 `zh-skills init` 生成）' });
  if (!hasSkillDirs) problems.push({ key: 'ai', file: '.claude/skills', msg: '未安装工程规范技能（可用 `zh-skills init` 一键安装）' });
  if (hasClaudeMd && !hasCommands) problems.push({ key: 'ai', file: 'CLAUDE.md', msg: 'CLAUDE.md 未写明常用命令，AI 不知道该跑什么' });

  const aiChecks = [
    { title: '有 CLAUDE.md / AGENTS.md', score: hasClaudeMd ? 10 : 0, max: 10 },
    { title: '有工程规范技能 / 规则', score: hasSkillDirs ? 10 : 0, max: 10 },
    { title: 'CLAUDE.md 写清了命令', score: hasCommands ? 5 : 0, max: 5 },
  ];

  // ---------- C. 命名健康（25） ----------
  const codeFiles = collectCodeFiles(targetDir);
  const pinyinHits = []; // { file, lines: [] }
  // 拼音标识符启发式：
  // - 前面不能是引号/反引号（排除字符串字面量，如词表数组本身）
  // - 后面必须紧跟 = : ( , .（标识符使用位，排除注释/纯文本）
  const pinyinRegex = new RegExp(`(?<!["'\`])[a-z_]*(${PINYIN_WORDS.join('|')})[a-z_]*\\b(?=\\s*[=:(),.])`, 'i');
  let fileCount = 0;
  for (const file of codeFiles) {
    fileCount++;
    const text = safeRead(file);
    const lines = hitLines(text, pinyinRegex);
    if (lines.length) pinyinHits.push({ file: path.relative(targetDir, file), lines });
  }
  // 无代码文件时无法评估命名，不给满分
  const pinyinScore = pinyinHits.length ? 0 : codeFiles.length ? 15 : 0;
  for (const h of pinyinHits.slice(0, 3)) {
    problems.push({ key: 'name', file: h.file, msg: `疑似拼音命名（第 ${h.lines.join(', ')} 行），建议改成英文` });
  }
  if (pinyinHits.length > 3) problems.push({ key: 'name', file: '(更多)', msg: `另有 ${pinyinHits.length - 3} 处疑似拼音命名，可用 health-check-zh 技能逐一处理` });

  const nameChecks = [
    { title: '代码中无拼音命名', score: pinyinScore, max: 15 },
    { title: '有 .gitignore（命名之外的仓库卫生）', score: rootExists('.gitignore') ? 10 : 0, max: 10 },
  ];
  if (!rootExists('.gitignore')) problems.push({ key: 'name', file: '.gitignore', msg: '缺少 .gitignore' });

  // ---------- D. 代码卫生（20） ----------
  let consoleLogCount = 0;
  let todoCount = 0;
  let commentedCodeLines = 0;
  for (const file of codeFiles) {
    const text = safeRead(file);
    // console.log 统计：排除"输出常量"（render 调用 / 纯标识符 / 属性 / 字符串字面量），
    // 只统计疑似调试残留（参数是表达式/模板变量的调用）
    const logLines = text
      .split('\n')
      .filter((l) => /console\.log\(/.test(l) && !/render\./.test(l))
      .filter((l) => !/console\.log\(\s*(?:[a-zA-Z_$][\w$.]*|"[^"]*"|'[^']*')\s*\)/.test(l)).length;
    consoleLogCount += logLines;
    // TODO 统计：要求后跟 : 或 (，避免把词表声明/正则自身当残留
    todoCount += (text.match(/\b(TODO|FIXME|HACK)\s*[:(]/g) || []).length;
    // 启发式：被注释掉且带常见代码特征的连续行
    const commented = text.split('\n').filter((l) => /^\s*(\/\/|#|--|\/\*|\*)\s*(if |for |const |let |function|return |import |from )/.test(l)).length;
    commentedCodeLines += commented;
  }
  if (consoleLogCount > 5) problems.push({ key: 'hygiene', file: 'src', msg: `检测到 ${consoleLogCount} 处 console.log，建议清理或改为正式日志` });
  if (todoCount > 5) problems.push({ key: 'hygiene', file: 'src', msg: `检测到 ${todoCount} 处 TODO/FIXME，建议建立待办清单跟踪` });
  if (commentedCodeLines > 5) problems.push({ key: 'hygiene', file: 'src', msg: `检测到 ${commentedCodeLines} 行被注释的死代码` });

  // fs.existsSync 不支持通配符，必须枚举具体文件名
  const lintFiles = [
    '.eslintrc', '.eslintrc.json', '.eslintrc.js', '.eslintrc.cjs',
    '.prettierrc', '.prettierrc.json', '.prettierrc.js', '.prettierrc.cjs',
    'biome.json', '.golangci.yml', '.rubocop.yml',
  ];
  const hasLint = lintFiles.some((f) => rootExists(f));

  const hygieneChecks = [
    { title: `console.log 残留 ≤ 5（当前 ${consoleLogCount}）`, score: consoleLogCount <= 5 ? 5 : 0, max: 5 },
    { title: `TODO/FIXME 残留 ≤ 5（当前 ${todoCount}）`, score: todoCount <= 5 ? 5 : 0, max: 5 },
    { title: `无整段注释死代码（当前 ${commentedCodeLines} 行）`, score: commentedCodeLines <= 5 ? 5 : 0, max: 5 },
    { title: '有 lint/format 配置', score: hasLint ? 5 : 0, max: 5 },
  ];

  // 按组结构化返回，打印时按固定顺序渲染（避免扁平数组切分错位）
  const grouped = { doc: docChecks, ai: aiChecks, name: nameChecks, hygiene: hygieneChecks };
  const total = Object.values(grouped).flat().reduce((sum, c) => sum + c.score, 0);
  const level = levelOf(total);

  return {
    targetDir,
    total,
    max: 100,
    level: level.key,
    levelLabel: level.label,
    levelNote: level.note,
    checks: grouped,
    problems,
    stats: {
      codeFiles: fileCount,
      consoleLogCount,
      todoCount,
    },
  };
}

/** 打印报告（纯展示，无副作用） */
function printReport(report) {
  const render = require('./render');
  console.log(render.title('🏥 zh-skills · 中文工程健康体检'));
  console.log(`${render.bold(`总分：${report.total}/100`)}  ${render.bold(report.levelLabel)}  ${render.gray(report.levelNote)}`);
  console.log(render.line());

  // 按固定顺序渲染分组
  const groups = [
    { key: 'doc', label: '文档健康' },
    { key: 'ai', label: 'AI 协作' },
    { key: 'name', label: '命名健康' },
    { key: 'hygiene', label: '代码卫生' },
  ];

  for (const g of groups) {
    const items = report.checks[g.key] || [];
    if (!items.length) continue;
    const sub = items.reduce((s, c) => s + c.score, 0);
    const subMax = items.reduce((s, c) => s + c.max, 0);
    const letter = { doc: 'A', ai: 'B', name: 'C', hygiene: 'D' }[g.key];
    console.log(`${render.bold(`${letter}. ${g.label}`)}  ${render.gray(`${sub}/${subMax}`)}`);
    for (const c of items) {
      const mark = c.score >= c.max ? render.green('✔') : render.yellow('·');
      const detail = c.score < c.max ? render.red(`-${c.max - c.score}`) : '';
      console.log(`  ${mark} ${c.title}${detail}`);
    }
  }

  if (report.problems.length) {
    console.log(render.line());
    console.log(render.bold('⚠ 待修复（按收益排序）'));
    report.problems.slice(0, 12).forEach((p, idx) => {
      console.log(`  ${idx + 1}. [${p.key}] ${p.file}: ${p.msg}`);
    });
  } else {
    console.log(render.line());
    console.log(render.ok('没有发现问题，中文工程规范执行得不错！'));
  }

  console.log(render.line());
  console.log(render.info('修复建议：`zh-skills init` 一键安装规范技能，再逐项按清单修复。'));
}

module.exports = { runDoctor, printReport, PINYIN_WORDS, TRANSLATIONESE };
