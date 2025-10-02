import { Router } from "express";
import { 
    loginController, 
    sendAuthController, 
    setAuthController 
} from "./config/instances";


const router = Router();

router.get('/login', (req, res) => loginController.handle(req, res));
router.get('/auth', (req, res) => setAuthController.handle(req, res));
router.get('/send', (req, res) => sendAuthController.handle(req, res));


export default router;