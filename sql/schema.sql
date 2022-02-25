DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS registration;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS events;

CREATE TABLE users (
  id serial primary key,
  name character varying(64) NOT NULL,
  username character varying(64) NOT NULL UNIQUE,
  password character varying(255) NOT NULL,
  isAdmin BOOLEAN DEFAULT FALSE
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  "creator" INTEGER NOT NULL,
  name VARCHAR(64) not null,
  slug VARCHAR(64) not null,
  description VARCHAR(255),
  created DATE,
  updated DATE,
  CONSTRAINT "creator" FOREIGN KEY ("creator") REFERENCES users (id)
);

CREATE TABLE registration (
  id SERIAL PRIMARY KEY,
  "name" INTEGER NOT NULL,
  comment VARCHAR(255),
  "event" INT NOT NULL,
  created DATE,
  CONSTRAINT "name" FOREIGN KEY ("name") REFERENCES users (id),
  CONSTRAINT "event" FOREIGN KEY ("event") REFERENCES events (id)
);


DROP ROLE IF EXISTS "vef2-user";
CREATE USER "vef2-user" WITH ENCRYPTED PASSWORD '123';
GRANT ALL PRIVILEGES ON DATABASE vef2 TO "vef2-user";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "vef2-user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "vef2-user";

