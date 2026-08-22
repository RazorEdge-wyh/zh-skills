#!/usr/bin/env node
/**
 * zh-skills 可执行入口。
 * 保持薄壳：所有逻辑在 src/ 下，方便测试。
 */
require('../src/cli').main(process.argv.slice(2));
