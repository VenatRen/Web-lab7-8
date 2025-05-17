import { Book } from './book.model.js';

export class BookController {
  static async createBook(request, reply) {
    try {
      const { title, author, publishedYear, fileId } = request.body;

      // Проверка наличия обязательных полей
      if (!title || !author || !publishedYear) {
        reply.code(400);
        return { message: 'Title, author, and publishedYear are required' };
      }

      const book = await Book.create({
        title,
        author,
        publishedYear,
        fileId
      });

      // Добавляем URL файла в ответ
      if (book.fileId) {
        const file = await book.getFile();
        book.dataValues.fileUrl = `http://${request.hostname}/files/${file.id}`;
      }

      return book;
    } catch (error) {
      console.error(error);
      reply.code(500);
      return { message: 'Error creating book', error: error.message };
    }
  }

  static async getBookById(request, reply) {
    try {
      const { id } = request.params;
      
      const book = await Book.findByPk(id, {
        include: ['file'] // Включаем информацию о связанном файле
      });

      if (!book) {
        reply.code(404);
        return { message: 'Book not found' };
      }

      // Добавляем URL файла, если он есть
      if (book.file) {
        book.dataValues.fileUrl = `http://${request.hostname}/files/${book.file.id}`;
      }

      return book;
    } catch (error) {
      console.error(error);
      reply.code(500);
      return { message: 'Error getting book', error: error.message };
    }
  }

  static async getBooks(request, reply) {
    const books = await Book.findAll({
      include: ['file'] // Включаем информацию о файле
    });
    return books;
  }
}
