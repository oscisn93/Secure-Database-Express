USE users; 

CREATE TABLE appusers (
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  info VARCHAR(255) DEFAULT NULL,
  session_id VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY(username)
);

INSERT INTO appusers VALUES('mikhail', 'passw1rd', 'Where are the cats?', '');

GRANT ALL PRIVILEGES ON users.* TO 'appaccount'@'localhost' IDENTIFIED BY 'apppass';

