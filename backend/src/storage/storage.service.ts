import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService implements OnModuleInit {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'latinbrou-assets';
    this.s3Client = new S3Client({
      endpoint: `${useSSL ? 'https' : 'http'}://${endpoint}:${port}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'latinbrou_minio_admin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'latinbrou_minio_secret_2026',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async onModuleInit() {
    try {
      // Check if bucket exists
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`MinIO bucket "${this.bucketName}" not found. Creating bucket...`);
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          
          // Set bucket policy to allow public read access
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'PublicRead',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucketName}/*`],
              },
            ],
          };

          await this.s3Client.send(new PutBucketPolicyCommand({
            Bucket: this.bucketName,
            Policy: JSON.stringify(policy),
          }));
          
          console.log(`MinIO bucket "${this.bucketName}" created and public read policy configured.`);
        } catch (createError) {
          console.error('Error creating MinIO bucket:', createError);
        }
      } else {
        console.error('MinIO connection validation failed:', error);
      }
    }
  }

  async uploadFile(file: { originalname: string; buffer: Buffer; mimetype: string }): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
    const fileKey = `products/${fileName}`;

    try {
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));

      // Return local-proxy style url: /storage/products/filename.ext
      // Nginx maps /storage/* to minio:9000/latinbrou-assets/*
      return `/storage/${fileKey}`;
    } catch (error) {
      console.error('Error uploading file to MinIO:', error);
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // If url format is /storage/products/name.ext, extract key: products/name.ext
    const prefix = '/storage/';
    if (!fileUrl.startsWith(prefix)) return;
    const fileKey = fileUrl.substring(prefix.length);

    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      }));
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
    }
  }
}
