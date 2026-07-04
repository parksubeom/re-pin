// Generates src/shared/api/schema.d.ts from the OpenAPI spec (rules/40).
// Runs the LOCAL openapi-typescript binary directly via Node — not `npx` (which could fetch a
// different version) and not `pnpm exec` (which crashes natively in this Windows/pnpm setup).
// Cross-platform: no POSIX $VAR, no shell. Override the source with OPENAPI_SCHEMA.
//   node scripts/gen-api.mjs
//   OPENAPI_SCHEMA=./openapi.json node scripts/gen-api.mjs   (PowerShell: $env:OPENAPI_SCHEMA='...'; pnpm run gen:api)
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const schema = process.env.OPENAPI_SCHEMA ?? './openapi.json'
const out = 'src/shared/api/schema.d.ts'
const cli = resolve(root, 'node_modules/openapi-typescript/bin/cli.js')

const res = spawnSync(process.execPath, [cli, schema, '--output', out], {
  cwd: root,
  stdio: 'inherit',
})

if (res.status !== 0) {
  console.error(`\ngen:api failed (exit ${res.status ?? 'null'})`)
  process.exit(res.status ?? 1)
}
console.log(`\ngen:api ok → ${out}`)
