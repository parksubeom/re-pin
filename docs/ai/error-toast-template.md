# 템플릿 — API 에러 → 토스트 처리

`rules/60-error-handling.md`의 구체 패턴. 새 뮤테이션/쿼리를 추가할 때 이 형태를 복사한다.

## 원칙
- 에러 토스트는 **한 레이어만** 소유(중앙 인터셉터 OR 호출부 catch). 중복 금지.
- 메시지는 레지스트리(SSoT)에서 해석. 문자열을 컴포넌트에 흩뿌리지 않는다.
- `message`는 `string | string[]` 가정.

## 뮤테이션 예시
```ts
export function useCreateUser() {
  return useMutation({
    mutationFn: async (body: CreateUserBody) => {
      const { data, error } = await apiClient.POST('/users', { body })
      if (error) throw error // 토스트는 중앙 인터셉터가 처리
      return data
    },
  })
}
```

## 화면 분기
```vue
<script setup lang="ts">
const { data, isPending, isError, error } = useUsersQuery()
</script>
<template>
  <Spinner v-if="isPending" />
  <ErrorState v-else-if="isError" :error="error" />
  <UserList v-else :users="data" />
</template>
```

> 백엔드 에러 envelope/코드 카탈로그가 확정되면 인터셉터의 매핑 규칙을 여기에 구체화한다.
