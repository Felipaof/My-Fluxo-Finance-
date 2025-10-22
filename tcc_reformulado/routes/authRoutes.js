import { Router } from 'express';
import AuthController from '../controller/AuthController.js';

const router = Router();

// Rotas de autenticação (públicas)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;