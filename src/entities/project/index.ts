// Public API for the project entity — CLIENT-SAFE surface only.
// The server-only reader getProjectByShareToken is intentionally NOT re-exported here:
// re-exporting it would pull `import 'server-only'` into any client component importing this
// barrel (a build error). RSC / Route Handlers import it by its deep path:
//   import { getProjectByShareToken } from '@/entities/project/api/getProjectByShareToken'
export type { Project } from './model/types'
export { projectQueryKey } from './model/queryKeys'
export { useProjectQuery } from './api/useProjectQuery'
