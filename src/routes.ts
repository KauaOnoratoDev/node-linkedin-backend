import { Router } from "express";
import {
    loginController,
    getAuthController,
    setAuthController,
    uploadImageController,
    registerUploadRequest,
    uploadLinkedinImageController,
    publishLinkedinController
} from "./config/instances";
import { upload } from "./config/multer";
import { apiKeyMiddleware } from "./middlewares/api-key-middleware";


const api_key = process.env.API_KEY;
const router = Router();

router.get('/login', (req, res) => loginController.handle(req, res));
router.get('/auth', (req, res) => setAuthController.handle(req, res));
router.get('/get', apiKeyMiddleware(api_key!), (req, res) => getAuthController.handle(req, res));
router.post('/upload', 
    apiKeyMiddleware(api_key!),
    upload.single('image'), (req, res) => uploadImageController.handle(req, res));
router.post('/registerUpload', apiKeyMiddleware(api_key!), (req, res) => registerUploadRequest.handle(req, res));
router.post('/uploadLinkedinImage', apiKeyMiddleware(api_key!), (req, res) => uploadLinkedinImageController.handle(req, res));
router.post('/publish', apiKeyMiddleware(api_key!), (req, res) => publishLinkedinController.handle(req, res));

export default router;