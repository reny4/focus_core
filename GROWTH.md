# GROWTH.md — Focus Core Growth / Core Level 仕様

> このファイルはCLAUDE.mdの補足仕様書。Growth / Core Level機能の実装における唯一の真実の源。
> 実装前に必ずCLAUDE.mdと合わせて読むこと。

---

## 1. コンセプト

Growth / Core Levelは「集中の蓄積」を静かに可視化するための拡張機能。

目指す体験:
- 静かな成長
- 集中によってCoreを育てる感覚
- 高級感のある自己成長体験
- 集中後にだけ感じられる小さな達成感

参考UIの方向性: Linear / Raycast / Arc Browser / modern macOS app

**Focus Coreの主役は常にユーザーの集中である。GrowthはあくまでもRead Model的な補助表現。**

---

## 2. 禁止事項（Growth専用・CLAUDE.mdの禁止事項に追加）

```
✗ 集中中にXPをリアルタイム加算する
✗ GrowthのためにFocusSession EntityへXP/Level責務を追加する
✗ discarded FocusSessionをXP対象に含める
✗ active FocusSessionをXP対象に含める
✗ Growth UIを集中操作より目立たせる
✗ ソシャゲ風の派手なLevel Up演出を入れる
✗ Achievementをv1で実装する
✗ v1でuser_progressテーブルを作成する
✗ v1でPrestige実行UIを作る
✗ タスク別成長をメインUIに表示する
✗ 常時強い発光・パーティクル・爆発演出
✗ 長時間演出（総演出時間は2秒以内）
✗ フルスクリーン演出
```

---

## 3. DB変更

### profilesテーブルへの追加カラム

```sql
-- supabase/migrations/009_add_growth_columns.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prestige_count INTEGER NOT NULL DEFAULT 0;
```

- `total_xp`: finished FocusSessionのactual_duration_seconds累計（秒単位）
- `prestige_count`: v1では0固定。Prestige実装時に使用

**v1では `user_progress` テーブルを作らない。**

---

## 4. XP / Level 計算仕様

```
XP_PER_LEVEL = 7200        // 2時間
LEVEL_CAP = 100

level            = MIN(LEVEL_CAP, FLOOR(total_xp / XP_PER_LEVEL) + 1)
xpInCurrentLevel = total_xp % XP_PER_LEVEL
progressRatio    = xpInCurrentLevel / XP_PER_LEVEL

// Level 100到達時の特殊処理
if (level === LEVEL_CAP) {
  xpInCurrentLevel = XP_PER_LEVEL  // 7200固定
  progressRatio    = 1
}
```

### XP対象

```
status = 'finished' かつ actual_duration_seconds IS NOT NULL のみ
discarded・activeは絶対に含めない
```

### XP加算タイミング

- FinishSession UseCase内でSELECT → 計算 → UPDATEの順で処理
- RPCは使わない
- XP加算失敗時はセッションのfinishを巻き戻さない（ベストエフォート）

### テストケース

```
total_xp = 0       → level: 1,   xpInCurrentLevel: 0,    progressRatio: 0
total_xp = 7199    → level: 1,   xpInCurrentLevel: 7199, progressRatio: 0.999...
total_xp = 7200    → level: 2,   xpInCurrentLevel: 0,    progressRatio: 0
total_xp = 14400   → level: 3,   xpInCurrentLevel: 0,    progressRatio: 0
total_xp = 712800  → level: 100, xpInCurrentLevel: 7200, progressRatio: 1
total_xp = 720000  → level: 100, xpInCurrentLevel: 7200, progressRatio: 1
```

---

## 5. Growth API

### エンドポイント

```
GET /api/analytics/growth
```

### Response DTO

```typescript
export type GetGrowthResponse = {
  totalXp: number
  level: number
  levelCap: number              // v1では100固定
  xpInCurrentLevel: number
  xpRequiredForNextLevel: number  // v1では7200固定
  progressRatio: number         // 0〜1
  prestige: number              // v1では0固定
}
```

### 配置

```
application/analytics/queries/IAnalyticsQueryService.ts（メソッド追加）
application/analytics/dto/AnalyticsDtos.ts（型追加）
infrastructure/queries/SupabaseAnalyticsQueryService.ts（実装追加）
app/api/analytics/growth/route.ts（新規）
```

### 注意

- `userId` はSupabase Authから取得。QueryパラメータやBodyから受け取らない
- profilesの `total_xp` を直接読む（finished FocusSessionをSUM集計しない）
- 既存の `ApiResult<T>` 形式に従う

---

## 6. コンポーネント構成

### 新規作成

```
src/components/growth/
  GrowthIndicator.tsx    ← ヘッダーXPバー
  CoreRing.tsx           ← 中央タイマーリング
  LevelUpOverlay.tsx     ← Finish後の+XP演出
src/hooks/useGrowth.ts   ← TanStack QueryでGrowthを取得
```

### 修正対象（主なもの）

```
src/app/layout.tsx                                      ← 背景改善
src/application/focus/usecases/FinishSession.ts         ← XP加算
src/components/layout/AppHeader.tsx                     ← GrowthIndicator追加
src/components/focus/TimerPanel.tsx                     ← CoreRing組み込み・Finish演出
```

---

## 7. GrowthIndicator 仕様

### 配置

AppHeaderのユーザー名の左側。

```
[ Lv.12  ▰▰▰▰▱▱▱  72% ]  [ rere ]  [ → ]
```

### 表示仕様

```
通常: Lv.12  [XPバー]  72%
Level 100: Lv.100  MAX
Growth未取得時: 非表示（nullを返す）
```

