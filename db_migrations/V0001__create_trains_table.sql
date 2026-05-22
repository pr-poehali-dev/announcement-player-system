CREATE TABLE t_p10033396_announcement_player_.trains (
  id SERIAL PRIMARY KEY,
  train_number VARCHAR(20) NOT NULL,
  direction VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'departure',
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP,
  platform VARCHAR(20),
  wagons VARCHAR(200),
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
