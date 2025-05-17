# Лабораторная работа 8
## Знакомство с брокерами сообщений
### Цель работы
Познакомиться с процессом асинхронного взаимодействия между отдельными сервисами посредством брокеров сообщений на примере RabbitMQ

### Технические требования:
- Наличие интернет-соединения
- Наличие [Postman](https://www.postman.com/downloads/) или [Insomnia](https://insomnia.rest/download)
- Наличие [Node](https://nodejs.org/en) [v22 и выше] или наличие [NVM](https://github.com/nvm-sh/nvm) для переключения между версиями Node
- Наличие [Docker](https://docs.docker.com/desktop/)

### Ход работы:

1. В директории с лабораторной работой выполните запуск контейнеров при помощи команды `docker-compose up -d` (`docker compose up -d`)

2. В директории `api` выполните установку зависимостей при комощи команды `npm i`

3. В директории  `greeting_service` выполните установку зависимостей при комощи команды `npm i`

3. Перейдите в RabbitQMRabbitMQ Management из браузера [по следующему адресу](http://localhost:8080/)
![](https://storage.yandexcloud.net/shesterikov/WP/WP_8_1.png)
Для входа используете данные из файла `docker-compose.yml`
По умолчанию
```
username: student
password: FbgTrFGv
```
![](https://storage.yandexcloud.net/shesterikov/WP/WP_8_2.png)

4. Перейдите в RabbitQMRabbitMQ Management / Channels из браузера [по следующему адресу](http://localhost:8080/#/channels)
![](https://storage.yandexcloud.net/shesterikov/WP/WP_8_3.png)

Убедитесь в отсутствии активных подключений

5. Перейдите в RabbitQMRabbitMQ Management / Queue and Streams из браузера [по следующему адресу](http://localhost:8080/#/queues)
![](https://storage.yandexcloud.net/shesterikov/WP/WP_8_4.png)

Убедитесь в отсутствии существующих очередей

6. Выполните запуск сервиса `api` из командной строки при помощи команды `npm run start:dev`

7. Выполните запуск сервиса `greeting_service` из командной строки при помощи команды `npm run start:dev`

8. Выполните cURL запрос в Postman или Insomnia

```
curl --location 'localhost:3000/register' \
--header 'Content-Type: application/json' \
--data '{
    "username": "wefwefwefef",
    "password": "wefwefwefwefwefwefwefewf1"
}'
```

9. Убедитесь в корректной передаче данных между сервисами. 

В логах сервиса `api` в случае успеха можно наблюдать строку

```
Sending information: {"username":"wefwefwefef","password":"wefwefwefwefwefwefwefewf1"} to the queue: greetings 
```

В логах сервиса `greeting_service` в случае успеха можно наблюдать строку

```
Receiving information: {"username":"wefwefwefef","password":"wefwefwefwefwefwefwefewf1"} from the queue: greetings 
```

В RabbitQMRabbitMQ Management / Channels можно наблюдать два новых подключения

![](https://storage.yandexcloud.net/shesterikov/WP/WP_8_5.png)

В RabbitQMRabbitMQ Management / Queue and Streams можно наблюдать новую очередь `greetings`

![](https://storage.yandexcloud.net/shesterikov/WP/WP_8_6.png)


10. Остановите сервис `greeting_service`

В случае успеха в RabbitQMRabbitMQ Management / Channels можно наблюдать одно  подключение

11. Выполните повторную отправку cURL запроса

```
curl --location 'localhost:3000/register' \
--header 'Content-Type: application/json' \
--data '{
    "username": "wefwefwefef",
    "password": "wefwefwefwefwefwefwefewf1"
}'
```

12. Убедитесь в наличии недоставленных сообщений в очереди `greetings`

![](https://storage.yandexcloud.net/shesterikov/WP/WP_8_7.png)

13. Выполните запуск сервиса `greeting_service` из командной строки при помощи команды `npm run start:dev`

В логах сервиса `greeting_service` в случае успеха можно наблюдать строку

```
Receiving information: {"username":"wefwefwefef","password":"wefwefwefwefwefwefwefewf1"} from the queue: greetings 
```

Очередь сообщений при этом будет пуста

![](https://storage.yandexcloud.net/shesterikov/WP/WP_8_8.png)


7. Модифицируйте исходный код приложения в соответствии со следующими требованиями:

  - Требуется реализовать асинхронную обработку события "регистрация нового пользователя" и отправку приветственного сообщения на `email` пользователя посредством сервиса `greeting_service`, протокола SMTP и зависимости [Nodemailer](https://www.npmjs.com/package/nodemailer):

    a. Модифицируйте отправляемые и получаемые данные из очереди для передачи требуемых для отправки писем полей (`email` пользователя)

    b. Настройте почту для работы по протоколу SMTP (пример настройки для [Яндекс.Почты](https://yandex.ru/support/yandex-360/customers/mail/ru/mail-clients/others) и [Gmail](https://support.google.com/a/answer/176600?hl=en))

    c. Модифицируйте файл `greeting_service/src/mail/index.js`, добавив отправку писем посредством [Nodemailer](https://www.npmjs.com/package/nodemailer)

### Документация:

[Nodemailer](https://nodemailer.com/)

[RabbitMQ](https://www.rabbitmq.com/tutorials)

### Контрольные вопросы:
1. Что такое RabbitQM? Хранит ли RabbitQM очереди в случае отключения?

2. Что такое очередь сообщений? Какие задачи решаются посредством использования очередей сообщений?

3. Что такое SMTP? Какие настройки вы произвели в почтовом сервисе для работы с SMTP?

4. Что такое Nodemailer?
