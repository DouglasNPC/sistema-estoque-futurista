import { useState, useEffect } from 'react'
import api from './api'
import './index.css'

function App() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard')
  const [produtos, setProdutos] = useState([])
  
  const [novoNome, setNovoNome] = useState('')
  const [novaQuantidade, setNovaQuantidade] = useState('')
  const [novoPreco, setNovoPreco] = useState('')
  const [novaNfe, setNovaNfe] = useState('')
  const [entregador, setEntregador] = useState('') // 1. NOVO ESTADO: Entregador

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
    e.preventDefault()
    try {
      await api.post('/produtos/', {
        nome: novoNome,
        quantidade: parseInt(novaQuantidade),
        preco: parseFloat(novoPreco),
        nfe: novaNfe,
        entregador: entregador, // 2. ENVIANDO PARA O BACKEND
        descricao: "Entrada via Sistema Web"
      })
      
      alert("Item salvo com sucesso! 🚀")
      
      // 3. LIMPANDO TODOS OS CAMPOS
      setNovoNome('')
      setNovaQuantidade('')
      setNovoPreco('')
      setNovaNfe('')
      setEntregador('') 
      
      carregarProdutos()
    } catch (error) {
      console.error(error)
      alert("Erro ao salvar. Verifique se o Back-end aceita o campo 'entregador'.")
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '250px', backgroundColor: 'var(--cor-azul-escuro)', color: 'white', padding: '20px' }}>
        <h2 style={{ borderBottom: '2px solid var(--cor-destaque)', paddingBottom: '10px' }}>ESTOQUE V1</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <button onClick={() => setAbaAtiva('dashboard')} style={{ background: abaAtiva === 'dashboard' ? 'var(--cor-destaque)' : 'transparent', color: 'white', border: 'none', padding: '15px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>
            📊 Dashboard
          </button>
          <button onClick={() => setAbaAtiva('entrada')} style={{ background: abaAtiva === 'entrada' ? 'var(--cor-destaque)' : 'transparent', color: 'white', border: 'none', padding: '15px', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>
            📥 Entrada de Estoque
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px' }}>
        
        {/* ABA DASHBOARD */}
        {abaAtiva === 'dashboard' && (
          <div>
            <h1 style={{ color: 'var(--cor-azul-escuro)' }}>Visão Geral do Estoque</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {produtos.map(prod => (
                <div key={prod.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: '5px solid var(--cor-azul-claro)' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: 'var(--cor-azul-escuro)' }}>{prod.nome}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--cor-preto)' }}>{prod.quantidade}</span>
                    <span style={{ color: '#888' }}>unidades</span>
                  </div>
                  <p style={{ color: 'var(--cor-azul-claro)', fontWeight: 'bold', margin: '10px 0' }}>R$ {prod.preco}</p>
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px', fontSize: '0.85em', color: '#666' }}>
                    <p><strong>NFe:</strong> {prod.nfe}</p>
                    <p><strong>Entregador:</strong> {prod.entregador || 'Não informado'}</p> {/* 4. EXIBINDO O ENTREGADOR */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA ENTRADA */}
        {abaAtiva === 'entrada' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--cor-azul-escuro)' }}>Nova Entrada</h1>
            <form onSubmit={salvarProduto} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome do Item</label>
                <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} required />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Número da NFe</label>
                <input type="text" value={novaNfe} onChange={e => setNovaNfe(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} required />
              </div>

              {/* 5. NOVO CAMPO VISUAL NO FORMULÁRIO */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome do Entregador</label>
                <input type="text" value={entregador} onChange={e => setEntregador(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} placeholder="Quem entregou?" />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quantidade</label>
                  <input type="number" value={novaQuantidade} onChange={e => setNovaQuantidade(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Preço Unitário (R$)</label>
                  <input type="number" step="0.01" value={novoPreco} onChange={e => setNovoPreco(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} required />
                </div>
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: 'var(--cor-destaque)', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer' }}>
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