import Link from 'next/link'

import { listProjectsByOwner } from '@/entities/project/api/listProjectsByOwner'
import { SignOutButton } from '@/features/auth'
import { CreateProjectForm } from '@/features/create-project'
import { requireMaker } from '@/shared/api/auth.server'

import { ProjectListItem } from './ProjectListItem'

/**
 * 제작자용 대시보드 (로그인 필수). 본인 프로젝트 목록 + 시안 업로드 → 공유 링크 발급.
 * 로그인 안 했으면 requireMaker가 /login으로 리다이렉트.
 */
export async function DashboardPage() {
  const user = await requireMaker()
  const projects = await listProjectsByOwner()

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>수정핀 대시보드</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--txt-2)' }}>{user.email}</span>
          <SignOutButton />
        </div>
      </div>
      <p style={{ marginTop: 8, color: 'var(--txt-2)', fontSize: 15 }}>
        시안 이미지를 올리면 공유 링크가 발급됩니다. 클라이언트는 링크만 열어 핀을 남깁니다.
      </p>

      <div style={{ marginTop: 28 }}>
        <CreateProjectForm />
      </div>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>내 프로젝트</h2>
        {projects.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--txt-2)' }}>
            아직 프로젝트가 없습니다. 위에서 첫 시안을 올려 보세요.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.map((p) => (
              <ProjectListItem key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      <div style={{ marginTop: 28, fontSize: 13, color: 'var(--txt-2)' }}>
        데모를 먼저 보시려면{' '}
        <Link href="/r/demo" style={{ color: 'var(--pin-deep)', fontWeight: 700 }}>
          /r/demo
        </Link>{' '}
        를 여세요.
      </div>
    </main>
  )
}
