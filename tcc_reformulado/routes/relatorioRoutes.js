import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import RelatorioController from '../controller/RelatorioController.js';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de relatórios (protegidas)
router.get('/financeiro', RelatorioController.getRelatorioFinanceiro);
router.get('/metas', RelatorioController.getRelatorioMetas);
router.get('/categorias', RelatorioController.getRelatorioCategorias);
router.get('/exportar', RelatorioController.exportarDados);

export default router;