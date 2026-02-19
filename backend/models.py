from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True) # Nome de login
    senha_hash = Column(String) # Nunca salvamos a senha pura, apenas o código!
    is_admin = Column(Boolean, default=False) # Só o admin pode criar outros usuários

class Item(Base):
    __tablename__ = "itens"
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True)
    nome = Column(String)
    quantidade_atual = Column(Integer, default=0)

class Entrada(Base):
    __tablename__ = "entradas"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("itens.id"))
    nfe = Column(String)
    quantidade = Column(Integer)
    data_entrega = Column(DateTime)
    observacao = Column(String, nullable=True)

class Saida(Base):
    __tablename__ = "saidas"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("itens.id"))
    ticket = Column(String)
    patrimonio = Column(String)
    secretaria = Column(String)
    quantidade = Column(Integer)
    data_saida = Column(DateTime, default=datetime.datetime.utcnow)

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String) # "ENTRADA" ou "SAÍDA"
    item_nome = Column(String)
    quantidade_movimentada = Column(Integer)
    data = Column(DateTime, default=datetime.datetime.utcnow)