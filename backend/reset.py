from database import SessionLocal
import models
from main import gerar_hash_senha

# Abre a conexão com o banco de dados
db = SessionLocal()

# Procura o usuário admin
usuario = db.query(models.Usuario).filter(models.Usuario.username == "admin").first()

if usuario:
    # Se ele já existe, força a senha nova
    usuario.senha_hash = gerar_hash_senha("admin123")
    print("✅ Usuário 'admin' encontrado! Senha RESETADA para: admin123")
else:
    # Se não existe, cria um do zero
    novo_admin = models.Usuario(username="admin", senha_hash=gerar_hash_senha("admin123"), is_admin=True)
    db.add(novo_admin)
    print("✅ Usuário 'admin' CRIADO com a senha: admin123")

db.commit()
db.close()