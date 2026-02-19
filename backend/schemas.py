from pydantic import BaseModel
from datetime import datetime
from typing import Optional

#Schemas para item
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

#Schemas para entrada
class EntradaCriar(BaseModel):
    item_id: int
    nfe: str
    quantidade: int
    data_entrega: datetime
    observacao: Optional[str] = None

class Entrada(EntradaCriar):
    id: int
    class Config:
        from_attrubutes = True

#Schemas para Saida
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

#Schemas para Log
class Log(BaseModel):
    id: int
    tipo: str
    item_nome: str
    quantidade_movimentada: int
    data: datetime
    class Config:
        from_attributes = True