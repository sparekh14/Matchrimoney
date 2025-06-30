import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export interface UploadResult {
  key: string;
  url: string;
  publicUrl: string;
}

/**
 * Upload a file to S3
 */
export async function uploadToS3(
  buffer: Buffer,
  mimetype: string,
  userId: string,
  originalFilename?: string
): Promise<UploadResult> {
  // Generate a unique key for the file
  const fileExtension = originalFilename ? originalFilename.split('.').pop() : 'jpg';
  const key = `profile-pictures/${userId}/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    // Removed ACL - bucket policy handles public access instead
    Metadata: {
      userId: userId,
      uploadedAt: new Date().toISOString(),
    },
  });

  try {
    await s3Client.send(command);
    
    // Generate the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
    
    // Generate a signed URL (optional, for private access if needed)
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }), { expiresIn: 3600 }); // Expires in 1 hour

    return {
      key,
      url: signedUrl,
      publicUrl,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
}

/**
 * Generate a signed URL for a file in S3
 */
export async function getSignedUrlForS3Object(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Extract S3 key from a URL or path
 */
export function extractS3KeyFromUrl(url: string): string | null {
  // Handle different URL formats:
  // - https://bucket.s3.region.amazonaws.com/key
  // - https://s3.region.amazonaws.com/bucket/key
  // - Just the key itself
  
  if (url.includes('.s3.')) {
    // Extract from full S3 URL
    const parts = url.split('/');
    const keyIndex = parts.findIndex(part => part.includes('.s3.'));
    if (keyIndex >= 0 && keyIndex < parts.length - 1) {
      return parts.slice(keyIndex + 1).join('/');
    }
  } else if (url.startsWith('profile-pictures/')) {
    // Already a key
    return url;
  }
  
  return null;
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_REGION &&
    process.env.AWS_S3_BUCKET_NAME
  );
}

export { s3Client, BUCKET_NAME }; 