from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

import models, schemas
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# ==========================================
# CONFIGURAÇÕES DE SEGURANÇA (JWT E BCRYPT)
# ==========================================
SECRET_KEY = "erp_estoque_chave_super_secreta_2026" # Em um sistema real, isso fica oculto!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 12 # O usuário é deslogado após 12 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verificar_senha(senha_pura, senha_hash):
    return pwd_context.verify(senha_pura, senha_hash)

def gerar_hash_senha(senha):
    return pwd_context.hash(senha)

def criar_token_acesso(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# O CADEADO DO SISTEMA: Verifica se o usuário tem o crachá digital
def obter_usuario_atual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise HTTPException(status_code=401, detail="Token inválido")
    except Exception:
        raise HTTPException(status_code=401, detail="Credenciais inválidas ou expiradas")
    
    usuario = db.query(models.Usuario).filter(models.Usuario.username == username).first()
    if usuario is None: raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return usuario

# ==========================================
# ROTAS DE AUTENTICAÇÃO E USUÁRIOS
# ==========================================
@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    
    token_acesso = criar_token_acesso(data={"sub": usuario.username, "is_admin": usuario.is_admin})
    return {"access_token": token_acesso, "token_type": "bearer"}

@app.post("/usuarios/setup", response_model=schemas.UsuarioResponse)
def criar_primeiro_admin(db: Session = Depends(get_db)):
    # Essa rota é uma "porta dos fundos" apenas para criar o 1º usuário. Ela se tranca sozinha depois.
    admin_existe = db.query(models.Usuario).first()
    if admin_existe: raise HTTPException(status_code=400, detail="Setup já foi realizado")
    
    novo_admin = models.Usuario(username="admin", senha_hash=gerar_hash_senha("admin123"), is_admin=True)
    db.add(novo_admin)
    db.commit()
    return novo_admin

@app.post("/usuarios/", response_model=schemas.UsuarioResponse)
def criar_usuario(usuario: schemas.UsuarioCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if not usuario_atual.is_admin: raise HTTPException(status_code=403, detail="Apenas administradores podem criar usuários")
    if db.query(models.Usuario).filter(models.Usuario.username == usuario.username).first():
        raise HTTPException(status_code=400, detail="Nome de usuário já existe")
    
    novo_usuario = models.Usuario(username=usuario.username, senha_hash=gerar_hash_senha(usuario.senha), is_admin=usuario.is_admin)
    db.add(novo_usuario)
    db.commit()
    return novo_usuario

@app.put("/usuarios/senha")
def alterar_senha(senhas: schemas.SenhaAtualizar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if not verificar_senha(senhas.senha_antiga, usuario_atual.senha_hash):
        raise HTTPException(status_code=400, detail="Senha antiga incorreta")
    
    usuario_atual.senha_hash = gerar_hash_senha(senhas.senha_nova)
    db.commit()
    return {"msg": "Senha atualizada com sucesso"}

# ==========================================
# ROTAS DO SISTEMA (AGORA PROTEGIDAS PELO CADEADO)
# Note o `usuario_atual: models.Usuario = Depends(obter_usuario_atual)` em todas!
# ==========================================

@app.get("/itens/", response_model=List[schemas.Item])
def listar_itens(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return db.query(models.Item).all()

@app.post("/itens/", response_model=schemas.Item)
def criar_item(item: schemas.ItemCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if db.query(models.Item).filter(models.Item.codigo == item.codigo).first():
        raise HTTPException(status_code=400, detail="Código já cadastrado")
    novo_item = models.Item(**item.dict(), quantidade_atual=0)
    db.add(novo_item)
    db.commit()
    return novo_item

@app.put("/itens/{item_id}", response_model=schemas.Item)
def editar_item(item_id: int, item_atualizado: schemas.ItemCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item: raise HTTPException(status_code=404)
    item.codigo = item_atualizado.codigo
    item.nome = item_atualizado.nome
    db.commit()
    return item

@app.delete("/itens/{item_id}")
def deletar_item(item_id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item: raise HTTPException(status_code=404)
    db.delete(item)
    db.commit()
    return {"msg": "Item deletado"}

@app.get("/entradas/", response_model=List[schemas.Entrada])
def listar_entradas(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return db.query(models.Entrada).order_by(models.Entrada.data_entrega.desc()).all()

@app.post("/entradas/", response_model=schemas.Entrada)
def registrar_entrada(entrada: schemas.EntradaCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    item = db.query(models.Item).filter(models.Item.id == entrada.item_id).first()
    if not item: raise HTTPException(status_code=404, detail="Item não encontrado")
    nova_entrada = models.Entrada(**entrada.dict())
    db.add(nova_entrada)
    item.quantidade_atual += entrada.quantidade
    db.add(models.Log(tipo="ENTRADA", item_nome=item.nome, quantidade_movimentada=entrada.quantidade))
    db.commit()
    return nova_entrada

@app.put("/entradas/{entrada_id}", response_model=schemas.Entrada)
def editar_entrada(entrada_id: int, ent_atualizada: schemas.EntradaCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    entrada = db.query(models.Entrada).filter(models.Entrada.id == entrada_id).first()
    item = db.query(models.Item).filter(models.Item.id == entrada.item_id).first()
    item.quantidade_atual = item.quantidade_atual - entrada.quantidade + ent_atualizada.quantidade
    entrada.nfe = ent_atualizada.nfe
    entrada.quantidade = ent_atualizada.quantidade
    entrada.data_entrega = ent_atualizada.data_entrega
    entrada.observacao = ent_atualizada.observacao
    db.commit()
    return entrada

@app.delete("/entradas/{entrada_id}")
def deletar_entrada(entrada_id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    entrada = db.query(models.Entrada).filter(models.Entrada.id == entrada_id).first()
    item = db.query(models.Item).filter(models.Item.id == entrada.item_id).first()
    item.quantidade_atual -= entrada.quantidade
    db.delete(entrada)
    db.add(models.Log(tipo="SAÍDA (CORREÇÃO)", item_nome=item.nome, quantidade_movimentada=entrada.quantidade))
    db.commit()
    return {"msg": "Entrada cancelada"}

@app.get("/saidas/", response_model=List[schemas.Saida])
def listar_saidas(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return db.query(models.Saida).order_by(models.Saida.data_saida.desc()).all()

@app.post("/saidas/", response_model=schemas.Saida)
def registrar_saida(saida: schemas.SaidaCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    item = db.query(models.Item).filter(models.Item.id == saida.item_id).first()
    if not item or item.quantidade_atual < saida.quantidade:
        raise HTTPException(status_code=400, detail="Estoque insuficiente")
    nova_saida = models.Saida(**saida.dict())
    db.add(nova_saida)
    item.quantidade_atual -= saida.quantidade
    db.add(models.Log(tipo="SAÍDA", item_nome=item.nome, quantidade_movimentada=saida.quantidade))
    db.commit()
    return nova_saida

@app.put("/saidas/{saida_id}", response_model=schemas.Saida)
def editar_saida(saida_id: int, saida_atualizada: schemas.SaidaCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    saida = db.query(models.Saida).filter(models.Saida.id == saida_id).first()
    item = db.query(models.Item).filter(models.Item.id == saida.item_id).first()
    item.quantidade_atual = item.quantidade_atual + saida.quantidade - saida_atualizada.quantidade
    saida.ticket = saida_atualizada.ticket
    saida.patrimonio = saida_atualizada.patrimonio
    saida.secretaria = saida_atualizada.secretaria
    saida.quantidade = saida_atualizada.quantidade
    db.commit()
    return saida

@app.delete("/saidas/{saida_id}")
def deletar_saida(saida_id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    saida = db.query(models.Saida).filter(models.Saida.id == saida_id).first()
    item = db.query(models.Item).filter(models.Item.id == saida.item_id).first()
    item.quantidade_atual += saida.quantidade
    db.delete(saida)
    db.add(models.Log(tipo="ENTRADA (CORREÇÃO)", item_nome=item.nome, quantidade_movimentada=saida.quantidade))
    db.commit()
    return {"msg": "Saída cancelada"}

@app.get("/logs/", response_model=List[schemas.Log])
def listar_logs(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return db.query(models.Log).order_by(models.Log.data.desc()).all()