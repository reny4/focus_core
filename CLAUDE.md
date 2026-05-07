# CLAUDE.md — Focus Core

> このファイルは Claude Code が本プロジェクトを実装する際の **唯一の真実の源** である。
> 仕様書・設計判断・実装ルールをすべてここに集約する。
> コードを書く前に必ず全文を読み込むこと。

---

## 0. プロジェクト概要

**Focus Core** は「集中そのもの」を記録・可視化する集中支援アプリ。
目的は以下の 3 つを同時に満たすこと。

1. 実運用に耐えるシンプルな集中支援ツール
2. DDD を実践した設計・実装の証明
3. 就職活動用ポートフォリオ

**中核価値：** 目標時間後に自動でカウントアップし、ユーザーが終了するまで集中を尊重する。

---

## 1. 技術スタック

| 役割 | 技術 |
|------|------|
| Framework | Next.js App Router (TypeScript) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Form | React Hook Form + Zod |
| Charts | Recharts |
| Heatmap | Custom React Component / CSS Grid |
| Server State | TanStack Query |
| Backend | Next.js Route Handlers |
| BaaS | Supabase (Auth / PostgreSQL / RLS) |
| Test | Vitest |
| Deploy | Vercel + Supabase |

**採用しない技術（MVPでは不要）:**
- Prisma / Drizzle ORM → Supabase client + Repository 層で十分
- Redux / Zustand → TanStack Query + local state で十分
- Server Actions → Route Handlers を使う（API 仕様を明示するため）

---

## 2. アーキテクチャ概要

```
presentation  (app/ · components/ · hooks/ · presentation/api/)
     ↓
application   (usecases/ · dto/ · UseCaseError)
     ↓
domain        (entities/ · value-objects/ · repository interfaces) ← 依存なし
     ↑
infrastructure (SupabaseRepositories · AnalyticsQueryService)
```

- **domain** 層は外部ライブラリに一切依存しない純粋 TypeScript
- **application** 層は domain の repository interface に依存する（DI）
- **infrastructure** 層が interface を実装する
- **presentation** 層から直接 `supabase.from(...)` を呼ぶことは禁止

---

## 3. ディレクトリ構造

