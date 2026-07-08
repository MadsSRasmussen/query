SET sql_mode = 'STRICT_ALL_TABLES';

START TRANSACTION;

INSERT INTO users (id, name, created_at) VALUES 
    (1, 'root', '2025-01-01 10:00:00'),
    (2, 'default', NOW());

INSERT INTO posts (id, content, user_id, created_at) VALUES
    (1, 'content:root:1', 1, '2025-01-01 10:00:00'),
    (2, 'content:root:2', 1, '2025-01-01 10:00:00'),
    (3, 'content:default:1', 2, NOW()),
    (4, 'content:default:2', 2, NOW());

COMMIT;
