CREATE TABLE public.focus_sessions (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  focus_task_id             UUID        NOT NULL REFERENCES public.focus_tasks(id),
  focus_task_name_snapshot  TEXT        NOT NULL,
  tag_id                    UUID        NOT NULL REFERENCES public.tags(id),
  tag_name_snapshot         TEXT        NOT NULL,
  tag_color_snapshot        TEXT        NOT NULL,
  target_duration_seconds   INTEGER     NOT NULL,
  started_at                TIMESTAMPTZ NOT NULL,
  ended_at                  TIMESTAMPTZ,
  actual_duration_seconds   INTEGER,
  status                    TEXT        NOT NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT focus_sessions_status_check
    CHECK (status IN ('active', 'finished', 'discarded')),

  CONSTRAINT focus_sessions_target_duration_check
    CHECK (
      target_duration_seconds >= 60
      AND target_duration_seconds <= 43200
    ),

  CONSTRAINT focus_sessions_snapshot_not_empty
    CHECK (
      length(trim(focus_task_name_snapshot)) > 0
      AND length(trim(tag_name_snapshot)) > 0
      AND length(trim(tag_color_snapshot)) > 0
    ),

  CONSTRAINT focus_sessions_active_check
    CHECK (
      status <> 'active'
      OR (ended_at IS NULL AND actual_duration_seconds IS NULL)
    ),

  CONSTRAINT focus_sessions_finished_check
    CHECK (
      status <> 'finished'
      OR (
        ended_at IS NOT NULL
        AND actual_duration_seconds IS NOT NULL
        AND actual_duration_seconds > 0
        AND actual_duration_seconds <= 43200
        AND ended_at > started_at
      )
    ),

  CONSTRAINT focus_sessions_discarded_check
    CHECK (
      status <> 'discarded'
      OR actual_duration_seconds IS NULL
    )
);
