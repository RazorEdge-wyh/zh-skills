/**
 * CLI 参数解析测试。
 */

const test = require('node:test');
const assert = require('node:assert');

const { parseArgs } = require('../src/cli');

test('parseArgs 识别 init 命令与 --yes', () => {
  const opts = parseArgs(['init', '--yes']);
  assert.deepStrictEqual(opts._, ['init']);
  assert.ok(opts.flags.has('yes'));
});

test('parseArgs 识别 --dir', () => {
  const opts = parseArgs(['doctor', '--dir', './my-app']);
  assert.deepStrictEqual(opts._, ['doctor']);
  assert.strictEqual(opts.dir, './my-app');
});

test('parseArgs 识别 help / version', () => {
  assert.ok(parseArgs(['help']).flags.has('help'));
  assert.ok(parseArgs(['--version']).flags.has('version'));
  assert.ok(parseArgs(['-V']).flags.has('version'));
});

test('parseArgs 忽略未知 flag 但保留位置参数', () => {
  const opts = parseArgs(['list', '--whatever']);
  assert.deepStrictEqual(opts._, ['list']);
});
