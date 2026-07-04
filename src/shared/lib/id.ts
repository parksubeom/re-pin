export function createId(prefix = ''): string {
  const rand = crypto.randomUUID().replaceAll('-', '').slice(0, 10)
  return prefix ? `${prefix}_${rand}` : rand
}
