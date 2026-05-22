CREATE TABLE t_p10033396_announcement_player_.announcement_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'standard',
  text_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  voice VARCHAR(50) DEFAULT 'Алина',
  zone VARCHAR(100) DEFAULT 'Все зоны',
  speed NUMERIC(3,1) DEFAULT 1.0,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
