CREATE TABLE t_p10033396_announcement_player_.train_announcements (
  id SERIAL PRIMARY KEY,
  train_id INTEGER NOT NULL REFERENCES t_p10033396_announcement_player_.trains(id),
  template_id INTEGER REFERENCES t_p10033396_announcement_player_.announcement_templates(id),
  text_rendered TEXT NOT NULL,
  voice VARCHAR(50) DEFAULT 'Алина',
  zone VARCHAR(100) DEFAULT 'Все зоны',
  speed NUMERIC(3,1) DEFAULT 1.0,
  repeat_offsets JSONB DEFAULT '[30, 10, 5]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
