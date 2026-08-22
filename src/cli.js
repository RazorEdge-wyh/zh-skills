/**
 * zh-skills CLI 入口：参数解析 + 命令分发。
 *
 * 命令：
 *   zh-skills init    [--yes] [--dir <path>]  安装中文工程规范技能（可顺带生成 CLAUDE.md / AGENTS.md）
 *   zh-skills doctor  [--dir <path>]           项目"中文工程健康体检"
 *   zh-skills list                              列出可用技能
 *   zh-skills help / --help / -h
 *   zh-skills --version / -V
 */

const path = require('node:path');
const render = require('./render');
const { SKILL_META } = require('./skills');
const { runInit } = require('./init');
const { runDoctor, printReport } = require('./doctor');
const pkg = require('../package.json');

const HELP = `🏮 zh-skills v${pkg.version} — 给中文开发者的 Claude Code 中文工程规范技能包

用法：
  zh-skills init [--yes] [--dir <path>]   安装规范技能到项目的 .claude/skills/，可顺带生成 CLAUDE.md / AGENTS.md
  zh-skills doctor [--dir <path>]         对项目做"中文工程健康体检"（命名/文档/AI 协作/代码卫生）
  zh-skills list                           列出所有可用技能
  zh-skills help                           显示帮助
  zh-skills --version                      显示版本

选项：
  --yes       非交互模式，全部按默认执行（init 时自动生成 CLAUDE.md / AGENTS.md）
  --dir <path> 指定目标项目目录，默认当前目录

示例：
  zh-skills init --yes              # 在当前项目一键安装
  zh-skills doctor                  # 给当前项目体检
  zh-skills doctor --dir ./my-app   # 给指定项目体检
`;

/** 简单参数解析：拆出 --flag 与 --key value */
function parseArgs(argv) {
  const opts = { _: [], flags: new Set(), dir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--yes' || a === '-y') opts.flags.add('yes');
    else if (a === '--dir' || a === '-d') {
      opts.dir = argv[++i];
      if (opts.dir === undefined) {
        render.err('--dir 需要一个目录参数，如 --dir ./my-app');
        process.exit(1);
      }
    } else if (a === '--help' || a === '-h' || a === 'help') opts.flags.add('help');
    else if (a === '--version' || a === '-V' || a === 'version') opts.flags.add('version');
    else if (a.startsWith('-')) {
      /* 未知 flag：忽略，避免被误当成命令 */
    } else opts._.push(a);
  }
  return opts;
}

/** 打印技能列表 */
function printList() {
  render.title('🏮 zh-skills · 可用技能');
  for (const s of SKILL_META) {
    console.log(`${s.icon} ${render.bold(s.name)}`);
    console.log(render.gray(`   ${s.desc}`));
    console.log(render.gray(`   触发：${s.trigger}`));
    console.log('');
  }
  console.log(render.info(`共 ${SKILL_META.length} 个技能。安装：` + render.code('zh-skills init')));
}

async function main(argv) {
  const opts = parseArgs(argv);

  if (opts.flags.has('version')) {
    console.log(pkg.version);
    return;
  }
  if (opts.flags.has('help') || opts._.length === 0) {
    console.log(HELP);
    return;
  }

  const cmd = opts._[0];
  switch (cmd) {
    case 'init':
      await runInit({ dir: opts.dir, yes: opts.flags.has('yes') });
      break;
    case 'doctor':
      printReport(runDoctor(path.resolve(opts.dir || process.cwd())));
      break;
    case 'list':
      printList();
      break;
    default:
      render.err(`未知命令：${cmd}`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

module.exports = { main, parseArgs };
