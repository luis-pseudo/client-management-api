CREATE TABLE IF NOT EXISTS clients (
  id_client SERIAL PRIMARY KEY,
  c_name TEXT NOT NULL,
  c_lastname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  register DATE NOT NULL,
  c_state BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS phones (
  id_phone SERIAL PRIMARY KEY,
  id_client INTEGER NOT NULL REFERENCES clients(id_client) ON DELETE CASCADE,
  phone_number TEXT NOT NULL
);
