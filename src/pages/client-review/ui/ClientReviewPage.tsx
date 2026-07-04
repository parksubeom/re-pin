import { ReviewCanvas } from '@/widgets/review-canvas'

type Props = { shareToken: string }

/**
 * 클라이언트가 링크로 진입하는 리뷰 화면. 로그인 없음.
 * MVP 단계: shareToken → 프로젝트 조회는 API 연결 시 구현.
 * 지금은 데모 시안으로 핵심 인터랙션을 확인한다.
 */
export function ClientReviewPage({ shareToken }: Props) {
  const demoProject = {
    title: `시안 검토 (${shareToken})`,
    draftImageUrl: 'https://placehold.co/1200x800/EDECE6/A5A49C?text=%EC%8B%9C%EC%95%88+%EB%AF%B8%EB%A6%AC%EB%B3%B4%EA%B8%B0',
    policy: { includedRounds: 2 },
  }

  return (
    <main>
      <header
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          fontWeight: 800,
          fontSize: 15,
        }}
      >
        📌 {demoProject.title}
      </header>
      <ReviewCanvas draftImageUrl={demoProject.draftImageUrl} policy={demoProject.policy} />
    </main>
  )
}
