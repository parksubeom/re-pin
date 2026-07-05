import { notFound } from 'next/navigation'

import { getProjectByShareToken } from '@/entities/project/api/getProjectByShareToken'
import { ClientReviewPage } from '@/pageViews/client-review'

type Props = { params: Promise<{ shareToken: string }> }

// RSC: fetch the project on the server, pass it down. Unknown token → 404.
export default async function Page({ params }: Props) {
  const { shareToken } = await params
  const project = await getProjectByShareToken(shareToken)
  if (!project) notFound()
  return <ClientReviewPage project={project} />
}
