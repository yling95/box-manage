module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新增功能
        'del', // 删除功能
        'fix', // 修复问题
        'docs', // 文档变更
        'style', // 代码风格/样式改动
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建/辅助工具的变动
        'revert', // 版本回退
        'build', // 打包
      ],
    ],
  },
}
