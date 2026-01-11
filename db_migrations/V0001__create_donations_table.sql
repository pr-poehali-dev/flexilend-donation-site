-- Таблица для хранения донатов
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    player_nickname VARCHAR(100) NOT NULL,
    server_mode VARCHAR(50) NOT NULL,
    package_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    promo_code VARCHAR(50),
    discount_percent INTEGER DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    payment_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    issued BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issued_at TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_issued ON donations(issued);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_donations_player ON donations(player_nickname);