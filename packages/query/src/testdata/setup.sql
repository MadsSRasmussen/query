DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company_id INT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO companies (name) VALUES 
    ('testing-technology'),
    ('ford-motors');

INSERT INTO users (name, email, company_id) VALUES
    ('steve', 'steve-johnson@gmail.com', 1),
    ('paula', 'paula@ford.com', 2),
    ('bob', 'bob-the-man@outlook.com', 2);

INSERT INTO messages (content, user_id) VALUES
    ('I love testing software, it is simply the best', 1),
    ('Ford makes the best cars!', 2),
    ('I love ford cars!', 2),
    ('I dislike my job at the ford-motors company...', 3);
