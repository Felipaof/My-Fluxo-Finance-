import jwt from 'jsonwebtoken';

// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';

// Middleware para verificar autenticação via token (para API)
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar se usuário está logado (para páginas EJS)
export const requireAuth = (req, res, next) => {
  console.log('🔍 Verificando autenticação para:', req.path);
  
  // Verificar se há token no cookie
  const token = req.cookies?.token;
  
  if (!token) {
    console.log('🔐 Token não encontrado no cookie, redirecionando para login');
    return res.redirect('/');
  }

  // Verificar token JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    console.log('✅ Token válido para usuário:', decoded.id);
    next();
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    return res.redirect('/');
  }
};