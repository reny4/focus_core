# Focus Core

集中そのものを記録・可視化する集中支援アプリ。

> 目標時間後に自動でカウントアップし、ユーザーが終了するまで集中を尊重する。

**[🚀 本番 URL](https://focus-core.vercel.app)**

---

## 技術スタック

| 役割 | 技術 | 選定理由 |
|---|---|---|
| Framework | Next.js 16 App Router | Server Components + Route Handlers でサーバー/クライアント境界を明示できる |
| Styling | Tailwind CSS v4 | CSS 変数ベースのデザイントークン管理が Tailwind v4 で自然に書ける |
| UI | shadcn/ui (base-nova) | @base-ui/react を採用した最新スタイル; アクセシビリティが標準で入る |
| Server State | TanStack Query | staleTime 制御でクライアントキャッシュと再取得タイミングを精密に管理できる |
| Forms | React Hook Form + Zod | スキーマ定義を一箇所に集約し、型安全な検証を実現 |
| Charts | Recharts | React ネイティブで SSR 対応済み; `isAnimationActive={false}` で HIG 準拠 |
| BaaS | Supabase | PostgreSQL + RLS + Auth がフルマネージド |
| Test | Vitest | Jest 互換で ESM ネイティブ; 高速フィードバック |

---

## 設計判断

### 1. FocusSession をコアエンティティとして設計した

```typescript
// ドメイン層がビジネスルールを管理する
const session = FocusSession.startNew(id, userId, focusTaskId, ...)
const finished = session.finish(endedAt)  // active でなければ DomainError
```

active → finished / active → discarded の状態遷移と不変条件を UI や DB ではなくドメイン層に集約した。「集中記録を誤って上書きできない」という制約がコードで表現される。

---

### 2. TimerPhase を永続化せず導出状態として扱った

```typescript
// DB には startedAt と targetDuration だけ保存
// phase はサーバーでリクエストのたびに導出する
elapsedSeconds = serverNow - startedAt
phase = elapsed < target ? 'counting_down' : 'counting_up'
```

`counting_down` / `counting_up` を DB に保存しない。`startedAt` から再計算すれば常に正確な値が得られるため、複数デバイスからアクセスしても状態が一致する。

---

### 3. 目標時間後に自動カウントアップする

```typescript
// useTimer.ts — phase 切り替えはクライアント側で秒ごとに導出
const phase = elapsedSeconds < targetDurationSeconds ? 'counting_down' : 'counting_up'
```

Pomodoro は「時間になったら止まれ」と強制するが、Focus Core は「ゾーン状態を尊重する」。カウントアップが続く間はユーザーが集中中であることを示し、終了はユーザーが判断する。

---

### 4. Tag / FocusTask を物理削除せずアーカイブした

```typescript
// archive = archived_at に日時をセットするだけ
// 過去の FocusSession は tag_name_snapshot / tag_color_snapshot を持つ
```

データを消すとセッション履歴の整合性が壊れる。アーカイブ設計にすることで、タグの名前変更・削除後も過去統計が正確なまま維持される。

---

### 5. Snapshot で過去実績を不変にした

```typescript
// セッション開始時に名前をコピーして保存する
focus_task_name_snapshot: focusTask.name,
tag_name_snapshot: tag.name,
tag_color_snapshot: tag.color,
```

`JOIN` に頼ると、タグを後から変更すると過去の集計表示が変わる。Snapshot を使うと「その日に何をやったか」が永久に正確に保たれる。

---

### 6. 1 User 1 active session を DB 制約で保証した

```sql
-- 部分ユニークインデックス
CREATE UNIQUE INDEX unique_active_session_per_user
ON focus_sessions (user_id)
WHERE status = 'active';
```

アプリコードだけで重複を弾いても、並行リクエスト（別デバイス・タブ）で競合が起きる。DB 制約を最終防衛線にすることで、どんな条件でもアクティブセッションは必ず 1 つに保たれる。

---

### 7. Supabase RLS で全テーブルを保護した

```sql
CREATE POLICY "Users can only access their own sessions"
ON focus_sessions FOR ALL
USING (auth.uid() = user_id);
```

アプリ層にバグがあっても RLS が最後の砦になる。`userId` を Request Body から受け取る設計は排除し、常に `auth.uid()` を信頼する。

---

### 8. UseCase / API で Result 型を採用した

```typescript
// throw を使わない予測可能なエラーハンドリング
export async function startSession(...): Promise<Result<SessionDto, UseCaseError>> {
  const focusTask = await deps.focusTaskRepo.findById(input.focusTaskId)
  if (!focusTask) return err(new UseCaseError('FOCUS_TASK_NOT_FOUND'))
  return ok(dto)
}
```

`try-catch` の連鎖を避け、`Result<T, E>` 型でエラーを値として扱う。呼び出し元はコンパイル時にエラーケースへの対処を強制される。

---

### 9. Analytics を Read Model として分離した

```
domain/focus/entities/FocusSession.ts   ← 状態遷移のみ
application/analytics/queries/          ← 集計クエリ（ドメインに触らない）
```

集計ロジックをドメインエンティティに入れると単一責任原則に違反する。`IAnalyticsQueryService` を独立したインターフェースとして定義し、`SupabaseAnalyticsQueryService` が実装する。

---

### 10. `satisfies` による ApiErrorCode の型安全

```typescript
export const toHttpStatus = (code: ApiErrorCode): number => {
  const map: Record<ApiErrorCode, number> = {
    UNAUTHENTICATED: 401,
    // ... 全コードを列挙
  } satisfies Record<ApiErrorCode, number>  // ← 追加漏れをコンパイル時に検出
  return map[code]
}
```

新しいエラーコードを `ApiErrorCode` に追加した瞬間、`satisfies` がマッピングの未定義を型エラーとして検出する。

---

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────┐
│  presentation                                   │
│  app/api/*  components/*  hooks/*               │  ← UIとHTTPの境界
├─────────────────────────────────────────────────┤
│  application                                    │
│  usecases/*  analytics/queries/*                │  ← ビジネスロジック
├─────────────────────────────────────────────────┤
│  domain                                         │
│  entities/*  value-objects/*  repositories/*    │  ← 純粋TypeScript、外部依存なし
├─────────────────────────────────────────────────┤
│  infrastructure                                 │
│  repositories/*  queries/*                      │  ← Supabase実装
└─────────────────────────────────────────────────┘
```

依存の向きは常に上から下。`infrastructure` は `domain` のインターフェースを実装し、`application` に DI で渡される。

---

## ローカル開発環境のセットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/reny4/focus-core.git && cd focus-core

# 2. 依存をインストール
npm install

# 3. 環境変数を設定
cp .env.local.example .env.local
# NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定

# 4. Supabase に Migration を適用
supabase db push --linked

# 5. 開発サーバーを起動
npm run dev  # http://localhost:3000
```

---

## デプロイ

- **本番 URL**: https://focus-core.vercel.app
- **ホスティング**: Vercel（Next.js App Router 最適化済み）
- **データベース**: Supabase（PostgreSQL + RLS + Auth）

### Vercel 環境変数

```
NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxx...
```

---

## ライセンス

MIT
