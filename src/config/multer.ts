import multer from "multer";
import path from "path";
import fs from "fs";


const uploadFolder = path.resolve(__dirname, "..", "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Definindo onde e como salvar os arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `Image${ext}`);
  },
});

export const upload = multer({ storage });
