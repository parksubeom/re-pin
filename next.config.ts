import type { NextConfig } from 'next'

// 전 경로 공통 보안 헤더.
// - Referrer-Policy: /r/<shareToken>은 URL 자체가 열쇠(capability URL)라서, 외부 링크 클릭 시
//   Referer 헤더로 토큰 전체가 새는 것을 막는다(크로스 오리진엔 origin만 전송).
// - X-Frame-Options: 리뷰 화면을 iframe에 씌워 제출 버튼 오클릭을 유도하는 클릭재킹 차단.
// - nosniff: 응답을 선언된 Content-Type으로만 해석(업로드 파일 sniffing 방지).
const securityHeaders = [
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
