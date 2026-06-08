import multer from "multer";

export class UploadMiddleware {
  upload = (
    maxSize: number = 2,
    allowedTypes = ["image/jpeg", "image/jpg", "image/png"],
  ) => {
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: maxSize * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
          cb(new Error(`Only ${allowedTypes.join(", ")} files are allowed`));
          return;
        }
        cb(null, true);
      },
    });
  };
}
