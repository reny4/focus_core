CREATE TABLE public.focus_tasks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag_id      UUID        NOT NULL REFERENCES public.tags(id),
  name        TEXT        NOT NULL,
  archived_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT focus_tasks_name_not_empty
    CHECK (length(trim(name)) > 0)
);
