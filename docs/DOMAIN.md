# docs/DOMAIN.md — ドメインモデル仕様

## ユビキタス言語（必ず統一する）

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

## FocusSession 状態遷移

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

---

## ドメインルール

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

### ArchiveTag の確定仕様

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

## 6時間確認ダイアログ仕様

```
- elapsedSeconds >= 21600 になった瞬間に1回だけ表示する
- クライアント側の useState フラグ（hasShownReviewDialog）で管理する
- ページリロード後は再度表示する（DB に保存しない）
- ダイアログ表示中もタイマーは停止しない
- FocusSession.status は active のまま維持する
```

```typescript
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

## サインアップ時の display_name 仕様

```
- display_name は任意入力とする
- supabase.auth.signUp() の options.data に含めて Trigger で受け取る
```

```typescript
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { display_name: displayName || '' }
  }
})

// handle_new_user() Trigger 側（COALESCE で対応済み）
COALESCE(NEW.raw_user_meta_data->>'display_name', '')
```

---

## handle_new_user Trigger フォールバック

```typescript
async function ensureProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!data) {
    await supabase.from('profiles').upsert({
      id: userId,
      timezone: 'Asia/Tokyo',
    })
    await supabase.from('tags').upsert([
      { user_id: userId, name: '勉強', color: '#3B82F6' },
      { user_id: userId, name: '読書', color: '#10B981' },
      { user_id: userId, name: '開発', color: '#8B5CF6' },
    ])
  }
}
```

---

## 統計クエリのタイムゾーン方針

**SQL 側を主、アプリ側は UTC 範囲変換のみ。二重処理しない。**

```typescript
// アプリ側: timezone から UTC 範囲を計算して渡す
const fromUtc = toUtc(date, '00:00:00', timezone)
const toUtc   = toUtc(date, '23:59:59', timezone)
```

```sql
-- SQL 側: timezone を使って日次グルーピング
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

## セッション履歴 API の Response DTO

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
