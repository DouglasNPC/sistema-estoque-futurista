from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

#1. Tabela de Itens (O Catalogo)
#aqui fica apenas o cadastro base do produto. A quantidade atual é atualizada automaticamente.
class Item(Base):
    __tablename__ = "itens"
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True) #ex: "TEC-001" (unique = Não se repete)
    nome = Column(String, index=True)
    quantidade_atual = Column(Integer, default=0)

#2. Tabela de entradas
class Entrada(Base):
    __tablename__ = "entradas"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("itens.id"))
    nfe = Column(String)
    quantidade = Column(String)
    data_entrega = Column(DateTime)
    observacao = Column(String, nullable=True)

#3. Tabela de Saidas
class Saida(Base):
    __tablename__ = "saidas"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("itens.id"))
    ticket = Column(String)
    patrimonio = Column(String) # Maquina que vai receber o item
    secretaria = Column(String) # Setor que vai receber o item
    quantidade = Column(String)
    status = Column(String, default="Andamento")
    data_saida = Column(DateTime, default=datetime.utcnow)

#4. Tabela de logs
class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String)
    item_nome = Column(String)
    quantidade_movimentada = Column(Integer)
    data = Column(DateTime, default=datetime.utcnow)