import { config } from "dotenv";

import { LoginController } from "../controllers/login-controller";
import { GetAuthCodeController } from "../controllers/get-auth-code-controller";
import { SetAuthCodeController } from "../controllers/set-auth-code-controller";
import { TokenRepository } from "../repositories/token-repository";
import { GetTokenUseCase } from "../use-cases/token/get-token-use-case";
import { IsTokenNearingExpirationUseCase } from "../use-cases/token/is-token-nearing-expiration-use-case";
import { SaveTokenUseCase } from "../use-cases/token/save-token-use-case";
import { UploadImageController } from "../controllers/upload-image-controller";
import { RegisterUploadLinkedinController } from "../controllers/register-upload-linkedin-controller";
import { UploadLinkedinImageController } from "../controllers/upload-linkedin-image-controller";
import { PublishLinkedinController } from "../controllers/publish-linkedin-controller";


config();

// Variaveis de ambiente
const redirect_uri = process.env.REDIRECT_URI || '';
const client_id = process.env.CLIENT_ID || '';
const client_secret = process.env.CLIENT_SECRET || '';
const scope = process.env.SCOPE || '';


// Repositorio
const tokenRepository = new TokenRepository();

// Use Cases
const getTokenUseCase = new GetTokenUseCase(tokenRepository);
const saveTokenUseCase = new SaveTokenUseCase(tokenRepository);
const isTokenNearingExpirationUseCase = new IsTokenNearingExpirationUseCase(tokenRepository);


// Controladores
export const loginController = new LoginController(
    redirect_uri,
    client_id,
    scope
);
export const setAuthController = new SetAuthCodeController(
    saveTokenUseCase,
    redirect_uri,
    client_id,
    client_secret
);
export const getAuthController = new GetAuthCodeController(
    getTokenUseCase,
    isTokenNearingExpirationUseCase,
);
export const uploadImageController = new UploadImageController();
export const registerUploadRequest = new RegisterUploadLinkedinController(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    getTokenUseCase
);
export const uploadLinkedinImageController = new UploadLinkedinImageController(
    getTokenUseCase
);
export const publishLinkedinController = new PublishLinkedinController(
    getTokenUseCase
);