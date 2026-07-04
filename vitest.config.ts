import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig, configDefaults } from 'vitest/config'

// Next.js has no Vite config, so Vitest gets its own minimal one.
// `vite-tsconfig-paths` reuses the `@/*` alias from tsconfig.json.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // Only our own source specs. Keeps Vitest out of `.claude/` skill templates
    // (which ship Vue example specs) and node_modules.
    include: ['src/**/*.spec.{ts,tsx}'],
    // Component/unit specs live next to source as `*.spec.tsx`.
    // Playwright owns everything under `e2e/`; `.claude/` holds skill templates.
    exclude: [...configDefaults.exclude, 'e2e/**', '.claude/**'],
    // No specs yet at bootstrap; M1's write-test step adds real ones.
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/shared/api/schema.d.ts',
      ],
    },
  },
})
