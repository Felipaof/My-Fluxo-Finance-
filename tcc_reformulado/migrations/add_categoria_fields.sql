-- Migração: Adicionar campos tipo, icone e usuario_id à tabela categoria
-- Data: 2025-10-22

-- Adicionar coluna tipo (receita ou despesa)
ALTER TABLE categoria ADD COLUMN tipo TEXT DEFAULT 'despesa' CHECK(tipo IN ('receita', 'despesa'));

-- Adicionar coluna icone (emoji representativo)
ALTER TABLE categoria ADD COLUMN icone TEXT DEFAULT '📂';

-- Adicionar coluna usuario_id (null para categorias do sistema, preenchido para categorias personalizadas)
ALTER TABLE categoria ADD COLUMN usuario_id INTEGER;

-- Adicionar foreign key para usuario_id
-- Nota: SQLite não suporta ADD CONSTRAINT diretamente, 
-- mas a constraint será validada pelo Sequelize

-- Atualizar categorias existentes com tipo padrão
UPDATE categoria SET tipo = 'despesa' WHERE tipo IS NULL;
UPDATE categoria SET icone = '📂' WHERE icone IS NULL;

-- Definir ícones específicos para categorias existentes (opcional)
UPDATE categoria SET icone = '🍔' WHERE nome = 'Alimentação';
UPDATE categoria SET icone = '🚗' WHERE nome = 'Transporte';
UPDATE categoria SET icone = '⚕️' WHERE nome = 'Saúde';
UPDATE categoria SET icone = '📚' WHERE nome = 'Educação';
UPDATE categoria SET icone = '🎮' WHERE nome = 'Lazer';
UPDATE categoria SET icone = '🏠' WHERE nome = 'Moradia';
UPDATE categoria SET icone = '👔' WHERE nome = 'Vestuário';
UPDATE categoria SET icone = '💼' WHERE nome = 'Salário';
UPDATE categoria SET icone = '📈' WHERE nome = 'Investimentos';
UPDATE categoria SET icone = '📦' WHERE nome = 'Outros';

-- Definir tipo para categorias existentes
UPDATE categoria SET tipo = 'receita' WHERE nome IN ('Salário', 'Investimentos', 'Freelance', 'Dividendos', 'Aluguel', 'Bonificação');
UPDATE categoria SET tipo = 'despesa' WHERE tipo = 'despesa'; -- Manter despesas como estão

-- Verificar resultado
SELECT id, nome, tipo, icone, usuario_id FROM categoria;
