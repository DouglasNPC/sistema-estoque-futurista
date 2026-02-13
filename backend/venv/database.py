from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# ATENÇÃO AQUI:
# Como você está rodando o Python no Windows (terminal preto) e o Banco no Docker,
# o endereço TEM QUE SER "localhost".
URL_BANCO = "postgresql://admin:senha123@localhost:5432/estoque_db"

engine = create_engine(URL_BANCO)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()