import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Rota para página de configurações
router.get('/', requireAuth, (req, res) => {
  res.render('configuracoes', {
    title: 'Configurações - Fluxo Finance',
    pageClass: 'page-configuracoes',
    user: req.session.user
  });
});

export default router;
