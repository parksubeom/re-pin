// Pure mapping from submit_round's SQLSTATEs to an HTTP status + message.
// No server-only / framework import → unit-testable in isolation.
// 미지의 에러는 원문을 응답에 싣지 않는다(스키마 힌트 유출 방지) — 원문은 라우트에서 서버 로그로.
export type SubmitRoundError = { status: number; message: string; code?: string }

export function mapSubmitRoundError(code: string | undefined): SubmitRoundError {
  switch (code) {
    case 'P0002':
      return { status: 404, message: 'unknown share token', code }
    case 'P0003':
      return { status: 409, message: 'no draft pins to submit', code }
    case 'P0004':
      return { status: 409, message: 'no remaining rounds', code }
    default:
      return { status: 500, message: 'submit failed', code }
  }
}
