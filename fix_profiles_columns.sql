-- Este script adiciona as colunas de "email" e "phone" (telefone) à tabela "profiles"
-- Isso era o que estava causando o painel ficar em branco tentando carregar pedidos (erro: column email does not exist)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text,
    ADD COLUMN IF NOT EXISTS phone text;