### バー仕様

```
高さ: 4〜6px
角丸: rounded-full
色: linear-gradient(90deg, #7C7CFF 0%, #5A5AD6 100%)
背景トラック: rgba(255,255,255,0.08)
常時発光なし
```

---

## 8. CoreRing 仕様

### 役割

TimerDisplay（タイマー数字）の周囲に円形リングを表示する。
タイマー数字の視認性を最優先とし、リングは補助的な表現にとどめる。

### 基本形状

```
円形リング
92〜96%程度閉じたリング（少し切れ目あり）
SF/HUD感を演出しつつダークUIに馴染ませる
常時強発光しない
レンダリング: SVG circle（Rechartsは使わない）
```

### TimerPhase別表示

| Phase | 表示 |
|-------|------|
| idle | 薄いリング・発光なし・動きなし |
| counting_down | 進捗に応じてリングが伸びる（0→100%）|
| counting_up | 満タン + subtle pulse + 倍率表示（×2、×3）|

### 倍率表示（counting_up時）

```typescript
const overrunSeconds = elapsedSeconds - targetDurationSeconds
const overlapCount = Math.floor(overrunSeconds / targetDurationSeconds) + 1
// overlapCount === 1 の場合は非表示
// 2以上の場合: ×2、×3 ... をタイマー数字の下に表示
```

### Level別外観（初期実装・3段階）

| Level | 外観 |
|-------|------|
| Lv 1〜20 | thin（細いリング1本・発光弱め）|
| Lv 21〜60 | double（二重リング）|
| Lv 61〜100 | orbital（外周に軌道ライン追加）|

### LevelUp時演出（isLevelingUp={true}のとき）

```
リングが軽く拡張（scale 1.0 → 1.03 → 1.0）
紫グロー一瞬強まる: box-shadow: 0 0 12px rgba(124,124,255,.45)
残響: 0.8秒
```

---

## 9. Finish後のXP演出フロー

```
1. Finishボタン押下 → beforeGrowth を保持
2. FinishSession mutation 実行
3. 成功後 → growth refetch → afterGrowth 取得
4. gainedXp = afterGrowth.totalXp - beforeGrowth.totalXp
5. gainedXp > 0 の場合のみ演出開始
   a. タイマー中央付近に「Session Complete / +XX XP」表示（0.6s）
   b. GrowthIndicatorのXPバーが before → after にアニメーション（0.8s）
   c. Levelが上がった場合のみLevelUp演出（0.3s + CoreRing glow 0.8s）
6. 演出終了後、通常表示へ戻す
```

### アニメーション時間

```
+XP表示: 0.6s
XPバー伸長: 0.8s
Level数値切替: 0.3s
発光: 0.2s
CoreRing glow残響: 0.8s
総演出時間: 2秒以内
easing: cubic-bezier(0.33, 1, 0.68, 1)（easeOutCubic）
```

### アニメーションライブラリ

`framer-motion` を使用する（要インストール: `npm install framer-motion`）。

---

## 10. 背景改善仕様

```css
/* src/app/globals.css — .dark body への追加 */
background:
  radial-gradient(circle at 50% 30%, rgba(124, 124, 255, 0.08), transparent 40%),
  linear-gradient(180deg, #0B0C14 0%, #07080D 100%);
```

- ログイン画面（`src/app/(auth)/`）の背景は変更しない
- サイドバー・右パネルは `rgba(255,255,255,0.03)` + `backdrop-filter: blur(12px)` で調整
- 完全な黒（#000000）を使わない

---

## 11. useGrowth hook 仕様

```typescript
export function useGrowth() {
  return {
    growth: GetGrowthResponse | undefined,
    isLoading: boolean,
    refetch: () => void,  // FinishSession成功後に呼ぶ
  }
}
```

- QueryKey: `['analytics', 'growth']`（既存規則に合わせる）
- 集中中に自動再取得しない（refetchIntervalなし）
- 取得失敗時はアプリをクラッシュさせない

---

## 12. 実装フェーズ順序

```
Phase 1: 背景改善
Phase 2: DBマイグレーション + FinishSession XP加算
Phase 3: Growth API
Phase 4: Framer Motionインストール + useGrowth hook
Phase 5: GrowthIndicator（静的表示）
Phase 6: CoreRing
Phase 7: LevelUpOverlay + XP演出
```

Phase 1・2は互いに依存しない。Phase 3以降は順番通りに進める。

---

## 13. MVP完了条件

```
[ ] 背景が深い藍色ベースに改善されている
[ ] GET /api/analytics/growth が実装されている
[ ] finished FocusSessionのみからtotal_xpが加算される
[ ] discarded FocusSessionがXP対象外である
[ ] 1 XP = 1秒で計算されている
[ ] 1 Level = 7200 XPで計算されている
[ ] Lv100上限が守られている
[ ] AppHeaderにGrowthIndicatorが表示されている
[ ] FinishSession後のみ+XP演出が出る
[ ] Discard時に+XP演出が出ない
[ ] Level Up時に短く静かな演出が出る
[ ] CoreRingがTimerDisplay周囲に表示されている
[ ] CoreRingがTimerPhaseに応じて表示変化する
[ ] CoreRingのLevel別外観が3段階で変化する
[ ] Achievementは未実装である
[ ] Prestigeは未実装だが、growth responseにprestige: 0が含まれている
[ ] user_progressテーブルは未作成である
[ ] タスク別成長はメインUIに表示されていない
[ ] 総演出時間が2秒以内に収まっている
```
