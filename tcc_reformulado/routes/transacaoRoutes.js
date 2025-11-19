import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import TransacaoController from '../controller/TransacaoController.js';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de transações (protegidas)
router.get('/:usuario_id', TransacaoController.getByUsuario);
router.post('/', TransacaoController.create);
router.put('/:id', TransacaoController.update);
router.delete('/:id', TransacaoController.delete);

export default router;