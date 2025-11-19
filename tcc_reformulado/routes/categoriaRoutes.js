import { Router } from 'express';
import CategoriaController from '../controller/CategoriaController.js';

const router = Router();

// Rotas de categorias (públicas para leitura)
router.get('/', CategoriaController.getAll);
router.post('/', CategoriaController.create);
router.put('/:id', CategoriaController.update);
router.delete('/:id', CategoriaController.delete);

export default router;