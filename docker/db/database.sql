CREATE DATABASE virgil_development;

\c virgil_development;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255)
);
