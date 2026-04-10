import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

// Allowed file types and extensions
const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/png"],
  document: ["application/pdf"],
};

const ALLOWED_EXTENSIONS = {
  image: [".jpg", ".jpeg", ".png"],
  document: [".pdf"],
};

// File size limits (in bytes)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Function to validate file
function validateFile(file: any, allowedTypes: string[]): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}` };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds 2MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB` };
  }

  return { valid: true };
}

// Avatar upload configuration
export const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "educonnect/avatars",
      resource_type: "auto",
      public_id: `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      overwrite: false,
      format: "webp", // Convert to webp for better compression
    };
  },
});

export const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const validation = validateFile(file, Object.values(ALLOWED_FILE_TYPES.image));
    if (!validation.valid) {
      return cb(new Error(validation.error));
    }
    cb(null, true);
  },
});

// Certificate upload configuration
export const certificateStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "educonnect/certificates",
      resource_type: "auto",
      public_id: `certificate_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      overwrite: false,
    };
  },
});

export const certificateUpload = multer({
  storage: certificateStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = [...Object.values(ALLOWED_FILE_TYPES.image), ...Object.values(ALLOWED_FILE_TYPES.document)].flat();
    const validation = validateFile(file, allowedTypes);
    if (!validation.valid) {
      return cb(new Error(validation.error));
    }
    cb(null, true);
  },
});

// Book cover upload configuration
export const bookCoverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "educonnect/book-covers",
      resource_type: "auto",
      public_id: `book_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      overwrite: false,
      format: "webp", // Convert to webp for better compression
    };
  },
});

export const bookCoverUpload = multer({
  storage: bookCoverStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const validation = validateFile(file, Object.values(ALLOWED_FILE_TYPES.image));
    if (!validation.valid) {
      return cb(new Error(validation.error));
    }
    cb(null, true);
  },
});

// Generic file upload configuration
export function createCustomUpload(folder: string, fileTypes: string[]) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: `educonnect/${folder}`,
        resource_type: "auto",
        public_id: `${folder}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        overwrite: false,
      };
    },
  });

  return multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      const validation = validateFile(file, fileTypes);
      if (!validation.valid) {
        return cb(new Error(validation.error));
      }
      cb(null, true);
    },
  });
}

export { ALLOWED_FILE_TYPES, MAX_FILE_SIZE };
