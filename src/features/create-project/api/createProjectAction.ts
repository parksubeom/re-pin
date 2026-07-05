'use server'

import { revalidatePath } from 'next/cache'

import { requireMaker } from '@/shared/api/auth.server'
import { supabaseServerRls } from '@/shared/api/supabase.rls'
import { supabaseServer } from '@/shared/api/supabase.server'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])
const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export type CreateProjectResult = { ok: true; shareToken: string } | { ok: false; message: string }

/**
 * Maker flow (M2: owner-scoped). requireMaker gates it (unauth → redirect /login). The project
 * row is inserted via the cookie/RLS client with owner_id = auth.uid() (RLS WITH CHECK enforces
 * it). The image upload uses the secret client (private Storage bucket, project-id-scoped key).
 */
export async function createProjectAction(formData: FormData): Promise<CreateProjectResult> {
  const user = await requireMaker()

  const title = String(formData.get('title') ?? '').trim()
  const includedRoundsRaw = Number(formData.get('includedRounds'))
  const file = formData.get('image')

  if (title.length < 1 || title.length > 200) {
    return { ok: false, message: '제목은 1~200자여야 합니다.' }
  }
  if (!Number.isInteger(includedRoundsRaw) || includedRoundsRaw < 1) {
    return { ok: false, message: '수정 횟수는 1 이상의 정수여야 합니다.' }
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: '시안 이미지를 첨부해 주세요.' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: '이미지는 10MB 이하여야 합니다.' }
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, message: 'PNG·JPG·WebP 이미지만 업로드할 수 있습니다.' }
  }

  const rls = await supabaseServerRls()

  // 1) create the project row (owner-scoped; DB default mints the share_token).
  const { data: project, error: insertErr } = await rls
    .from('projects')
    .insert({ title, included_rounds: includedRoundsRaw, owner_id: user.id })
    .select('id, share_token')
    .single()
  if (insertErr || !project) {
    return { ok: false, message: '프로젝트 생성에 실패했습니다.' }
  }

  // 2) upload the image via the secret client (Storage; server-derived key, never file.name).
  const secret = supabaseServer()
  const ext = EXT[file.type] ?? 'png'
  const objectPath = `${project.id}/draft.${ext}`
  const { error: uploadErr } = await secret.storage
    .from('drafts')
    .upload(objectPath, file, { contentType: file.type, upsert: true })
  if (uploadErr) {
    await rls.from('projects').delete().eq('id', project.id) // roll back the owned row
    return { ok: false, message: '이미지 업로드에 실패했습니다.' }
  }

  // 3) record the storage path on the owned project row.
  const { error: updateErr } = await rls
    .from('projects')
    .update({ image_path: objectPath })
    .eq('id', project.id)
  if (updateErr) {
    return { ok: false, message: '이미지 경로 저장에 실패했습니다.' }
  }

  revalidatePath('/')
  return { ok: true, shareToken: project.share_token }
}
