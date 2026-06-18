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
  // Shorthand untuk image upload (existing usage)
  single = (fieldName: string, maxSize: number = 2) => {
    return this.upload(maxSize, [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ]).single(fieldName);
  };

  // Untuk CV PDF upload
  singlePdf = (fieldName: string, maxSize: number = 5) => {
    return this.upload(maxSize, ["application/pdf"]).single(fieldName);
  };
}
