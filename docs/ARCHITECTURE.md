# docs/ARCHITECTURE.md — アーキテクチャ・インフラ設計

## レイヤー構成と責務

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

## ディレクトリ構造

```
focus-core/
├── CLAUDE.md
├── GROWTH.md                           ← ルートからは削除済み（docs/GROWTH.mdへ）
├── docs/
│   ├── DOMAIN.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── TESTING.md
│   └── GROWTH.md
├── .claude/
│   └── skills/
│       ├── claude-skill-creator/SKILL.md
│       └── apple-hig-ui/SKILL.md
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
│       ├── 008_create_rls_policies.sql
│       └── 009_add_growth_columns.sql
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── (auth)/login/page.tsx
    │   └── api/
    │       ├── focus-sessions/ (start · finish · discard · active)
    │       ├── tags/ (route · [tagId]/route · [tagId]/archive)
    │       ├── focus-tasks/ (route · [focusTaskId]/route · [focusTaskId]/archive)
    │       └── analytics/ (daily · weekly · monthly · yearly · heatmap · tags · sessions · growth)
    │
    ├── domain/
    │   ├── focus/
    │   │   ├── entities/FocusSession.ts
    │   │   ├── value-objects/ (TargetDuration · ActualDuration · SessionSnapshot)
    │   │   ├── repositories/IFocusSessionRepository.ts
    │   │   └── errors/FocusDomainError.ts
    │   ├── catalog/
    │   │   ├── entities/ (Tag · FocusTask)
    │   │   ├── repositories/ (ITagRepository · IFocusTaskRepository)
    │   │   └── errors/CatalogDomainError.ts
    │   ├── profile/
    │   │   └── repositories/IProfileRepository.ts
    │   └── shared/
    │       ├── types/ (UUID · Result)
    │       └── errors/DomainError.ts
    │
    ├── application/
    │   ├── focus/usecases/ (StartSession · FinishSession · DiscardSession · GetActiveSession)
    │   ├── catalog/usecases/ (CreateTag · UpdateTag · ArchiveTag · ListTags · CreateFocusTask · UpdateFocusTask · ArchiveFocusTask · ListFocusTasks)
    │   ├── analytics/
    │   │   ├── queries/ (GetDailyStats · GetWeeklyStats · GetMonthlyStats · GetYearlyStats · GetYearHeatmap · GetTagBreakdown · GetSessionHistory · GetGrowthStats)
    │   │   ├── dto/AnalyticsDtos.ts
    │   │   └── queries/IAnalyticsQueryService.ts
    │   └── shared/errors/UseCaseError.ts
    │
    ├── infrastructure/
    │   ├── supabase/ (client.ts · server.ts · types.ts)
    │   ├── repositories/ (SupabaseFocusSessionRepository · SupabaseTagRepository · SupabaseFocusTaskRepository · SupabaseProfileRepository)
    │   └── queries/SupabaseAnalyticsQueryService.ts
    │
    ├── presentation/api/
    │   ├── ApiResult.ts
    │   ├── ApiErrorCode.ts
    │   ├── errorMapping.ts
    │   └── validation.ts
    │
    ├── components/
    │   ├── layout/ (AppHeader · MainLayout · BottomNavigation)
    │   ├── focus/ (TimerPanel · TimerDisplay · TargetDurationInput · SessionControls · ReviewDialog)
    │   ├── growth/ (CoreRing · GrowthIndicator · LevelUpOverlay)
    │   ├── tasks/
    │   ├── analytics/
    │   └── ui/
    │
    ├── hooks/
    │   ├── useActiveSession.ts  useFocusTasks.ts  useTags.ts
    │   ├── useStats.ts  useTimer.ts  useGrowth.ts
    │
    ├── lib/
    │   ├── time/ (duration.ts · timezone.ts · format.ts)
    │   └── constants/ (duration.ts · routes.ts)
    │
    └── tests/
        ├── domain/FocusSession.test.ts
        ├── application/ (StartSession · FinishSession · DiscardSession)
        └── lib/duration.test.ts
```

---

## Supabase Migration 実行順（確定版）

以下の順番を必ず守ること（外部キー依存順）:

```
001. profiles テーブル作成
002. tags テーブル作成
003. focus_tasks テーブル作成
004. focus_sessions テーブル作成
005. インデックス作成（部分ユニークインデックス含む）
006. set_updated_at Function 作成
007. updated_at Triggers 作成（4テーブル分）
008. handle_new_user Function 作成（SECURITY DEFINER）
     + on_auth_user_created Trigger 作成
     + RLS 有効化（4テーブル）
     + RLS Policies 作成（SELECT / INSERT / UPDATE のみ。DELETE なし）
009. profiles に total_xp / prestige_count 追加（Growth機能）
```

---

## RLS 設計方針

- 全テーブル（profiles / tags / focus_tasks / focus_sessions）に RLS を有効化
- SELECT / INSERT / UPDATE のみ許可。DELETE ポリシーは作成しない
- すべてのポリシーで `auth.uid() = user_id` を条件とする
- アプリバグがあっても他人データに触れないことを DB レベルで保証

---

## ポートフォリオで説明すべき技術的ポイント

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
