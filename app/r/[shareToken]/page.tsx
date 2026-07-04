import { ClientReviewPage } from '@/pages/client-review'

type Props = { params: Promise<{ shareToken: string }> }

export default async function Page({ params }: Props) {
  const { shareToken } = await params
  return <ClientReviewPage shareToken={shareToken} />
}
