import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

// --- ESTILOS GERAIS (Para manter o código limpo) ---
const styles = {
  container: { fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', margin: 0 },
  nav: { backgroundColor: '#2c3e50', padding: '15px 30px', display: 'flex', gap: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  link: { color: '#ecf0f1', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '30px auto' },
  input: { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '16px', width: '100%', boxSizing: 'border-box' },
  button: (color) => ({ backgroundColor: color, color: 'white', border: 'none', padding: '12px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }),
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#7f8c8d' },
  td: { padding: '12px', borderBottom: '1px solid #eee' }
};

// --- TELA: DASHBOARD ---
const Dashboard = () => {
  const [itens, setItens] = useState([]);
  useEffect(() => { api.get('/itens/').then(res => setItens(res.data)); }, []);

  return (
    <div style={styles.card}>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>📦 Controle de Estoque</h2>
      <table style={styles.table}>
        <thead>
          <tr><th style={styles.th}>CÓDIGO</th><th style={styles.th}>NOME DO ITEM</th><th style={styles.th}>QTD DISPONÍVEL</th></tr>
        </thead>
        <tbody>
          {itens.map(i => (
            <tr key={i.id}>
              <td style={styles.td}><strong>{i.codigo}</strong></td>
              <td style={styles.td}>{i.nome}</td>
              <td style={styles.td}>
                <span style={{ backgroundColor: i.quantidade_atual > 5 ? '#e1f7e1' : '#fce4e4', padding: '4px 8px', borderRadius: '4px', color: i.quantidade_atual > 5 ? '#27ae60' : '#c0392b' }}>
                  {i.quantidade_atual} un
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- TELA: ENTRADA ---
const TelaEntrada = () => {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ item_id: '', nfe: '', quantidade: '', data: '', obs: '' });

  useEffect(() => { api.get('/itens/').then(res => setItens(res.data)); }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/entradas/', { ...form, item_id: parseInt(form.item_id), quantidade: parseInt(form.quantidade), data_entrega: `${form.data}T10:00:00` });
      alert("✅ Sucesso: Estoque atualizado!");
    } catch (err) { alert("❌ Erro: " + err.response?.data?.detail); }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ color: '#27ae60' }}>📥 Registrar Entrada (NF-e)</h2>
      <form onSubmit={handleSalvar} style={{ display: 'grid', gap: '15px' }}>
        <select required style={styles.input} onChange={e => setForm({...form, item_id: e.target.value})}>
          <option value="">Selecione o produto...</option>
          {itens.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
        </select>
        <input type="text" placeholder="Número da Nota Fiscal" required style={styles.input} onChange={e => setForm({...form, nfe: e.target.value})} />
        <input type="number" placeholder="Quantidade" required style={styles.input} onChange={e => setForm({...form, quantidade: e.target.value})} />
        <input type="date" required style={styles.input} onChange={e => setForm({...form, data: e.target.value})} />
        <textarea placeholder="Observações extras..." style={{...styles.input, height: '80px'}} onChange={e => setForm({...form, obs: e.target.value})} />
        <button type="submit" style={styles.button('#27ae60')}>Confirmar Entrada</button>
      </form>
    </div>
  );
};

// --- TELA: SAÍDA ---
const TelaSaida = () => {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ item_id: '', ticket: '', patrimonio: '', secretaria: '', quantidade: '' });

  useEffect(() => { api.get('/itens/').then(res => setItens(res.data)); }, []);

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/saidas/', { ...form, item_id: parseInt(form.item_id), quantidade: parseInt(form.quantidade) });
      alert("✅ Sucesso: Saída registrada!");
    } catch (err) { alert("❌ Erro: " + err.response?.data?.detail); }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ color: '#c0392b' }}>📤 Registrar Saída (Baixa)</h2>
      <form onSubmit={handleSalvar} style={{ display: 'grid', gap: '15px' }}>
        <select required style={styles.input} onChange={e => setForm({...form, item_id: e.target.value})}>
          <option value="">Selecione o produto...</option>
          {itens.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Ticket/Chamado" required style={styles.input} onChange={e => setForm({...form, ticket: e.target.value})} />
          <input type="text" placeholder="Patrimônio" required style={styles.input} onChange={e => setForm({...form, patrimonio: e.target.value})} />
        </div>
        <input type="text" placeholder="Secretaria Destino" required style={styles.input} onChange={e => setForm({...form, secretaria: e.target.value})} />
        <input type="number" placeholder="Quantidade" required style={styles.input} onChange={e => setForm({...form, quantidade: e.target.value})} />
        <button type="submit" style={styles.button('#c0392b')}>Confirmar Saída</button>
      </form>
    </div>
  );
};

// --- TELA: LOGS (HISTÓRICO) ---
const TelaLogs = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/logs/').then(res => setLogs(res.data)); }, []);

  return (
    <div style={styles.card}>
      <h2 style={{ color: '#2c3e50' }}>📜 Histórico de Movimentações</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>TIPO</th>
            <th style={styles.th}>ITEM</th>
            <th style={styles.th}>QTD</th>
            <th style={styles.th}>DATA</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx}>
              <td style={{...styles.td, fontWeight: 'bold', color: log.tipo === 'ENTRADA' ? '#27ae60' : '#c0392b' }}>
                {log.tipo === 'ENTRADA' ? '⬇ ENTRADA' : '⬆ SAÍDA'}
              </td>
              <td style={styles.td}>{log.item_nome}</td>
              <td style={styles.td}>{log.quantidade_movimentada}</td>
              <td style={styles.td}>{new Date(log.data).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={{ color: 'white', fontWeight: 'bold', marginRight: '30px', borderRight: '1px solid #555', paddingRight: '20px' }}>
            SISTEMA ESTOQUE v1.0
          </div>
          <Link to="/" style={styles.link}>📊 Dashboard</Link>
          <Link to="/entrada" style={styles.link}>📥 Entrada</Link>
          <Link to="/saida" style={styles.link}>📤 Saída</Link>
          <Link to="/logs" style={styles.link}>📜 Histórico</Link>
        </nav>

        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entrada" element={<TelaEntrada />} />
            <Route path="/saida" element={<TelaSaida />} />
            <Route path="/logs" element={<TelaLogs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}