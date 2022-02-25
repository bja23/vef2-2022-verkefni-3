
INSERT INTO users (name, username, password, isAdmin) VALUES ('Björgvin','admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', TRUE);
INSERT INTO users (name, username, password) VALUES ('NOTBjörgvin','notadmin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');

INSERT INTO events ("creator", name,slug,description,created,updated )
VALUES(1, 'Vefforritun 2', 'vefforritun-2','Annar áfangi í forritun','2022-01-1', '2022-01-1');

INSERT INTO events ("creator", name,slug,description,created,updated )
VALUES(1, 'Hugbúnaðarverkefni 2', 'hugbunadarverkefni-2','Annar áfangi í hugbúnaðarverkefni','2022-01-1', '2022-01-1');

INSERT INTO events ("creator",name,slug,description,created,updated )
VALUES(1,'Lokaverkefni 2022', 'lokaverkefni-20222','Lokaverkefni, áfangi með stærra verkefni','2022-01-1', '2022-01-01');


INSERT INTO registration ("name", comment, "event", created)
VALUES(1, 'Þetta verður skemmtilegur áfangi', 1, '2022-01-01');

INSERT INTO registration ("name", comment, "event", created)
VALUES(1, 'Þetta verður skemmtilegur áfangi', 2, '2022-01-01');

INSERT INTO registration ("name", comment, "event", created)
VALUES(1, 'Þetta verður skemmtilegur áfangi', 3, '2022-01-01');

