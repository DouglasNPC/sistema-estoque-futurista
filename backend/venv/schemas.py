from pydantic import BaseModel

class ProdutoBase(BaseModel):
    nome: str
    descricao: str | None = None
    preco: float
    quantidade: int

class ProdutoCriar(ProdutoBase):
    pass

class Produto(ProdutoBase):
    id: int

    class Config:
        from_attributes = True