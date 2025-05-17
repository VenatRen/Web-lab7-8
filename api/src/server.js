import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyRedis from '@fastify/redis';
import { DateTime } from 'luxon';

import { sequelize } from './config/database.js';
import { Book } from './models/book.model.js';
import { FileController } from './file/file.controller.js';
import { BookController } from './models/book.controller.js';
import { UserService } from './services/user.service.js';
import { AuthService } from './auth/auth.service.js';
import { AuthController } from './auth/auth.contoller.js';
import { AmpqProvider } from './ampq/ampq.service.js';
import queueConfig from './config/queue.js';

const fastify = Fastify({
  logger: true
});

// Проверка подключения к БД
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to DB has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}


await testConnection();

// Синхронизация моделей с БД
await sequelize.sync({ alter: true });

// Регистрируем multipart только один раз
if (!fastify.hasContentTypeParser('multipart')) {
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  });
}

fastify.register(fastifyJwt, {
    secret: 'supersecret',
    cookie: {
        cookieName: 'access_token',
        signed: false,
        expiresIn: '2d'
    }
})

fastify.register(fastifyRedis, { host: '127.0.0.1', port: 6379, password: 'qazwsxedc' })

const userService = new UserService(fastify);

fastify.decorate("authenticate", async function (request, reply) {
    try {
        const user = await request.jwtVerify();

        const token = request.cookies.access_token;
        const existingTokens = await fastify.redis.smembers(`user:access_tokens:${user.id}`);

        if (!existingTokens.includes(token)) {
            throw Error('Invalid token')
        }
    } catch (err) {
        reply.code(403).send({error: 'Unauthorized'})
    }
})

fastify.register(fastifyCookie, {
    secret: "supersecret",
    hook: 'onRequest',
    parseOptions: {}
})

const authService = new AuthService(userService);

fastify.post('/register', async (request, reply) => {
    try {
        const { username, password, email } = request.body;
        await authService.register(username, password, email);
        return { data: 'ok' };
    } catch (error) {
        reply.code(500).send({
            error: 'Registration failed',
            message: error.message
        });
    }
});


fastify.post('/login', async function handler(request, reply) {
    const { error, data: user } = await userService.login(request.body);

    if (error) {
        return {
            error
        };
    }

    const token = fastify.jwt.sign(user.dataValues, { expiresIn: '2d' });

    await fastify.redis.sadd(`user:access_tokens:${user.dataValues.id}`, token);
    reply.setCookie('access_token', token, {
        domain: 'localhost',
        path: '/',
        secure: true,
        sameSite: true,
        expires: DateTime.now().plus({ days: 2 }).toJSDate(),
    })
})

fastify.get('/me', {
    onRequest: [fastify.authenticate]
}, async function handler(request, reply) {
    const { error, data: user } = await userService.get(request.user.id);

    if (error) {
        return { error: 'Internal server error' };
    }

    const { password, salt, ...userData } = user.dataValues;
    return userData;
})

fastify.get('/logout', {
    onRequest: [fastify.authenticate]
}, async function handler(request, reply) {
    const { error, data } = await userService.logout(request.user.id);
    if (error) {
        return { error: 'Internal server error' };
    }
    reply.clearCookie('access_token');
    return { message: data };
});

fastify.get('/logout/active', {
    onRequest: [fastify.authenticate]
}, async function handler(request, reply) {
    const currentToken = request.cookies.access_token;
    const { error, data } = await userService.logoutActive(request.user.id, currentToken);
    if (error) {
        return { error: 'Internal server error' };
    }
    return { message: data };
});

// Эндпоинт для создания книги
fastify.post('/books', BookController.createBook);

// Эндпоинт для получения списка книг
fastify.get('/books', BookController.getBooks);

fastify.get('/books/:id', BookController.getBookById);

// Эндпоинт для обновления книги
fastify.put('/books/:id', async function handler(request, reply) {
  try {
    const { id } = request.params;
    const { title, author, publishedYear, fileId } = request.body;

    const book = await Book.findByPk(id);
    if (book) {
      book.title = title;
      book.author = author;
      book.publishedYear = publishedYear;
      book.fileId = fileId;
      await book.save();
      return book;
    }
    return { error: 'Book not found' };
  } catch (err) {
    console.error(err);
    return { error: 'Internal server error' };
  }
});

// Эндпоинт для удаления книги
fastify.delete('/books/:id', async function handler(request, reply) {
  try {
    const { id } = request.params;
    const book = await Book.findByPk(id);
    if (book) {
      await book.destroy();
      return { message: 'Book deleted' };
    }
    return { error: 'Book not found' };
  } catch (err) {
    console.error(err);
    return { error: 'Internal server error' };
  }
});

fastify.get('/health', async function handler(request, reply) {
  return { status: 'ok' }
})

fastify.post('/files', {
    onRequest: [fastify.authenticate]
}, FileController.saveFile);

fastify.get('/files/:fileId', FileController.getFile)

try {
  await AmpqProvider.connect(queueConfig)
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