```
focus-core/
├── CLAUDE.md                           ← このファイル
├── .claude/
│   └── skills/
│       ├── claude-skill-creator/
│       │   └── SKILL.md               ← スキル作成ツール
│       └── apple-hig-ui/
│           └── SKILL.md               ← UI実装スキル（ユーザー記述）
│
├── supabase/
│   └── migrations/
│       ├── 001_create_profiles.sql
│       ├── 002_create_tags.sql
│       ├── 003_create_focus_tasks.sql
│       ├── 004_create_focus_sessions.sql
│       ├── 005_create_indexes.sql
│       ├── 006_create_functions.sql
│       ├── 007_create_triggers.sql
│       └── 008_create_rls_policies.sql
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── (auth)/login/page.tsx
    │   └── api/
    │       ├── focus-sessions/
    │       │   ├── start/route.ts
    │       │   ├── finish/route.ts
    │       │   ├── discard/route.ts
    │       │   └── active/route.ts
    │       ├── tags/
    │       │   ├── route.ts
    │       │   └── [tagId]/
    │       │       ├── route.ts
    │       │       └── archive/route.ts
    │       ├── focus-tasks/
    │       │   ├── route.ts
    │       │   └── [focusTaskId]/
    │       │       ├── route.ts
    │       │       └── archive/route.ts
    │       └── analytics/
    │           ├── daily/route.ts
    │           ├── weekly/route.ts
    │           ├── monthly/route.ts
    │           ├── yearly/route.ts
    │           ├── heatmap/route.ts
    │           ├── tags/route.ts
    │           └── sessions/route.ts   ← セッション履歴API
    │
    ├── domain/
    │   ├── focus/
    │   │   ├── entities/FocusSession.ts
    │   │   ├── value-objects/
    │   │   │   ├── TargetDuration.ts
    │   │   │   ├── ActualDuration.ts
    │   │   │   └── SessionSnapshot.ts
    │   │   ├── repositories/IFocusSessionRepository.ts
    │   │   └── errors/FocusDomainError.ts
    │   ├── catalog/
    │   │   ├── entities/Tag.ts
    │   │   ├── entities/FocusTask.ts
    │   │   ├── repositories/ITagRepository.ts
    │   │   ├── repositories/IFocusTaskRepository.ts
    │   │   └── errors/CatalogDomainError.ts
    │   └── shared/
    │       ├── types/UUID.ts
    │       ├── types/Result.ts
    │       └── errors/DomainError.ts
    │
    ├── application/
    │   ├── focus/usecases/
    │   │   ├── StartSession.ts
    │   │   ├── FinishSession.ts
    │   │   ├── DiscardSession.ts
    │   │   └── GetActiveSession.ts
    │   ├── catalog/usecases/
    │   │   ├── CreateTag.ts  UpdateTag.ts  ArchiveTag.ts  ListTags.ts
    │   │   ├── CreateFocusTask.ts  UpdateFocusTask.ts
    │   │   ├── ArchiveFocusTask.ts  ListFocusTasks.ts
    │   ├── analytics/queries/
    │   │   ├── GetDailyStats.ts  GetWeeklyStats.ts  GetMonthlyStats.ts
    │   │   ├── GetYearlyStats.ts  GetYearHeatmap.ts
    │   │   ├── GetTagBreakdown.ts  GetSessionHistory.ts
    │   └── shared/errors/UseCaseError.ts
    │
    ├── infrastructure/
    │   ├── supabase/client.ts  server.ts  types.ts
    │   ├── repositories/
    │   │   ├── SupabaseFocusSessionRepository.ts
    │   │   ├── SupabaseTagRepository.ts
    │   │   └── SupabaseFocusTaskRepository.ts
    │   └── queries/SupabaseAnalyticsQueryService.ts
    │
    ├── presentation/api/
    │   ├── ApiResult.ts
    │   ├── ApiErrorCode.ts
    │   ├── errorMapping.ts
    │   └── validation.ts
    │
    ├── components/
    │   ├── layout/  focus/  tasks/  analytics/  ui/
    │
    ├── hooks/
    │   ├── useActiveSession.ts  useFocusTasks.ts  useTags.ts
    │   ├── useStats.ts  useTimer.ts
    │
    ├── lib/
    │   ├── time/duration.ts  timezone.ts  format.ts
    │   └── constants/duration.ts  routes.ts
    │
    └── tests/
        ├── domain/FocusSession.test.ts
        ├── application/StartSession.test.ts  FinishSession.test.ts  DiscardSession.test.ts
        └── lib/duration.test.ts
```

---

## 4. ユビキタス言語（必ず統一する）

| 正しい名前 | 使ってはいけない名前 |
|------------|----------------------|
| `FocusTask` | `Task`, `Todo`, `Item` |
| `FocusSession` | `Session`, `Record`, `Pomodoro` |
| `Tag` | `Category`, `Label` |
| `TargetDuration` | `duration`, `time`, `timer` |
| `ActualDuration` | `elapsed`, `result` |
| `Snapshot` | `copy`, `cache` |
| `archive` | `delete`, `remove` |
| `finished` | `completed`, `done` |
| `discarded` | `cancelled`, `deleted` |

---

## 5. ドメインルール（厳守）

### FocusSession 状態遷移

```
active ──FinishSession──▶ finished  (統計対象)
active ──DiscardSession─▶ discarded (統計対象外)

※ 逆遷移は不可。finished/discarded から active には戻れない。
```

### 不変条件

- `active` → `ended_at IS NULL`, `actual_duration_seconds IS NULL`
- `finished` → `ended_at IS NOT NULL`, `actual_duration_seconds IS NOT NULL (> 0, <= 43200)`
- `discarded` → `actual_duration_seconds IS NULL`
- 1 User につき active FocusSession は **最大 1 つ**（DB 部分ユニーク制約で保証）

### TargetDuration

```
60秒 <= targetDurationSeconds <= 43200秒
```

### ActualDuration

```
actualDurationSeconds = endedAt - startedAt
最大値: 43200秒（12時間を超えた場合は43200秒に丸める）
```

### TimerPhase（DB保存禁止・導出のみ）

