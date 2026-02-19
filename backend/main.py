from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#
# Rota 1 e 3: Itens (Dashboard e Gestao de Produtos)
#
@app.get("/itens/", response_model=List[schemas.Item])
def listar_itens(db: Session = Depends(get_db)):
    return db.query(models.Item).all()

@app.post("/itens/", response_model=schemas.Item)
def criar_item(item: schemas.ItemCriar, db: Session = Depends(get_db)):
    # Confere se o codigo já existe para nao duplicar (Corrigido o espaço antes do .first())
    if db.query(models.Item).filter(models.Item.codigo == item.codigo).first():
        raise HTTPException(status_code=400, detail="Código já cadastrado")
    
    novo_item = models.Item(**item.dict(), quantidade_atual=0)
    db.add(novo_item)
    db.commit()
    return novo_item

#
# Rota 2: Entrada (Soma no estoque e gera o log)
#
@app.post("/entradas/", response_model=schemas.Entrada)
def registrar_entrada(entrada: schemas.EntradaCriar, db: Session = Depends(get_db)):
    # 1. Acha o item no banco
    item = db.query(models.Item).filter(models.Item.id == entrada.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    # 2. Salva a Entrada
    nova_entrada = models.Entrada(**entrada.dict())
    db.add(nova_entrada)

    # 3. MATEMÁTICA: Soma no estoque atual
    item.quantidade_atual += entrada.quantidade

    # 4. Gera o Log
    novo_log = models.Log(tipo="ENTRADA", item_nome=item.nome, quantidade_movimentada=entrada.quantidade)
    db.add(novo_log)

    db.commit()
    return nova_entrada

#
# Rota 5: Saida (Subtrai o estoque e gera o log)
#
@app.post("/saidas/", response_model=schemas.Saida)
def registrar_saida(saida: schemas.SaidaCriar, db: Session = Depends(get_db)):
    # Corrigido models.item para models.Item e .firts() para .first()
    item = db.query(models.Item).filter(models.Item.id == saida.item_id).first()

    # Regra de negócio: nao tirar o que não tem
    if not item or item.quantidade_atual < saida.quantidade:
        raise HTTPException(status_code=400, detail="Estoque insuficiente ou Item inexistente")
    
    # Corrigido models.saida para models.Saida
    nova_saida = models.Saida(**saida.dict())
    db.add(nova_saida)

    # Matematica: Subtrai do estoque atual (Corrigido saida.Quantidade para saida.quantidade)
    item.quantidade_atual -= saida.quantidade

    novo_log = models.Log(tipo="SAÍDA", item_nome=item.nome, quantidade_movimentada=saida.quantidade)
    db.add(novo_log)

    db.commit()
    return nova_saida

#
# Rota 4: Logs (para tela de histórico)
#
@app.get("/logs/", response_model=List[schemas.Log])
def listar_logs(db: Session = Depends(get_db)):
    # Retorna os logs ordenados do mais recente pro mais antigo
    return db.query(models.Log).order_by(models.Log.data.desc()).all()