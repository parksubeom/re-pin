---
name: create-adr
description: 템플릿을 기반으로 docs/adr에 다음 번호의 Architecture Decision Record를 생성한다. 중요한 아키텍처/툴링 결정을 기록해야 할 때 사용.
---

# Architecture Decision Record 추가

중요한 결정을 `docs/adr/`에 기록한다. 규칙 변경(스택/구조/도구)은 ADR로 남기는 것이 원칙
(`rules/10-guardrails.md`의 "변경 사유 먼저" 원칙과 짝).

## 단계
1. `docs/adr/`에서 가장 높은 `NNNN-*.md`를 찾아 다음 번호(4자리 zero-pad)를 사용.
2. `docs/adr/0000-template.md`를 `docs/adr/<NNNN>-<kebab-title>.md`로 복사.
3. 채운다: 제목, `상태: accepted`(또는 `proposed`), 오늘 날짜, 결정자, **배경/결정/결과/검토한 대안**.
   간결·사실 위주, 결정은 능동태("우리는 … 한다").
4. `docs/adr/README.md` 표에 행 추가.
5. 이 결정이 이전 ADR을 대체하면 기존 ADR 상태를 `superseded by [NNNN](...)`로 —
   **확정된 ADR 본문은 절대 수정하지 않는다.**

## 참고
- 결정 하나당 파일 하나. 관련 ADR은 상대 링크로 연결.
- 결정이 규칙(`claude/rules/`)에 영향을 주면 해당 규칙 문서와 `CLAUDE.md`도 함께 갱신.
