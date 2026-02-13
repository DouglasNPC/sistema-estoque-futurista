# 📦 Sistema de Gestão de Estoque V1.0

Este repositório contém o Backend (Python/FastAPI) e o Frontend (React/Vite) do sistema.

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

### 🟡 SISTEMA DE TESTE (HOMOLOGAÇÃO) - Parquinho de Diversões
**Objetivo:** Testar novas cores, botões e a aba de Logs.
- **Branch:** `develop`
- **Backend:** Porta **8001**(Acesso: `http://192.168.3.229:8001/docs`)
- **Frontend:** Porta **5174** (Acesso: `http://192.168.3.229:5174`)

**Comandos para ligar:**
1. No Terminal 3 (Backend): `cd backend`, `.\venv\Scripts\activate`, `uvicorn main:app --host 0.0.0.0 --port 8001 --reload`
2. No Terminal 4 (Frontend): `cd frontend`, `npm run dev -- --host --port 5174`

---

## 🛠️ Regras de Colaboração (Git workflow)

1. **Alterações Visuais:** Devem ser feitas APENAS na branch `develop`.
2. **Para enviar:** `git add .`, `git commit -m "descrição"`, `git push origin develop`.
3. **Para o Servidor atualizar:** Douglas deve rodar `git pull origin develop` no servidor.
4. **Subir para o Oficial:** Somente após teste no link `:5174`. Douglas fará o merge para a `main`.

---

## 🛑 Como Parar os Sistemas
Clique no terminal desejado e aperte **CTRL + C**.
