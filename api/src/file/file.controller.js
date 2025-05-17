import { FileService } from './file.service.js';

export class FileController {
    static async saveFile(request, reply) {
        try {
            const data = await request.file();
            const { error, data: fileData } = await FileService.saveFile(
                data.file,
                data.filename,
                data.mimetype,
                request.user?.id
            );

            if (error) {
                return reply.code(500).send({ error });
            }

            return fileData;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ 
                error: 'File upload failed',
                details: error.message 
            });
        }
    }

    static async getFile(request, reply) {
    try {
        const { fileId } = request.params;
        const { error, data } = await FileService.getFile(fileId);

        if (error) {
            return reply.code(404).send({ error });
        }

        reply
            .header('Content-Type', data.contentType)
            .header('Content-Length', data.contentLength)
            .send(data.buffer); // Отправляем буфер вместо потока

    } catch (error) {
        console.error('File delivery error:', error);
        reply.code(500).send({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
}