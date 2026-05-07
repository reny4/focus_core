-- active FocusSession の 1User 1件制約（最重要）
CREATE UNIQUE INDEX unique_active_focus_session_per_user
  ON public.focus_sessions (user_id)
  WHERE status = 'active';

-- Tag 名の重複防止
CREATE UNIQUE INDEX unique_active_tag_name_per_user
  ON public.tags (user_id, name)
  WHERE archived_at IS NULL;

-- FocusTask 名の重複防止
CREATE UNIQUE INDEX unique_active_focus_task_name_per_tag
  ON public.focus_tasks (user_id, tag_id, name)
  WHERE archived_at IS NULL;

-- 一覧取得・統計クエリ用
CREATE INDEX idx_tags_user_active
  ON public.tags (user_id, archived_at);

CREATE INDEX idx_focus_tasks_user_active
  ON public.focus_tasks (user_id, archived_at);

CREATE INDEX idx_focus_tasks_tag
  ON public.focus_tasks (tag_id);

CREATE INDEX idx_focus_sessions_user_started_at
  ON public.focus_sessions (user_id, started_at);

CREATE INDEX idx_finished_focus_sessions_user_started_at
  ON public.focus_sessions (user_id, started_at)
  WHERE status = 'finished';

CREATE INDEX idx_focus_sessions_user_tag_started_at
  ON public.focus_sessions (user_id, tag_id, started_at)
  WHERE status = 'finished';

CREATE INDEX idx_focus_sessions_user_task_started_at
  ON public.focus_sessions (user_id, focus_task_id, started_at)
  WHERE status = 'finished';

CREATE INDEX idx_focus_sessions_user_status
  ON public.focus_sessions (user_id, status);
