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
    # Novos campos para auditoria
    email = Column(String, nullable=True) # Opcional, mas pode ser útil para recuperação de senha
    nome_completo = Column(String, nullable=True) # Para exibir o nome do usuário no histórico e logs
    funcao = Column(String, nullable=True) # Para saber a função do usuário (ex: "Técnico", "Gerente", etc.)
    foto = Column(String, default="🧑‍💼") # URL ou caminho para a foto do usuário (opcional)

class Item(Base):
    __tablename__ = "itens"
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True)
    nome = Column(String)
    quantidade_atual = Column(Integer, default=0)
    
    saidas = relationship("Saida", back_populates="item")

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
    ticket = Column(String, nullable=True) # Pode ser nulo
    patrimonio = Column(String, nullable=False) # Agora é obrigatório (não pode ser nulo)
    secretaria = Column(String)
    quantidade = Column(Integer)
    data_saida = Column(DateTime, default=datetime.datetime.utcnow)

    # Relacionamento para facilitar consultas
    item = relationship("Item", back_populates="saidas")

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(DateTime, default=datetime.datetime.utcnow)
    tipo = Column(String) # "ENTRADA" ou "SAÍDA"
    item_nome = Column(String)
    quantidade_movimentada = Column(Integer)
    # Novos Campos para auditoria (LGPD e controle de acesso)
    usuario_nome = Column(String, nullable=True) # Nome do usuário que fez a movimentação
    detalhes_auditoria = Column(String, nullable=True) # Qualquer detalhe extra