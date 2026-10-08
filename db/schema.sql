CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(12,2) CHECK(amount > 0) NOT NULL,
  spent_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  description TEXT,
  category TEXT NOT NULL
);
