// Pure mapping from submit_round's SQLSTATEs to an HTTP status + message.
// No server-only / framework import → unit-testable in isolation.
export type SubmitRoundError = { status: number; message: string; code?: string }

export function mapSubmitRoundError(code: string | undefined, message: string): SubmitRoundError {
  switch (code) {
    case 'P0002':
      return { status: 404, message: 'unknown share token', code }
    case 'P0003':
      return { status: 409, message: 'no draft pins to submit', code }
    case 'P0004':
      return { status: 409, message: 'no remaining rounds', code }
    default:
      return { status: 500, message: message || 'submit failed', code }
  }
}
