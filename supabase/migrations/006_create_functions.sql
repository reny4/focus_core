-- updated_at 自動更新
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 新規ユーザー作成時の profiles / 初期Tag 生成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, timezone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    'Asia/Tokyo'
  );

  INSERT INTO public.tags (user_id, name, color)
  VALUES
    (NEW.id, '勉強', '#6366F1'),
    (NEW.id, '読書', '#10B981'),
    (NEW.id, '開発', '#8B5CF6');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
