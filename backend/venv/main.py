from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, SessionLocal

# Cria as tabelas automaticamente ao iniciar
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CONFIGURAÇÃO DE ACESSO (CORS) ---
# Isso libera o acesso para qualquer IP (Seu celular, PC do colega, Localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão com o banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Rota de Teste (Raiz)
@app.get("/")
def ler_raiz():
    return {"mensagem": "API de Estoque Online na porta 8000! 🚀"}

# Listar Produtos
@app.get("/produtos/", response_model=List[schemas.Produto])
def listar_produtos(db: Session = Depends(get_db)):
    produtos = db.query(models.Produto).all()
    return produtos

# Criar Produto
@app.post("/produtos/", response_model=schemas.Produto)
def criar_produto(produto: schemas.ProdutoCriar, db: Session = Depends(get_db)):
    novo_produto = models.Produto(**produto.dict())
    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)
    return novo_produto

# 1. ROTA DE CRIAR PRODUTO (Atualizada para gerar Log)
@app.post("/produtos/", response_model=schemas.Produto)
def criar_produto(produto: schemas.ProdutoCriar, db: Session = Depends(get_db)):
    # Cria o produto
    novo_produto = models.Produto(**produto.dict())
    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)

    # GERA O LOG AUTOMATICAMENTE
    novo_log = models.Log(
        produto_nome=novo_produto.nome,
        acao="Entrada de Estoque",
        quantidade=novo_produto.quantidade
    )
    db.add(novo_log)
    db.commit()

    return novo_produto

# 2. ROTA DE LISTAR LOGS (A que você pediu)
@app.get("/logs/")
def listar_logs(db: Session = Depends(get_db)):
    return db.query(models.Log).order_by(models.Log.data.desc()).all()