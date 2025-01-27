import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import createError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import slugify from "slugify";

function createRoute(req: Request, fieldName: string): string {
  const directory = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "public",
    "uploads",
    fieldName
  );
  fs.mkdirSync(directory, { recursive: true });

  // Set the upload path in the request object for further use
  req.body.fileUploadPath = path.join("public", "uploads", fieldName);

  return directory;
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file?.originalname) {
      const filePath = createRoute(req, file.fieldname);
      return cb(null, filePath);
    }
    cb(new Error("Invalid file"), file.originalname);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    if (file.originalname) {
      const ext = path.extname(file.originalname);
      // const user = req.user;
      const isEnglish = /^[a-zA-Z0-9\s]+$/;
      // اگه اسم فایل فارسی باشه تبدیل میشه به فینگلیش و اگه اینگلیسه همونو میزاره
      const sanitizedFileName = isEnglish.test(file.originalname)
        ? file.originalname.replace(/\s+/g, "-") +
          "-" +
          Date.now() +
          "-" +
          // user?._id +
          // "-" +
          uuidv4() +
          ext
        : slugify(file.originalname, { locale: "en" }) +
          "-" +
          Date.now() +
          "-" +
          // user?._id +
          // "-" +
          uuidv4() +
          ext;
      req.body.filename = sanitizedFileName;
      return cb(null, sanitizedFileName);
    }
    cb(new Error("Invalid file"), file.originalname);
  },
});

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetypes = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp3",
    ".mp4",
    ".mkv",
    ".webm",
    ".zip",
    ".rar",
    ".pdf",
    ".docx",
    ".html",
  ];
  if (mimetypes.includes(ext)) {
    return cb(null, true);
  }
  return cb(createError.BadRequest("فرمت ارسال شده تصویر صحیح نمیباشد"));
}

function videoFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetypes = [".mp4", ".mpg", ".mov", ".avi", ".mkv"];
  if (mimetypes.includes(ext)) {
    return cb(null, true);
  }
  return cb(createError.BadRequest("فرمت ارسال شده ویدیو صحیح نمیباشد"));
}

function audioFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetypes = [".mp3", ".wav", ".webm"];
  if (mimetypes.includes(ext)) {
    return cb(null, true);
  }
  return cb(createError.BadRequest("فرمت ارسال شده ویس صحیح نمیباشد"));
}

const audioMaxSize = 5 * 1000 * 1000; // 5MB
const fileMaxSize = 10 * 1000 * 1000; // 10MB
const videoMaxSize = 50 * 1000 * 1000; // 50MB

export const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: audioMaxSize },
});
export const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: fileMaxSize },
});
export const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: videoMaxSize },
});
