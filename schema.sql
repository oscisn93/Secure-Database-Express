DROP IF EXISTS users;

CREATE DATABASE users;

USE users; 

CREATE TABLE appusers (
  username VARCHAR(255),
  password VARCHAR(255),
  info VARCHAR(255),
  -- session_id VARCHAR(255)
);

INSERT INTO appusers VALUES('mikhail', 'passw0rd', 'Where are the cats?');

GRANT ALL PRIVILEGES ON users.* TO 'appaccount'@'localhost' IDENTIFIED BY 'apppass';

INSERT INTO appusers VALUES('testuser', 'testpass', 'Hellllo???');

ALTER TABLE appusers ADD COLUMN session VARCHAR(255);

