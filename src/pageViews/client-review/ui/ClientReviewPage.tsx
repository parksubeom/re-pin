import type { ProjectDTO } from '@/shared/api/types'
import { ReviewCanvas } from '@/widgets/review-canvas'

type Props = { project: ProjectDTO }

const PLACEHOLDER_IMAGE =
  'https://placehold.co/1200x800/EDECE6/A5A49C?text=%EC%8B%9C%EC%95%88+%EC%97%86%EC%9D%8C'

/**
 * 클라이언트가 링크로 진입하는 리뷰 화면. 로그인 없음.
 * 서버(RSC)에서 조회한 프로젝트를 받아 렌더한다. 상태 영속화는 ReviewCanvas의 API 훅이 담당.
 */
export function ClientReviewPage({ project }: Props) {
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
        📌 {project.title}
      </header>
      <ReviewCanvas project={project} draftImageUrl={project.draftImageUrl ?? PLACEHOLDER_IMAGE} />
    </main>
  )
}
