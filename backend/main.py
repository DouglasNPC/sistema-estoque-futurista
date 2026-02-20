from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

import models, schemas
from database import engine, SessionLocal

# Cria as tabelas no banco de dados se elas não existirem
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ERP Estoque API v3.0")

# Configuração de CORS para permitir acesso de outros IPs na rede local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# CONFIGURAÇÕES DE SEGURANÇA (JWT E BCRYPT)
# ==========================================
SECRET_KEY = "erp_estoque_chave_super_secreta_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 12

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

def obter_usuario_atual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas ou expiradas")
    
    usuario = db.query(models.Usuario).filter(models.Usuario.username == username).first()
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return usuario

# ==========================================
# ROTAS DE AUTENTICAÇÃO E PERFIL
# ==========================================

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário ou senha incorretos")
    
    token_acesso = criar_token_acesso(data={"sub": usuario.username, "is_admin": usuario.is_admin})
    return {"access_token": token_acesso, "token_type": "bearer"}

@app.get("/usuarios/me", response_model=schemas.UsuarioResponse)
def ler_perfil(usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return usuario_atual

@app.put("/usuarios/senha")
def alterar_senha_propria(senhas: schemas.SenhaAtualizar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if not verificar_senha(senhas.senha_antiga, usuario_atual.senha_hash):
        raise HTTPException(status_code=400, detail="Senha antiga incorreta")
    usuario_atual.senha_hash = gerar_hash_senha(senhas.senha_nova)
    db.commit()
    return {"msg": "Senha atualizada com sucesso"}

# ==========================================
# GESTÃO DE USUÁRIOS (SOMENTE ADMIN)
# ==========================================
@app.get("/usuarios/me", response_model=schemas.UsuarioResponse)
def ler_usuario_logado(usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return usuario_atual

@app.post("/usuarios/setup", response_model=schemas.UsuarioResponse)
def setup_inicial(db: Session = Depends(get_db)):
    admin_existe = db.query(models.Usuario).first()
    if admin_existe:
        raise HTTPException(status_code=400, detail="Setup já realizado")
    novo_admin = models.Usuario(username="admin", senha_hash=gerar_hash_senha("admin123"), is_admin=True)
    db.add(novo_admin)
    db.commit()
    return novo_admin

@app.get("/usuarios/lista", response_model=List[schemas.UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if not usuario_atual.is_admin:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return db.query(models.Usuario).all()

@app.post("/usuarios/", response_model=schemas.UsuarioResponse)
def criar_novo_usuario(usuario: schemas.UsuarioCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if not usuario_atual.is_admin:
        raise HTTPException(status_code=403, detail="Acesso negado")
    if db.query(models.Usuario).filter(models.Usuario.username == usuario.username).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")
    novo = models.Usuario(username=usuario.username, senha_hash=gerar_hash_senha(usuario.senha), is_admin=usuario.is_admin)
    db.add(novo)
    db.commit()
    return novo

@app.put("/usuarios/{usuario_id}", response_model=schemas.UsuarioResponse)
def editar_usuario(usuario_id: int, dados: schemas.UsuarioCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if not usuario_atual.is_admin:
        raise HTTPException(status_code=403, detail="Acesso negado")
    target = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not target: raise HTTPException(status_code=404)
    
    target.username = dados.username
    if usuario_id != usuario_atual.id: 
        target.is_admin = dados.is_admin
    if dados.senha and len(dados.senha.strip()) > 0:
        target.senha_hash = gerar_hash_senha(dados.senha)
    db.commit()
    return target

@app.delete("/usuarios/{usuario_id}")
def remover_usuario(usuario_id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if not usuario_atual.is_admin:
        raise HTTPException(status_code=403, detail="Acesso negado")
    if usuario_id == usuario_atual.id:
        raise HTTPException(status_code=400, detail="Não pode deletar a si mesmo")
    user = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    db.delete(user)
    db.commit()
    return {"msg": "Removido"}

@app.put("/usuarios/perfil")
def atualizar_perfil(perfil: schemas.UsuarioPerfilUpdate, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if perfil.email: usuario_atual.email = perfil.email
    if perfil.nome_completo: usuario_atual.nome_completo = perfil.nome_completo
    if perfil.funcao: usuario_atual.funcao = perfil.funcao
    if perfil.foto: usuario_atual.foto = perfil.foto
    db.commit()
    db.refresh(usuario_atual)
    return usuario_atual

# ==========================================
# GESTÃO DE PRODUTOS E ESTOQUE
# ==========================================

@app.get("/itens/", response_model=List[schemas.Item])
def listar_itens(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return db.query(models.Item).all()

@app.post("/itens/", response_model=schemas.Item)
def criar_item(item: schemas.ItemCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    if db.query(models.Item).filter(models.Item.codigo == item.codigo).first():
        raise HTTPException(status_code=400, detail="Código já cadastrado")
    novo = models.Item(**item.dict(), quantidade_atual=0)
    db.add(novo)
    db.commit()
    return novo

@app.put("/itens/{item_id}", response_model=schemas.Item)
def editar_item(item_id: int, dados: schemas.ItemCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    item.codigo = dados.codigo
    item.nome = dados.nome
    db.commit()
    return item

@app.delete("/itens/{item_id}")
def deletar_item(item_id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    db.delete(item)
    db.commit()
    return {"msg": "Deletado"}

# ==========================================
# ENTRADAS E SAÍDAS
# ==========================================

@app.get("/entradas/", response_model=List[schemas.Entrada])
def listar_entradas(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return db.query(models.Entrada).order_by(models.Entrada.data_entrega.desc()).all()

@app.post("/entradas/", response_model=schemas.Entrada)
def registrar_entrada(entrada: schemas.EntradaCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    item = db.query(models.Item).filter(models.Item.id == entrada.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    # Removemos 'codigo' apenas para o banco aceitar a entrada via ID
    dados_entrada = entrada.dict(exclude={"codigo"})
    nova = models.Entrada(**dados_entrada)
    db.add(nova)
    
    item.quantidade_atual += entrada.quantidade
    
    # LOG DE AUDITORIA: Salvamos o código junto com o nome fisicamente na tabela!
    texto_historico = f"[{item.codigo}] {item.nome}"
    db.add(models.Log(
        tipo="ENTRADA", 
        item_nome=texto_historico, 
        quantidade_movimentada=entrada.quantidade,
        usuario_nome=usuario_atual.username,
        detalhes_auditoria=f"NFe: {entrada.nfe} | Ref: Cadastro Batch"
    ))
    
    db.commit()
    db.refresh(nova)
    return nova

@app.put("/entradas/{entrada_id}", response_model=schemas.Entrada)
def editar_entrada(entrada_id: int, dados: schemas.EntradaCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    ent = db.query(models.Entrada).filter(models.Entrada.id == entrada_id).first()
    item = db.query(models.Item).filter(models.Item.id == ent.item_id).first()
    item.quantidade_atual = item.quantidade_atual - ent.quantidade + dados.quantidade
    ent.nfe = dados.nfe
    ent.quantidade = dados.quantidade
    ent.data_entrega = dados.data_entrega
    db.commit()
    return ent

@app.delete("/entradas/{entrada_id}")
def deletar_entrada(entrada_id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    ent = db.query(models.Entrada).filter(models.Entrada.id == entrada_id).first()
    item = db.query(models.Item).filter(models.Item.id == ent.item_id).first()
    item.quantidade_atual -= ent.quantidade
    db.delete(ent)
    db.commit()
    return {"msg": "Cancelado"}

# Correção para Frontend - Adição do Front até a próxima #

@app.get("/saidas/", response_model=List[schemas.Saida])
def listar_saidas(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)): 
    return db.query(models.Saida).order_by(models.Saida.data_saida.desc()).all()

@app.post("/saidas/", response_model=schemas.Saida)
def registrar_saida(saida: schemas.SaidaCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    item = db.query(models.Item).filter(models.Item.id == saida.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    if item.quantidade_atual < saida.quantidade:
        raise HTTPException(status_code=400, detail="Estoque insuficiente")
    
    nova = models.Saida(**saida.dict())
    db.add(nova)
    
    item.quantidade_atual -= saida.quantidade
    
    # LOG DE AUDITORIA: Salvamos o código junto com o nome fisicamente na tabela!
    texto_historico = f"[{item.codigo}] {item.nome}"
    db.add(models.Log(
        tipo="SAÍDA", 
        item_nome=texto_historico, 
        quantidade_movimentada=saida.quantidade,
        usuario_nome=usuario_atual.username,
        detalhes_auditoria=f"Destino: {saida.secretaria} | Patr: {saida.patrimonio} | Tkt: {saida.ticket or 'N/A'}"
    ))
    
    db.commit()
    db.refresh(nova)
    return nova

@app.put("/saidas/{saida_id}", response_model=schemas.Saida)
def editar_saida(saida_id: int, dados: schemas.SaidaCriar, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    sai = db.query(models.Saida).filter(models.Saida.id == saida_id).first()
    if not sai:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
        
    item = db.query(models.Item).filter(models.Item.id == sai.item_id).first()
    
    # Lógica de ajuste de estoque: Devolve a antiga e retira a nova
    estoque_temporario = item.quantidade_atual + sai.quantidade
    if estoque_temporario < dados.quantidade:
        raise HTTPException(status_code=400, detail="Estoque insuficiente para alteração")
        
    item.quantidade_atual = estoque_temporario - dados.quantidade
    
    sai.ticket = dados.ticket
    sai.patrimonio = dados.patrimonio
    sai.secretaria = dados.secretaria
    sai.quantidade = dados.quantidade
    
    db.commit()
    db.refresh(sai)
    return sai

@app.delete("/saidas/{saida_id}")
def deletar_saida(saida_id: int, db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    # Corrigido: era sai_id, alterado para saida_id
    sai = db.query(models.Saida).filter(models.Saida.id == saida_id).first()
    if not sai:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
        
    item = db.query(models.Item).filter(models.Item.id == sai.item_id).first()
    
    # Devolve a quantidade ao estoque ao cancelar a saída
    item.quantidade_atual += sai.quantidade
    
    db.add(models.Log(tipo="CANCELAMENTO SAÍDA", item_nome=item.nome, quantidade_movimentada=sai.quantidade))
    
    db.delete(sai)
    db.commit()
    return {"msg": "Saída cancelada e estoque devolvido"}

# Correção para Frontend - Fim

@app.get("/logs/", response_model=List[schemas.Log])
def listar_logs(db: Session = Depends(get_db), usuario_atual: models.Usuario = Depends(obter_usuario_atual)):
    return db.query(models.Log).order_by(models.Log.data.desc()).all()
