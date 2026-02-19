from sqlalchemy import Column, Integer, String, DateTime, Float # Adicione Float e DateTime
from datetime import datetime
from database import Base

class Produto(Base):
    __tablename__ = "produtos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    descricao = Column(String, nullable=True)
    preco = Column(Float)
    quantidade = Column(Integer)

# ADICIONE ISSO AQUI:
class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    produto_nome = Column(String)
    acao = Column(String)  # Ex: "Entrada de Estoque"
    quantidade = Column(Integer)
    data = Column(DateTime, default=datetime.utcnow)