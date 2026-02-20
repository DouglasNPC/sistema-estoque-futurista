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
    codigo: Optional[str] = None  # Recebe o código do Front para evitar Erro 422
    nfe: str
    quantidade: int
    data_entrega: datetime
    observacao: Optional[str] = None

class Entrada(EntradaCriar):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# SCHEMAS DE MOVIMENTAÇÃO (ENTRADAS/SAÍDAS) - Adição do Frotn até a próxima #
# ==========================================

class SaidaCriar(BaseModel):
    item_id: int
    quantidade: int
    patrimonio: str               # Agora é obrigatório conforme o App.jsx
    secretaria: str
    ticket: Optional[str] = None  # Opcional no App.jsx

class SaidaCriar(BaseModel):
    item_id: int
    ticket: Optional[str] = None      # Adicione Optional e None
    patrimonio: Optional[str] = None  # Adicione Optional e None para evitar o erro 422
    secretaria: str
    quantidade: int

class Saida(SaidaCriar):
    id: int
    data_saida: datetime
    item_nome: Optional[str] = None 

    @classmethod
    def model_validate(cls, obj, **kwargs):
        res = super().model_validate(obj, **kwargs)
        if hasattr(obj, "item") and obj.item:
            res.item_nome = obj.item.nome
        return res

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

class LogResponse(BaseModel):
    id: int
    data: datetime
    tipo: str
    item_nome: str
    quantidade_movimentada: int
    usuario_nome: Optional[str] = None
    detalhes_auditoria: Optional[str] = None

    class Config:
        from_attributes = True

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

class UsuarioPerfilUpdate(BaseModel):
    email: Optional[str] = None
    nome_completo: Optional[str] = None
    funcao: Optional[str] = None
    foto: Optional[str] = None
    