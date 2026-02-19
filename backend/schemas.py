from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- SCHEMAS PARA ITEM ---
class ItemBase(BaseModel):
    codigo: str
    nome: str

class ItemCriar(ItemBase):
    pass

class Item(ItemBase):
    id: int
    quantidade_atual: int
    class Config:
        from_attributes = True

# --- SCHEMAS PARA ENTRADA ---
class EntradaCriar(BaseModel):
    item_id: int
    nfe: str
    quantidade: int
    data_entrega: datetime
    observacao: Optional[str] = None

class Entrada(EntradaCriar):
    id: int
    class Config:
        from_attributes = True

# --- SCHEMAS PARA SAÍDA ---
class SaidaCriar(BaseModel):
    item_id: int
    ticket: str
    patrimonio: str
    secretaria: str
    quantidade: int

class Saida(SaidaCriar):
    id: int
    status: str
    data_saida: datetime
    class Config:
        from_attributes = True

# --- SCHEMAS PARA LOG ---
class Log(BaseModel):
    id: int
    tipo: str
    item_nome: str
    quantidade_movimentada: int
    data: datetime
    class Config:
        from_attributes = True

# --- SCHEMAS PARA USUÁRIO (Futuro) ---
class UsuarioCriar(BaseModel):
    username: str
    senha: str
    is_admin: bool = False

class UsuarioResponse(BaseModel):
    id: int
    username: str
    is_admin: bool

class SenhaAtualizar(BaseModel):
    senha_antiga: str
    senha_nova: str

class Token(BaseModel):
    access_token: str
    token_type: str