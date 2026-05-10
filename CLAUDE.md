# CLAUDE.md — Focus Core

> このファイルは Claude Code が本プロジェクトを実装する際の **唯一の真実の源** である。
> コードを書く前に必ず全文を読み込み、詳細仕様は各 docs/ ファイルを参照すること。

---

## 0. プロジェクト概要

**Focus Core** は「集中そのもの」を記録・可視化する集中支援アプリ。

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
| Animation | Framer Motion |
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

詳細は → **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**（ディレクトリ構造・Migration順・RLS設計・ポートフォリオポイント）

---

## 3. ドメインルール

詳細は → **[docs/DOMAIN.md](docs/DOMAIN.md)**（ユビキタス言語・状態遷移・各種不変条件・タイムゾーン方針）

**最重要ルール（コードに触れる前に確認）:**
- `FocusTask` / `FocusSession` / `Tag` / `TargetDuration` / `ActualDuration` / `Snapshot` / `archive` / `finished` / `discarded` という名前を必ず使う
- TimerPhase は **DB に保存しない**（導出のみ）
- 1 User につき active FocusSession は **最大 1 つ**
- Snapshot は開始後 **一切更新しない**

---

## 4. API 設計

詳細は → **[docs/API.md](docs/API.md)**（エンドポイント一覧・エラーコード・HTTPステータスマッピング）

**最重要ルール:**
- `userId` は Request Body から受け取らない（必ず Supabase Auth から取得）
- `startedAt` / `endedAt` はサーバー側で決定（クライアント時刻を信用しない）
- すべてのレスポンスは `ApiResult<T>` 型

---

## 5. テスト方針

詳細は → **[docs/TESTING.md](docs/TESTING.md)**（優先度・テストケース・実行コマンド）

---

## 6. Growth / Core Level

詳細は → **[docs/GROWTH.md](docs/GROWTH.md)**（XP仕様・Level計算・コンポーネント設計・演出フロー）

Growth専用禁止事項は **[docs/GROWTH.md](docs/GROWTH.md)** セクション2を参照。

---

## 7. 禁止事項（絶対にやってはいけないこと）

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

Growth専用禁止事項は **docs/GROWTH.md セクション2** を参照すること。

---

## 8. 実装順序（フェーズ一覧）

### MVP フェーズ

| Phase | 内容 | 移行条件 |
|-------|------|---------|
| 0 | 環境構築・DB基盤 | migrations 全適用・型生成完了 |
| 1 | ドメイン層・テスト基盤 | `vitest run` 全グリーン |
| 2 | インフラ層・コアAPI | curl でセッションライフサイクル動作 |
| 3 | UI 実装 | ⚠️ 実装前に `.claude/skills/apple-hig-ui/SKILL.md` を読む |
| 4 | Analytics・デプロイ | Vercel URL でアクセス可能 |

### Growth フェーズ（実装済み）

| Phase | 内容 |
|-------|------|
| G1 | 背景改善（globals.css） |
| G2 | DB Migration + FinishSession XP加算 |
| G3 | Growth API（GET /api/analytics/growth） |
| G4 | Framer Motion + useGrowth hook |
| G5 | GrowthIndicator（AppHeader） |
| G6 | CoreRing（TimerPanel） |
| G7 | LevelUpOverlay + XP演出 |

---

## 9. MVP 完了条件

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

## 10. UI 実装ガイドライン

**⚠️ UI を実装する前に必ず読むこと: `.claude/skills/apple-hig-ui/SKILL.md`**

- アプリではなく「道具」として振る舞う
- 集中を妨げる視覚ノイズを排除する
- タイマー表示（数字）を最も大きく・中心に配置する
- 操作要素は最小限にする
- 強い通知・フラッシュ・点滅を使わない

---

## 11. 環境変数

```bash
# .env.local（gitignore 済み）
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Service Role Key は通常処理では使わない（server-side 限定）
# SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```
