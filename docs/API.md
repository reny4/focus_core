# docs/API.md — API設計仕様

## エンドポイント一覧

```
# FocusSession
POST /api/focus-sessions/start
POST /api/focus-sessions/finish
POST /api/focus-sessions/discard
GET  /api/focus-sessions/active

# Tags
GET    /api/tags
POST   /api/tags
PATCH  /api/tags/:tagId
POST   /api/tags/:tagId/archive

# FocusTasks
GET    /api/focus-tasks
POST   /api/focus-tasks
PATCH  /api/focus-tasks/:focusTaskId
POST   /api/focus-tasks/:focusTaskId/archive

# Analytics
GET /api/analytics/daily?date=YYYY-MM-DD
GET /api/analytics/weekly?startDate=YYYY-MM-DD
GET /api/analytics/monthly?year=2026&month=5
GET /api/analytics/yearly?year=2026
GET /api/analytics/heatmap?year=2026
GET /api/analytics/tags?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /api/analytics/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /api/analytics/growth
```

---

## 共通ルール

1. `userId` は **Request Body から受け取らない**。必ず Supabase Auth から取得する
2. `startedAt`, `endedAt`, `archivedAt` は **サーバー側で決定**する。クライアント時刻を信用しない
3. Request Body は Zod で必ず再検証する（UI 側バリデーション済みでも省略不可）
4. すべてのレスポンスは `ApiResult<T>` 型

---

## Response 形式

```typescript
// 成功
{ ok: true, value: T }

// 失敗
{ ok: false, error: { code: ApiErrorCode, message: string } }
```

---

## HTTP ステータスマッピング

```
201 → StartSession 成功
200 → その他成功
400 → INVALID_REQUEST, DOMAIN_RULE_VIOLATION
401 → UNAUTHENTICATED
403 → UNAUTHORIZED
404 → *_NOT_FOUND
409 → *_NOT_AVAILABLE, ACTIVE_SESSION_ALREADY_EXISTS,
      FOCUS_TASK_IN_ACTIVE_SESSION, TAG_IN_ACTIVE_SESSION
500 → PERSISTENCE_FAILED, UNKNOWN_ERROR
```

---

## エラーコード定義（確定版）

```typescript
// src/presentation/api/ApiErrorCode.ts

export const API_ERROR_CODES = {
  UNAUTHENTICATED:                'UNAUTHENTICATED',
  UNAUTHORIZED:                   'UNAUTHORIZED',
  INVALID_REQUEST:                'INVALID_REQUEST',
  FOCUS_TASK_NOT_FOUND:           'FOCUS_TASK_NOT_FOUND',
  FOCUS_TASK_NOT_AVAILABLE:       'FOCUS_TASK_NOT_AVAILABLE',
  FOCUS_TASK_IN_ACTIVE_SESSION:   'FOCUS_TASK_IN_ACTIVE_SESSION',
  TAG_NOT_FOUND:                  'TAG_NOT_FOUND',
  TAG_NOT_AVAILABLE:              'TAG_NOT_AVAILABLE',
  TAG_IN_ACTIVE_SESSION:          'TAG_IN_ACTIVE_SESSION',
  ACTIVE_SESSION_ALREADY_EXISTS:  'ACTIVE_SESSION_ALREADY_EXISTS',
  ACTIVE_SESSION_NOT_FOUND:       'ACTIVE_SESSION_NOT_FOUND',
  DOMAIN_RULE_VIOLATION:          'DOMAIN_RULE_VIOLATION',
  PERSISTENCE_FAILED:             'PERSISTENCE_FAILED',
  UNKNOWN_ERROR:                  'UNKNOWN_ERROR',
} as const

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES]
```

**型安全のため `satisfies` を使う:**

```typescript
// errorMapping.ts
export function toHttpStatus(code: ApiErrorCode): number {
  const map: Record<ApiErrorCode, number> = {
    UNAUTHENTICATED:               401,
    UNAUTHORIZED:                  403,
    INVALID_REQUEST:               400,
    DOMAIN_RULE_VIOLATION:         400,
    FOCUS_TASK_NOT_FOUND:          404,
    TAG_NOT_FOUND:                 404,
    ACTIVE_SESSION_NOT_FOUND:      404,
    FOCUS_TASK_NOT_AVAILABLE:      409,
    TAG_NOT_AVAILABLE:             409,
    FOCUS_TASK_IN_ACTIVE_SESSION:  409,
    TAG_IN_ACTIVE_SESSION:         409,
    ACTIVE_SESSION_ALREADY_EXISTS: 409,
    PERSISTENCE_FAILED:            500,
    UNKNOWN_ERROR:                 500,
  } satisfies Record<ApiErrorCode, number>
  return map[code]
}
```

**新エラーコードの UI メッセージ:**

```typescript
FOCUS_TASK_IN_ACTIVE_SESSION: '進行中のセッションで使用中のタスクは変更できません。',
TAG_IN_ACTIVE_SESSION:        '進行中のセッションで使用中のタグは変更できません。',
```
