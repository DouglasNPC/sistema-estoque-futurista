from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

# ==========================================
# SCHEMAS DE PRODUTOS E ESTOQUE
# ==========================================

class ItemCriar(BaseModel):
    codigo: str
    nome: str

class Item(ItemCriar):
    id: int
    quantidade_atual: int
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# SCHEMAS DE MOVIMENTAÇÃO (ENTRADAS/SAÍDAS)
# ==========================================

class EntradaCriar(BaseModel):
    item_id: int
    nfe: str
    quantidade: int
    data_entrega: datetime
    observacao: Optional[str] = None

class Entrada(EntradaCriar):
    id: int
    model_config = ConfigDict(from_attributes=True)

class SaidaCriar(BaseModel):
    item_id: int
    ticket: str
    patrimonio: str
    secretaria: str
    quantidade: int

class Saida(SaidaCriar):
    id: int
    data_saida: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# SCHEMAS DE LOGS E HISTÓRICO
# ==========================================

class Log(BaseModel):
    id: int
    tipo: str
    item_nome: str
    quantidade_movimentada: int
    data: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# SCHEMAS DE USUÁRIOS E SEGURANÇA
# ==========================================

class UsuarioCriar(BaseModel):
    username: str
    senha: Optional[str] = None  # Opcional para quando editamos sem trocar senha
    is_admin: bool = False

class UsuarioResponse(BaseModel):
    id: int
    username: str
    is_admin: bool
    model_config = ConfigDict(from_attributes=True)

class SenhaAtualizar(BaseModel):
    senha_antiga: str
    senha_nova: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None