```typescript
elapsedSeconds = serverNow - startedAt

if (active session が存在しない)         → phase = 'idle'
if (elapsedSeconds < targetDuration)    → phase = 'counting_down'
if (elapsedSeconds >= targetDuration)   → phase = 'counting_up'
```

### Snapshot

- FocusSession 開始時に `focus_task_name_snapshot`, `tag_name_snapshot`, `tag_color_snapshot` を保存
- **開始後は一切更新しない**
- Tag / FocusTask の名前変更・アーカイブ後も過去セッションの表示を守る

---

## 6. API 設計ルール

### エンドポイント一覧

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
GET /api/analytics/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD  ← 追加
```

### 共通ルール

1. `userId` は **Request Body から受け取らない**。必ず Supabase Auth から取得する
2. `startedAt`, `endedAt`, `archivedAt` は **サーバー側で決定**する。クライアント時刻を信用しない
3. Request Body は Zod で必ず再検証する（UI 側バリデーション済みでも省略不可）
4. すべてのレスポンスは `ApiResult<T>` 型

### Response 形式

```typescript
// 成功
{ ok: true, value: T }

// 失敗
{ ok: false, error: { code: ApiErrorCode, message: string } }
```

### HTTP ステータスマッピング

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

## 7. エラーコード定義（確定版）

```typescript
// src/presentation/api/ApiErrorCode.ts

export const API_ERROR_CODES = {
  UNAUTHENTICATED:                'UNAUTHENTICATED',
  UNAUTHORIZED:                   'UNAUTHORIZED',
  INVALID_REQUEST:                'INVALID_REQUEST',
  FOCUS_TASK_NOT_FOUND:           'FOCUS_TASK_NOT_FOUND',
  FOCUS_TASK_NOT_AVAILABLE:       'FOCUS_TASK_NOT_AVAILABLE',
  FOCUS_TASK_IN_ACTIVE_SESSION:   'FOCUS_TASK_IN_ACTIVE_SESSION',  // ★追加
  TAG_NOT_FOUND:                  'TAG_NOT_FOUND',
  TAG_NOT_AVAILABLE:              'TAG_NOT_AVAILABLE',
  TAG_IN_ACTIVE_SESSION:          'TAG_IN_ACTIVE_SESSION',          // ★追加
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
  } satisfies Record<ApiErrorCode, number>   // ← コード追加漏れをコンパイル時に検出
  return map[code]
}
```

**新エラーコードの UI メッセージ:**

```typescript
FOCUS_TASK_IN_ACTIVE_SESSION: '進行中のセッションで使用中のタスクは変更できません。',
TAG_IN_ACTIVE_SESSION:        '進行中のセッションで使用中のタグは変更できません。',
```

---

## 8. ArchiveTag の確定仕様（修正）

**ArchiveTag UseCase の処理フロー:**

```
1. tagId の Tag がログインユーザーのものか確認
2. Tag に紐づく active FocusTask の中に、
   現在の active FocusSession で使用中のものが1つでもあれば
   → 409 TAG_IN_ACTIVE_SESSION を返して処理を中断
3. 上記に該当しなければ:
   - Tag.archived_at = serverNow
   - 同 Tag に紐づく active FocusTask を全てアーカイブ
   - 過去 FocusSession は一切変更しない
```

**UpdateTag / UpdateFocusTask / ArchiveFocusTask も同様:**

```typescript
// UpdateTag, ArchiveTag
if (activeSession?.tagId === tag.id) {
  return { ok: false, error: 'TAG_IN_ACTIVE_SESSION' }
}

// UpdateFocusTask, ArchiveFocusTask
if (activeSession?.focusTaskId === focusTask.id) {
  return { ok: false, error: 'FOCUS_TASK_IN_ACTIVE_SESSION' }
}
```

---

## 9. セッション履歴 API（追加）

```
GET /api/analytics/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD
```

**Response DTO:**

```typescript
export type GetSessionHistoryResponse = {
  sessions: SessionHistoryItemDto[]
}

