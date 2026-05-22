CREATE TABLE t_p10033396_announcement_player_.playback_history (
  id SERIAL PRIMARY KEY,
  train_announcement_id INTEGER REFERENCES t_p10033396_announcement_player_.train_announcements(id),
  train_id INTEGER REFERENCES t_p10033396_announcement_player_.trains(id),
  text_played TEXT NOT NULL,
  voice VARCHAR(50),
  zone VARCHAR(100),
  played_at TIMESTAMP DEFAULT NOW(),
  trigger_type VARCHAR(50) DEFAULT 'manual'
);
