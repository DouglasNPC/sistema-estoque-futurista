import { useState, useEffect } from 'react'
import api from './api'

function App() {
  const [produtos, setProdutos] = useState([])
  const [erro, setErro] = useState(null)

  // Essa função roda assim que a tela abre
  useEffect(() => {
    fetchProdutos()
  }, [])

  const fetchProdutos = async () => {
    try {
      const response = await api.get('/produtos/')
      setProdutos(response.data)
      setErro(null)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      setErro("Erro ao conectar com o Backend. O servidor Python está rodando?")
    }
  }

  return (
    <div style={{ backgroundColor: '#121212', color: '#00ff41', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      
      <h1 style={{ borderBottom: '2px solid #00ff41', paddingBottom: '10px' }}>
        📦 SISTEMA DE ESTOQUE V1.0
      </h1>

      {erro && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>⚠️ {erro}</p>}

      <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
        {produtos.map(produto => (
          <div key={produto.id} style={{ border: '1px solid #333', padding: '15px', borderRadius: '5px', background: '#1e1e1e' }}>
            <h2 style={{ margin: 0 }}>{produto.nome}</h2>
            <p style={{ color: '#ccc' }}>{produto.descricao}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>R$ {produto.preco}</span>
              <span style={{ background: '#333', padding: '2px 8px', borderRadius: '4px' }}>Qtd: {produto.quantidade}</span>
            </div>
          </div>
        ))}
      </div>

      {produtos.length === 0 && !erro && <p>Carregando sistema...</p>}
      
    </div>
  )
}

export default App