export type SessionHistoryItemDto = {
  sessionId: string
  focusTaskName: string   // Snapshot 使用
  tagName: string         // Snapshot 使用
  tagColor: string        // Snapshot 使用
  targetDurationSeconds: number
  actualDurationSeconds: number
  startedAt: string
  endedAt: string
  overrunSeconds: number
}
```

対象: `status = 'finished'`、並び順: `started_at DESC`

---

## 10. 6時間確認ダイアログの確定仕様

```
- elapsedSeconds >= 21600 になった瞬間に1回だけ表示する
- クライアント側の useState フラグ（hasShownReviewDialog）で管理する
- ページリロード後は再度表示する（DB に保存しない）
- ダイアログ表示中もタイマーは停止しない
- FocusSession.status は active のまま維持する

// useTimer.ts での管理例
const [hasShownReviewDialog, setHasShownReviewDialog] = useState(false)
useEffect(() => {
  if (elapsedSeconds >= 21600 && !hasShownReviewDialog) {
    setHasShownReviewDialog(true)
    setShowReviewDialog(true)
  }
}, [elapsedSeconds])
```

---

## 11. サインアップ時の display_name 仕様

```
- display_name は任意入力とする
- サインアップフォームで email / password に加えて任意で入力を受け付ける
- supabase.auth.signUp() の options.data に含めて Trigger で受け取る

// サインアップ時
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { display_name: displayName || '' }
  }
})

// handle_new_user() Trigger 側（既存の COALESCE で対応済み）
COALESCE(NEW.raw_user_meta_data->>'display_name', '')
```

---

## 12. handle_new_user Trigger フォールバック

```typescript
// アプリ初期化時（_layout.tsx または useActiveSession の初回実行前）に実施

async function ensureProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!data) {
    // Trigger が失敗していた場合のフォールバック
    await supabase.from('profiles').upsert({
      id: userId,
      timezone: 'Asia/Tokyo',
    })
    // 初期タグも作成
    await supabase.from('tags').upsert([
      { user_id: userId, name: '勉強', color: '#3B82F6' },
      { user_id: userId, name: '読書', color: '#10B981' },
      { user_id: userId, name: '開発', color: '#8B5CF6' },
    ])
  }
}
```

---

## 13. 統計クエリのタイムゾーン方針

**SQL 側を主、アプリ側は UTC 範囲変換のみ。二重処理しない。**

```typescript
// アプリ側: timezone から UTC 範囲を計算して渡す
const fromUtc = toUtc(date, '00:00:00', timezone)  // 例: 2026-05-04T15:00:00Z
const toUtc   = toUtc(date, '23:59:59', timezone)  // 例: 2026-05-05T14:59:59Z

// SQL 側: timezone を使って日次グルーピング
SELECT
  DATE_TRUNC('day', started_at AT TIME ZONE $timezone) AS day,
  SUM(actual_duration_seconds) AS total_seconds
FROM focus_sessions
WHERE user_id = $userId
  AND status = 'finished'
  AND started_at >= $fromUtc
  AND started_at < $toUtc
