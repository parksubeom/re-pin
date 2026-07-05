'use client'

import { useState } from 'react'

import type { ProjectSummary } from '@/entities/project/api/listProjectsByOwner'

export function ProjectListItem({ project }: { project: ProjectSummary }) {
  const [copied, setCopied] = useState(false)
  const path = `/r/${project.shareToken}`

  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`)
    setCopied(true)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 15 }}>{project.title}</p>
        <p style={{ fontSize: 13, color: 'var(--txt-2)', marginTop: 2 }}>
          수정 {project.includedRounds}회 중 {project.usedRounds}회 사용 · 잔여 {project.remaining}
          회
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a
          href={path}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--pin-deep)',
            padding: '6px 10px',
            textDecoration: 'none',
          }}
        >
          열기
        </a>
        <button
          type="button"
          onClick={copy}
          style={{
            background: 'var(--ink)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {copied ? '복사됨 ✓' : '링크 복사'}
        </button>
      </div>
    </div>
  )
}
