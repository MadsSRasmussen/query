SET sql_mode = 'STRICT_ALL_TABLES';

START TRANSACTION;

INSERT INTO users (id, name) VALUES 
    (1, 'root'),
    (2, 'default');

INSERT INTO posts (id, content, user_id) VALUES
    (1, 'content:root:1', 1),
    (2, 'content:root:2', 1),
    (3, 'content:default:1', 2),
    (4, 'content:default:2', 2);

COMMIT;
