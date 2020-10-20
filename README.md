# Пример использования GraphQL + sequlize + авторизация и аутентификация пользователя

Создано в [7LF](https://company.7lf.ru)

## История
* 1.0.1 - исправление ошибки при login'е пользователя
* 1.0.0 - первый выпуск

## База данных

### Таблица для хранения путей

Если меняете резолверы, то не забудьте добавлять сюда тоже.

Если путь не добавлен в таблицу, то никто не сможет к нему обратиться.

* name - название. Например, Users.
* type - тип: query/mutation

CREATE TABLE `access_paths` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `type` enum('mutation','query') DEFAULT 'query' COMMENT 'тип: mutation/query\n',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL COMMENT 'id хозяина/созда',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='Пути';

### Таблица хранит соотношение пользователь-путь

CREATE TABLE `access_paths_and_users` (
  `id_user` int(11) DEFAULT NULL,
  `id_path` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Соотношение id пользователей и путей';

### Таблица с пользователями

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(45) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `disabledAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='Пользователи';

## Модули

* db.js - работа с базой данных
* decodedToken.js - модуль для декодирования токена
* schema.js - схема GraphQL. Здесь необходимо описать все используемые типы.
* resolvers.js - "пути" обращения. Здесь необходимо описать все request и mutation.
* index.js - главный файл. Его надо запускать :)

## Конфигурация

Конфигурация в формате ["human JSON"](https://json5.org/).

* database - настройки базы данных
    * dialect - с какой БД работаем. См: [Диалекты Sequelize](https://sequelize.org/v5/manual/dialects.html)
    * host - localhost или адрес, где находится сервер базы данных
    * name - название базы данных
    * user - пользователь базы данных
    * password - пароль для пользователя
    * pool - настройка пула соединений. См: [Пул соединений](https://sequelize.org/master/manual/connection-pool.html)
* secret - секретная фраза для JWT токена. ОБЯЗАТЕЛЬНО ЗАМЕНИТЕ!
* port - порт, на котором будет работать приложение
