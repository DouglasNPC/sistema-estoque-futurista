# 📦 Sistema de Gestão de Estoque V1.0

Este repositório contém o Backend (Python/FastAPI) e o Frontend (React/Vite) do sistema.

---------------------------------------------------------------------------
## Erros e passos identificados no processo de transferência de atualizações
## 🚀 Guia de Instalação (Máquina do Zero)

Ao baixar este projeto em uma nova máquina, siga os passos abaixo para evitar erros de ambiente e dependências.

### 1. Preparação do Backend (Python)
Os ambientes virtuais (`venv`) não são transferíveis entre máquinas. Você deve recriar o seu localmente.

1. Acesse a pasta do backend: `cd backend`
2. Remova qualquer venv antiga: `Remove-Item -Recurse -Force venv`
3. Crie a nova venv: `python -m venv venv`
4. Ative a venv: `.\venv\Scripts\Activate.ps1`
5. Instale as dependências: `python -m pip install -r requirements.txt`

### 2. Preparação do Frontend (React)
A pasta `node_modules` é ignorada pelo Git e precisa ser instalada para compilar as bibliotecas (como o **Recharts**).

1. Acesse a pasta: `cd frontend`
2. Instale os pacotes: `npm install`

### 3. Banco de Dados e Docker
1. Inicie os containers: `docker-compose up -d`
2. Importe o banco de dados atualizado:
   ```powershell
   Get-Content backup_producao.sql | docker exec -i estoque_db psql -U admin -d estoque_db

---

## 🚀 Como Iniciar os Sistemas

### 🔴 SISTEMA OFICIAL (PRODUÇÃO) - Não mexer!
**Objetivo:** Uso real do estoque.
- **Branch:** `main`
- **Backend:** Porta **8000** (Acesso: `http://192.168.3.229:8000/docs`)
- **Frontend:** Porta **5173** (Acesso: `http://192.168.3.229:5173`)

**Comandos para ligar:**
1. No Terminal 1 (Backend): `cd backend`, `.\venv\Scripts\activate`, `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
2. No Terminal 2 (Frontend): `cd frontend`, `npm run dev -- --host`

---

## 🛠️ Regras de Colaboração (Git workflow)

1. **Alterações Visuais:** Devem ser feitas APENAS na branch `develop`.
2. **Para enviar:** `git add .`, `git commit -m "descrição"`, `git push origin develop`.
3. **Para o Servidor atualizar:** Douglas deve rodar `git pull origin develop` no servidor.
4. **Subir para o Oficial:** Somente após teste no link `:5174`. Douglas fará o merge para a `main`.

---

## 🛑 Como Parar os Sistemas
Clique no terminal desejado e aperte **CTRL + C**.

-----------------------------------------------------------------------------


## 📥 Importação em Massa (Carga via .CSV)

Para subir centenas de itens de uma vez sem usar a interface do sistema, utilize o **DBeaver**:

1. **Preparação**: O arquivo CSV deve conter ao menos as colunas `codigo` e `nome`.
2. **Importação**: Clique com o botão direito na tabela `itens` > `Importar Dados`.
3. **Mapeamento Crítico**: 
   - A coluna `id` do banco deve ser marcada como **"Pular" (Skip)**.
   - Caso o seu CSV não tenha a coluna de quantidade, defina um **Valor Constante = 0** para `quantidade_atual` durante o mapeamento.
4. **Correção de Erros (500 Internal Server Error)**: 
   - Se os itens não aparecerem no sistema, verifique se há valores nulos na quantidade.
   - Rode este comando no SQL do DBeaver para corrigir:
     `UPDATE itens SET quantidade_atual = 0 WHERE quantidade_atual IS NULL;`
   - Lembre-se de clicar em **Salvar (Commit)** no DBeaver para efetivar as mudanças.

   ----------