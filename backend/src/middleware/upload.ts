import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import fs from 'fs';
import { s3Client, BUCKET_NAME, isS3Configured } from '../utils/s3.js';
import { v4 as uuidv4 } from 'uuid';

// Check if S3 is configured
const useS3 = isS3Configured();

if (useS3) {
  console.log('✅ Using S3 for file storage');
} else {
  console.log('⚠️ S3 not configured, falling back to local storage');
  // Ensure uploads directory exists for local storage
  const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Configure storage based on availability
const storage = useS3 
  ? multerS3({
      s3: s3Client,
      bucket: BUCKET_NAME,
      // Removed ACL - bucket policy handles public access instead
      key: (req: any, file: Express.Multer.File, cb: any) => {
        const userId = req.user?.id || 'anonymous';
        const fileExtension = path.extname(file.originalname);
        const uniqueKey = `profile-pictures/${userId}/${uuidv4()}${fileExtension}`;
        cb(null, uniqueKey);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req: any, file: Express.Multer.File, cb: any) => {
        const userId = req.user?.id || 'anonymous';
        cb(null, {
          userId: userId,
          uploadedAt: new Date().toISOString(),
          originalName: file.originalname,
        });
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename: userId-timestamp.extension
        const userId = (req as any).user?.id || 'anonymous';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, `${userId}-${timestamp}${extension}`);
      },
    });

// File filter to only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
export const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to handle upload errors
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files (PNG, JPG, GIF, etc.) are allowed.' });
  }
  
  next(error);
};

// Helper function to get the correct URL for uploaded files
export function getFileUrl(file: Express.Multer.File): string {
  if (useS3) {
    // For S3, the file location is the full URL
    return (file as any).location || (file as any).key;
  } else {
    // For local storage, construct the relative path
    return `/uploads/profile-pictures/${file.filename}`;
  }
}

// Helper function to get the S3 key or local path for deletion
export function getFilePath(file: Express.Multer.File): string {
  if (useS3) {
    return (file as any).key;
  } else {
    return path.join(process.cwd(), 'uploads', 'profile-pictures', file.filename);
  }
}

export { useS3 }; 