GROUP BY day
ORDER BY day
```

---

## 14. Supabase Migration 実行順（確定版）

以下の順番を必ず守ること（外部キー依存順）:

```
1. profiles テーブル作成
2. tags テーブル作成
3. focus_tasks テーブル作成
4. focus_sessions テーブル作成
5. インデックス作成（部分ユニークインデックス含む）
6. set_updated_at Function 作成
7. updated_at Triggers 作成（4テーブル分）
8. handle_new_user Function 作成（SECURITY DEFINER）
9. on_auth_user_created Trigger 作成
10. RLS 有効化（4テーブル）
11. RLS Policies 作成（SELECT / INSERT / UPDATE のみ。DELETE なし）
```

> ⚠️ 元仕様書の 12 番目にあった「対象が active session で使用中なら 409 Conflict」の記述は **誤り** であったため削除済み。

---

## 15. 実装順序

この順序で実装すること。前のフェーズが完了してから次へ進む。

### Phase 0 — 環境構築・DB 基盤（1〜2日）

```
[ ] .env.local 設定（NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY）
[ ] supabase/migrations/ 全ファイル作成・適用
[ ] supabase gen types typescript > src/infrastructure/supabase/types.ts
[ ] supabase client/server.ts 作成
[ ] Next.js プロジェクト初期設定（shadcn/ui, TanStack Query, Recharts）
```

### Phase 1 — ドメイン層・テスト基盤（2〜3日）

```
[ ] Result<T,E> 型定義
[ ] DomainError 基底クラス
[ ] TargetDuration value object（バリデーション込み）
[ ] ActualDuration value object（最大値丸め込み）
[ ] SessionSnapshot value object
[ ] FocusSession entity（状態遷移・不変条件）
[ ] Tag entity
[ ] FocusTask entity
[ ] Repository interfaces（IFocusSessionRepository 等）
[ ] UseCaseError 定義（ApiErrorCode と satisfies で型安全に）
[ ] Vitest セットアップ
[ ] FocusSession.test.ts（全状態遷移テスト）
```

**Phase 1 移行条件: `vitest run` がすべてグリーンであること**

### Phase 2 — インフラ層・コアAPI（3〜4日）

```
[ ] SupabaseFocusSessionRepository 実装
[ ] SupabaseTagRepository 実装
[ ] SupabaseFocusTaskRepository 実装
[ ] StartSession UseCase（Snapshot 保存・競合チェック含む）
[ ] FinishSession UseCase（12時間丸め含む）
[ ] DiscardSession UseCase
[ ] GetActiveSession UseCase（導出値計算含む）
[ ] POST /api/focus-sessions/start route
[ ] POST /api/focus-sessions/finish route
[ ] POST /api/focus-sessions/discard route
[ ] GET  /api/focus-sessions/active route
[ ] StartSession.test.ts / FinishSession.test.ts / DiscardSession.test.ts
```

**Phase 2 移行条件: curl でセッションのライフサイクルが全て動作すること**

### Phase 3 — UI 実装（5〜7日）

```
[ ] 認証画面（login page）
[ ] ensureProfile フォールバック実装
[ ] AppHeader / MainLayout / BottomNavigation
[ ] useTimer hook（秒更新・phase 導出・ReviewDialog トリガー）
[ ] useActiveSession hook（TanStack Query）
[ ] TimerPanel / TimerDisplay / TargetDurationInput / SessionControls
[ ] ReviewDialog（6h 確認・タイマー継続中）
[ ] Catalog API 全系統（Tags / FocusTasks）
[ ] useFocusTasks / useTags hooks
[ ] TaskPanel / FocusTaskList / FocusTaskItem
[ ] FocusTaskDialog / TagManagerDialog
[ ] レスポンシブ対応（Desktop 2カラム / Mobile Bottom Navigation）
```

**⚠️ UI 実装前に `.claude/skills/apple-hig-ui/SKILL.md` を必ず読むこと**

### Phase 4 — Analytics・デプロイ（4〜6日）

```
[ ] SupabaseAnalyticsQueryService 実装
[ ] Analytics UseCase / Query 全系統
[ ] Analytics API 全系統（sessions 含む）
[ ] StatsPanel / DailyStats / WeeklyStats / MonthlyStats / YearlyStats
[ ] YearHeatmap（CSS Grid カスタムコンポーネント）
[ ] TagBreakdown（横棒グラフ + 円グラフ）
[ ] Vercel デプロイ設定
[ ] Supabase 本番環境設定
[ ] README 作成（設計判断の解説含む）
```

---

## 16. 禁止事項（絶対にやってはいけないこと）

```
✗ Task / Todo という名前を使う
✗ FocusTask に completed / dueDate / priority を追加する
✗ Tag を多対多にする
✗ FocusSession を物理削除する
✗ Tag / FocusTask を物理削除する
✗ counting_down / counting_up を DB に保存する
✗ タイマーの秒数を毎秒 DB 更新する
✗ userId を Request Body から受け取る
✗ startedAt / endedAt をクライアント時刻で保存する
✗ active session を複数許可する
✗ Snapshot を Tag / FocusTask 変更時に更新する
✗ Analytics ロジックを FocusSession Entity に入れる
✗ UIコンポーネント内で supabase.from() を直接呼ぶ
✗ Server Actions を使う（Route Handlers を使う）
✗ ORM（Prisma / Drizzle）を使う
✗ TimerPhase を DB に保存する
✗ アーカイブ済み FocusTask でセッションを開始する
✗ active session 中の FocusTask / Tag（当該セッションに紐づくもの）を編集・アーカイブする
```

---

## 17. MVP 完了条件

以下がすべて満たされた時点で MVP 完了とみなす。

```
[ ] ユーザー登録 / ログイン / ログアウトができる
[ ] 初期 Tag（勉強・読書・開発）が自動作成される
[ ] Tag を作成・編集・アーカイブできる
[ ] FocusTask を作成・編集・アーカイブできる
[ ] FocusTask を選んで FocusSession を開始できる
[ ] TargetDuration からカウントダウンできる
[ ] 0 秒到達後に自動でカウントアップに移行する
[ ] Finish で実績保存できる
[ ] Discard で統計対象外にできる
[ ] active session をリロード後に復元できる
[ ] 1 User につき active session が最大 1 つである
[ ] 日 / 週 / 月 / 年の統計が見られる
[ ] 年間ヒートマップが見られる
[ ] タグ別累計・割合が見られる
[ ] RLS で他人のデータを参照できない
[ ] スマホ・タブレットでも主要操作ができる
[ ] Vercel でアクセス可能な URL が存在する
```

---

## 18. テスト方針

### 優先度 高（必須）

**FocusSession Entity:**
- active で start できる
- active → finished に遷移できる
- active → discarded に遷移できる
- finished / discarded から active に戻れない
- 不正な TargetDuration を拒否する
- finished には endedAt と actualDuration が必須
- discarded には actualDuration を持たない

**UseCase:**
- StartSession: 正常作成 / active session 重複 / archived FocusTask / archived Tag / Snapshot 保存
- FinishSession: 正常終了 / 12時間丸め / active session なし
- DiscardSession: 正常破棄 / actualDuration が null / active session なし

### 優先度 中

- API validation（Zod schema）
- Error mapping（`satisfies` による型安全）
- Analytics クエリ
- timezone UTC 変換

### 優先度 低（余力あれば）

- Playwright E2E: ログイン → FocusTask 作成 → セッション開始 → Finish → 統計反映

---

## 19. UI 実装ガイドライン

**⚠️ UI を実装する前に必ず読むこと:**

```
.claude/skills/apple-hig-ui/SKILL.md
```

このスキルには Apple Human Interface Guidelines に基づいた
Focus Core の UI 実装方針が定義されている。
shadcn/ui のコンポーネント選択・カラーパレット・タイポグラフィ・
アニメーション方針はすべてこのスキルに従うこと。

**UIの基本方針（HIG 準拠）:**
- アプリではなく「道具」として振る舞う
- 集中を妨げる視覚ノイズを排除する
- タイマー表示（数字）を最も大きく・中心に配置する
- 操作要素は最小限にする
- 強い通知・フラッシュ・点滅を使わない

---

## 20. 環境変数

```bash
# .env.local（gitignore 済み）
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Service Role Key は通常処理では使わない
# 必要な場合のみ server-side 限定で使用
# SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

---

## 21. ポートフォリオで説明すべき技術的ポイント

面接・README で必ず言及する設計判断:

1. **FocusSession をコアエンティティとして設計** → 状態遷移と不変条件をドメインに集約
2. **TimerPhase を永続化せず導出状態に** → DB 汚染を防ぎ、startedAt から再計算可能
3. **目標時間後に自動カウントアップ** → 「ゾーン状態を尊重する」というドメイン価値の実装
4. **Tag / FocusTask を物理削除せずアーカイブ** → 過去実績の整合性を保護
5. **Snapshot で過去実績を不変に** → 名前変更・タグ変更が履歴を壊さない
6. **1 User 1 active session を DB 制約で保証** → 複数端末競合を防ぐ最終防衛線
7. **Supabase RLS で全テーブル保護** → アプリバグがあっても他人データに触れない
8. **UseCase / API で Result 型を採用** → 例外を throw しない予測可能なエラーハンドリング
9. **Analytics を Read Model として分離** → 集計ロジックがドメインを汚染しない
10. **satisfies による ApiErrorCode の型安全** → エラーコード追加時のマッピング漏れをコンパイル時検出