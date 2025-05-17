import path from 'node:path';
import { S3Client, GetObjectCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { File } from './file.model.js';

export class FileService {
    static client = new S3Client({
        region: "ru-rnd-1",
        endpoint: "http://localhost:9000",
        forcePathStyle: true,
        credentials: {
            accessKeyId: 'v8634ZnbUYexpPZ0pA9c',
            secretAccessKey: 'oNFAg9roZ8LOxVtE5p8cL3Vm6FTf0Rs1rPyfOBwO'
        },
    });

    static async checkMinIOConnection() {
        try {
            await this.client.send(new ListBucketsCommand({}));
            console.log('Successfully connected to MinIO');
            return true;
        } catch (error) {
            console.error('MinIO connection error:', error);
            return false;
        }
    }

    static async saveFile(fileStream, fileName, mimetype, userId) {
        try {
            // Генерируем уникальный ключ для файла
            const fileKey = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(fileName)}`;
            
            // Параметры для загрузки
            const uploadParams = {
                Bucket: "books",
                Key: fileKey,
                Body: fileStream,
                ContentType: mimetype
            };

            // Загружаем файл в MinIO
            const parallelUpload = new Upload({
                client: this.client,
                params: uploadParams
            });

            const uploadResult = await parallelUpload.done();

            // Сохраняем метаданные в БД
            const fileRecord = await File.create({
                key: fileKey,
                original_name: fileName,
                size: uploadResult.ContentLength,
                bucket: "books",
                user_id: userId,
                mime_type: mimetype,
            });

            return {
                error: null,
                data: {
                    id: fileRecord.id,
                    key: fileRecord.key,
                    mime_type: fileRecord.mime_type,
                    url: `http://localhost:3000/files/${fileRecord.id}`
                }
            };
        } catch (error) {
            console.error('Error saving file:', error);
            return { 
                error: 'Failed to save file',
                details: error.message 
            };
        }
    }

    static async getFile(fileId) {
    try {
        const fileRecord = await File.findByPk(fileId);
        if (!fileRecord) {
            throw new Error('File not found in database');
        }

        const command = new GetObjectCommand({
            Bucket: fileRecord.bucket,
            Key: fileRecord.key,
        });

        const response = await this.client.send(command);
        
        // Важно: собираем все данные в буфер перед возвратом
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        return {
            error: null,
            data: {
                buffer,
                contentType: response.ContentType || 'application/octet-stream',
                contentLength: response.ContentLength
            }
        };
    } catch (error) {
        console.error('File retrieval error:', error);
        return { 
            error: error.message,
            data: null 
        };
    }
}
}