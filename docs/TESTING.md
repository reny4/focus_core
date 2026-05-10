# docs/TESTING.md — テスト方針

## 優先度 高（必須）

### FocusSession Entity
- active で start できる
- active → finished に遷移できる
- active → discarded に遷移できる
- finished / discarded から active に戻れない
- 不正な TargetDuration を拒否する
- finished には endedAt と actualDuration が必須
- discarded には actualDuration を持たない

### UseCase
- **StartSession**: 正常作成 / active session 重複 / archived FocusTask / archived Tag / Snapshot 保存
- **FinishSession**: 正常終了 / 12時間丸め / active session なし
- **DiscardSession**: 正常破棄 / actualDuration が null / active session なし

### Growth（calcGrowthStats）
```
total_xp = 0       → level: 1,   xpInCurrentLevel: 0,    progressRatio: 0
total_xp = 7199    → level: 1,   xpInCurrentLevel: 7199, progressRatio: 0.999...
total_xp = 7200    → level: 2,   xpInCurrentLevel: 0,    progressRatio: 0
total_xp = 712800  → level: 100, xpInCurrentLevel: 7200, progressRatio: 1
total_xp = 720000  → level: 100, xpInCurrentLevel: 7200, progressRatio: 1（上限）
```

---

## 優先度 中

- API validation（Zod schema）
- Error mapping（`satisfies` による型安全）
- Analytics クエリ
- timezone UTC 変換
- XP加算: Finish時のみ加算、Discard時は加算しないこと

---

## 優先度 低（余力あれば）

- Playwright E2E: ログイン → FocusTask 作成 → セッション開始 → Finish → 統計反映

---

## テスト実行

```bash
npx vitest run          # 全テスト一括実行
npx vitest              # ウォッチモード
npx vitest run --reporter=verbose  # 詳細表示
```

**Phase 移行条件: `vitest run` がすべてグリーンであること**
