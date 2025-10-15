import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

// Chave secreta para JWT (em produção, use variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';

// Controller para autenticação de usuários
class AuthController {
  
  // Registrar novo usuário
  static async register(req, res) {
    try {
      const { email, nome, senha } = req.body;

      // Verificar se o usuário já existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ 
          error: 'Usuário já existe com este email' 
        });
      }

      // Hash da senha
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Criar novo usuário
      const novoUsuario = await Usuario.create({
        email,
        nome,
        senha: senhaHash // Salvar hash da senha
      });

      // Remover senha da resposta
      const { senha: _, ...usuarioSemSenha } = novoUsuario.toJSON();

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: novoUsuario.id, 
          email: novoUsuario.email,
          nome: novoUsuario.nome 
        },
        JWT_SECRET,
        { expiresIn: '7d' } // Token válido por 7 dias
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso!',
        usuario: usuarioSemSenha,
        token: token
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Login do usuário
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Buscar usuário por email
      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas' 
        });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas' 
        });
      }

      // Remover senha da resposta
      const { senha: _, ...usuarioSemSenha } = usuario.toJSON();

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email,
          nome: usuario.nome 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login realizado com sucesso!',
        usuario: usuarioSemSenha,
        token: token
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  // Método para verificar token (útil para middleware)
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const usuario = await Usuario.findByPk(decoded.id);
      
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      
      return usuario;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

export default AuthController;