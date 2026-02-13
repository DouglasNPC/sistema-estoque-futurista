import { useState, useEffect } from 'react'
import api from './api'
import './index.css' // Garante que o estilo carregou

function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard') // Controla qual tela aparece
  const [produtos, setProdutos] = useState([])
  
  // Estados para o formulário de entrada
  const [novoNome, setNovoNome] = useState('')
  const [novaQuantidade, setNovaQuantidade] = useState('')
  const [novoPreco, setNovoPreco] = useState('') // Precisa do preço pro banco não dar erro

  // Busca dados assim que a tela abre
  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produtos/')
      setProdutos(response.data)
    } catch (error) {
      alert("Erro ao buscar produtos. O Backend está ligado?")
    }
  }

  const salvarProduto = async (e) => {
    e.preventDefault() // Não deixa a tela recarregar
    try {
      await api.post('/produtos/', {
        nome: novoNome,
        quantidade: parseInt(novaQuantidade),
        preco: parseFloat(novoPreco),
        descricao: "Entrada via Sistema Web"
      })
      alert("Item salvo com sucesso! 🚀")
      setNovoNome('')
      setNovaQuantidade('')
      setNovoPreco('')
      carregarProdutos() // Atualiza a lista
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar. Verifique o console.")
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* --- BARRA LATERAL (Azul Escuro) --- */}
      <aside style={{ width: '250px', backgroundColor: 'var(--cor-azul-escuro)', color: 'white', padding: '20px' }}>
        <h2 style={{ borderBottom: '2px solid var(--cor-destaque)', paddingBottom: '10px' }}>ESTOQUE V1</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <button 
            onClick={() => setAbaAtiva('dashboard')}
            style={{ 
              background: abaAtiva === 'dashboard' ? 'var(--cor-destaque)' : 'transparent',
              color: 'white', border: 'none', padding: '15px', textAlign: 'left', fontWeight: 'bold' 
            }}>
            📊 Dashboard
          </button>
          <button 
            onClick={() => setAbaAtiva('entrada')}
            style={{ 
              background: abaAtiva === 'entrada' ? 'var(--cor-destaque)' : 'transparent',
              color: 'white', border: 'none', padding: '15px', textAlign: 'left', fontWeight: 'bold' 
            }}>
            📥 Entrada de Estoque
          </button>
        </nav>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <main style={{ flex: 1, padding: '40px' }}>
        
        {/* TELA 1: DASHBOARD */}
        {abaAtiva === 'dashboard' && (
          <div>
            <h1 style={{ color: 'var(--cor-azul-escuro)' }}>Visão Geral do Estoque</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {produtos.map(prod => (
                <div key={prod.id} style={{ 
                    backgroundColor: 'white', padding: '20px', borderRadius: '8px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: '5px solid var(--cor-azul-claro)'
                  }}>
                  <h3 style={{ margin: '0 0 10px 0', color: 'var(--cor-azul-escuro)' }}>{prod.nome}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--cor-preto)' }}>{prod.quantidade}</span>
                    <span style={{ color: '#888' }}>unidades</span>
                  </div>
                  <p style={{ color: 'var(--cor-azul-claro)', fontWeight: 'bold' }}>R$ {prod.preco}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TELA 2: ENTRADA DE PRODUTOS */}
        {abaAtiva === 'entrada' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--cor-azul-escuro)' }}>Nova Entrada</h1>
            <form onSubmit={salvarProduto} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome do Item</label>
                <input 
                  type="text" 
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quantidade</label>
                  <input 
                    type="number" 
                    value={novaQuantidade}
                    onChange={e => setNovaQuantidade(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    required 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={novoPreco}
                    onChange={e => setNovoPreco(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    required 
                  />
                </div>
              </div>

              <button type="submit" style={{ 
                width: '100%', padding: '15px', backgroundColor: 'var(--cor-destaque)', 
                color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '1.1em' 
              }}>
                SALVAR NO ESTOQUE
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  )
}

export default App