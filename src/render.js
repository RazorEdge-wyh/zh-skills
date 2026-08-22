/**
 * 终端输出工具：颜色、图标、代码块。
 *
 * 设计原则（本项目即规范示范）：
 * - Windows 旧终端不认部分 ANSI，先检测支持再上色。
 * - 所有输出走这里，方便将来切换颜色方案或做 i18n。
 */

const isTTY = Boolean(process.stdout && process.stdout.isTTY);

// Windows 10+ 开启 VT 支持；失败则静默退回无色。
function enableWindowsAnsi() {
  if (process.platform !== 'win32') return;
  try {
    // eslint-disable-next-line no-undef
    const cp = require('node:child_process');
    cp.execSync('echo', { stdio: 'ignore' });
  } catch {
    /* 忽略：无颜色输出也不影响功能 */
  }
}

const USE_COLOR = isTTY && !process.env.NO_COLOR;
enableWindowsAnsi();

const codes = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function paint(text, name) {
  if (!USE_COLOR) return text;
  return `${codes[name] || ''}${text}${codes.reset}`;
}

const render = {
  bold: (t) => paint(t, 'bold'),
  dim: (t) => paint(t, 'dim'),
  red: (t) => paint(t, 'red'),
  green: (t) => paint(t, 'green'),
  yellow: (t) => paint(t, 'yellow'),
  blue: (t) => paint(t, 'blue'),
  magenta: (t) => paint(t, 'magenta'),
  cyan: (t) => paint(t, 'cyan'),
  gray: (t) => paint(t, 'gray'),

  /** 带 emoji 的标题行 */
  title(text) {
    return `${render.bold(render.cyan(text))}\n`;
  },

  /** 成功 / 失败 / 提示标记 */
  ok(text) {
    return `${render.green('✔')} ${text}`;
  },
  warn(text) {
    return `${render.yellow('⚠')} ${text}`;
  },
  err(text) {
    return `${render.red('✖')} ${text}`;
  },
  info(text) {
    return `${render.blue('ℹ')} ${text}`;
  },

  /** 代码行（前面带缩进箭头） */
  code(text) {
    return `${render.gray('  ')}$ ${render.bold(text)}`;
  },

  /** 普通分隔线 */
  line() {
    return render.gray('─'.repeat(process.stdout.columns ? Math.min(process.stdout.columns, 60) : 60));
  },
};

module.exports = render;
