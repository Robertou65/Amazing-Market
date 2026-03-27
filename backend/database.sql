CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id              INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(200)   NOT NULL,
  number          BIGINT         NOT NULL UNIQUE,
  category_id     INT UNSIGNED   NOT NULL,
  quantity        VARCHAR(50)    NOT NULL,
  discount        INT            DEFAULT 0,
  price           DECIMAL(10,2)  NOT NULL,
  total_price     DECIMAL(10,2)  NOT NULL,
  stock           INT UNSIGNED   DEFAULT 0,
  image_url       VARCHAR(500)   DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS users (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email    VARCHAR(100) NOT NULL UNIQUE,
  phone    VARCHAR(20)  NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  birthdate DATE        NOT NULL
);

CREATE TABLE carts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL UNIQUE,  -- un carrito por usuario
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity   INT UNSIGNED NOT NULL DEFAULT 1,
  FOREIGN KEY (cart_id)    REFERENCES carts(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED   NOT NULL,
  total        DECIMAL(10,2)  NOT NULL,
  status       ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  order_id   INT UNSIGNED  NOT NULL,
  product_id INT UNSIGNED  NOT NULL,
  quantity   INT UNSIGNED  NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,  -- precio al momento de comprar
  FOREIGN KEY (order_id)   REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO categories(name) VALUES ("Wines");
INSERT INTO categories(name) VALUES ("Whiskey");
INSERT INTO categories(name) VALUES ("Beer");
INSERT INTO categories(name) VALUES ("Tequila");
INSERT INTO categories(name) VALUES ("Vodka");
INSERT INTO categories(name) VALUES ("Gin");
INSERT INTO categories(name) VALUES ("Cognac - Brandy");
INSERT INTO categories(name) VALUES ("Rum");
INSERT INTO categories(name) VALUES ("Schnapps");
INSERT INTO categories(name) VALUES ("Champagne");
