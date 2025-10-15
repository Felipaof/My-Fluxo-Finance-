import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import MetaController from '../controller/MetaController.js';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de metas (protegidas)
router.get('/:usuario_id', MetaController.getByUsuario);
router.post('/', MetaController.create);
router.put('/:id', MetaController.update);
router.patch('/:id/toggle', MetaController.toggle);
router.delete('/:id', MetaController.delete);

export default router;