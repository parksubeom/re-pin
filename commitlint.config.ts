import type { UserConfig } from '@commitlint/types'

/**
 * Conventional Commits enforcement (commit-msg hook) + cz-git prompt config
 * (`pnpm run commit`). Allowed types are kept in sync between both.
 */
const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
  prompt: {
    alias: { fd: 'docs: fix typos' },
    useEmoji: false,
    allowEmptyScopes: true,
  },
}

export default config
