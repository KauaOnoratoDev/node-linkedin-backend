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


const router = Router();

router.get('/login', (req, res) => loginController.handle(req, res));
router.get('/auth', (req, res) => setAuthController.handle(req, res));
router.get('/get', (req, res) => getAuthController.handle(req, res));
router.post('/upload',
    upload.single('image'), (req, res) => uploadImageController.handle(req, res));
router.post('/registerUpload', (req, res) => registerUploadRequest.handle(req, res));
router.post('/uploadLinkedinImage', (req, res) => uploadLinkedinImageController.handle(req, res));
router.post('/publish', (req, res) => publishLinkedinController.handle(req, res));

export default router;