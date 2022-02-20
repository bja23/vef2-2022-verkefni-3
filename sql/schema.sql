
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) not null,
  slug VARCHAR(64) not null,
  description VARCHAR(255),
  created DATE,
  updated DATE
);

CREATE TABLE registration (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) not null,
  comment VARCHAR(255),
  event INT,
  created DATE
);

CREATE TABLE users (
  id serial primary key,
  name character varying(64) NOT NULL,
  username character varying(64) NOT NULL UNIQUE,
  password character varying(255) NOT NULL,
  isAdmin BOOLEAN DEFAULT FALSE
);

DROP ROLE IF EXISTS "vef2-user";
CREATE USER "vef2-user" WITH ENCRYPTED PASSWORD '123';
GRANT ALL PRIVILEGES ON DATABASE vef2 TO "vef2-user";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "vef2-user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "vef2-user";

