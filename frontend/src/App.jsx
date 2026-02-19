import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ==========================================
// CONFIGURAÇÃO DA API E DO "PORTEIRO" (INTERCEPTOR)
// ==========================================
const api = axios.create({ baseURL: 'http://localhost:8000' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
});

// ==========================================
// ESTILOS: TEMA GLASSMORPHISM E GRADIENTE
// ==========================================
const styles = {
  container: { fontFamily: 'Segoe UI, sans-serif', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', minHeight: '100vh', margin: 0, paddingBottom: '30px' },
  nav: { backgroundColor: 'rgba(44, 62, 80, 0.85)', backdropFilter: 'blur(10px)', padding: '15px 30px', display: 'flex', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100, alignItems: 'center' },
  link: { color: '#ecf0f1', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', padding: '5px 10px', borderRadius: '5px' },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.5)', maxWidth: '1100px', margin: '30px auto' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccd1d1', backgroundColor: 'rgba(255,255,255,0.9)', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  button: (color) => ({ backgroundColor: color, color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }),
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '8px', overflow: 'hidden' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #bdc3c7', color: '#2c3e50', backgroundColor: 'rgba(236, 240, 241, 0.8)' },
  td: { padding: '12px', borderBottom: '1px solid #ecf0f1', color: '#34495e' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 },
  modalContent: { background: 'linear-gradient(145deg, #1e272e, #2c3e50)', padding: '30px', borderRadius: '15px', width: '450px', color: 'white', boxShadow: '0 15px 50px rgba(0,0,0,0.5)', border: '1px solid #465c71' },
  inputDark: { padding: '12px', borderRadius: '5px', border: '1px solid #7f8c8d', backgroundColor: '#34495e', color: 'white', fontSize: '14px', width: '100%', boxSizing: 'border-box', marginBottom: '15px' }
};

// ==========================================
// TELA DE LOGIN (BLOQUEIO)
// ==========================================
const TelaLogin = ({ setLogado }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // O FastAPI exige que o login seja enviado como formulário (URLSearchParams)
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post('/login', params);
      localStorage.setItem('token', response.data.access_token);
      setLogado(true);
    } catch (err) {
      setErro('Usuário ou senha incorretos.');
    }
  };

  return (
    <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{...styles.modalContent, boxShadow: '0 20px 60px rgba(0,0,0,0.4)'}}>
        <h2 style={{ textAlign: 'center', color: '#3498db', marginBottom: '30px' }}>🔐 ERP ESTOQUE</h2>
        {erro && <div style={{ backgroundColor: '#e74c3c', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>{erro}</div>}
        <form onSubmit={handleLogin}>
          <label style={{ fontSize: '12px', color: '#bdc3c7' }}>USUÁRIO</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={styles.inputDark} placeholder="Digite seu usuário..." />
          <label style={{ fontSize: '12px', color: '#bdc3c7' }}>SENHA</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.inputDark} placeholder="Digite sua senha..." />
          <button type="submit" style={{...styles.button('#3498db'), width: '100%', marginTop: '15px', padding: '15px'}}>ENTRAR</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// TELA DE CONFIGURAÇÕES (USUÁRIOS E SENHAS)
// ==========================================
const TelaConfiguracoes = () => {
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  
  const [novoUser, setNovoUser] = useState({ username: '', senha: '', is_admin: false });

  const alterarSenha = async (e) => {
    e.preventDefault();
    try {
      await api.put('/usuarios/senha', { senha_antiga: senhaAntiga, senha_nova: senhaNova });
      alert("✅ Senha alterada com sucesso!");
      setSenhaAntiga(''); setSenhaNova('');
    } catch (err) { alert("❌ Erro: " + err.response?.data?.detail); }
  };

  const criarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios/', novoUser);
      alert("✅ Usuário criado com sucesso!");
      setNovoUser({ username: '', senha: '', is_admin: false });
    } catch (err) { alert("❌ Erro: " + err.response?.data?.detail); }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>⚙️ Configurações de Acesso</h2>
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* BLOCO 1: ALTERAR SENHA (Para qualquer usuário logado) */}
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#e67e22', marginTop: 0 }}>🔑 Alterar Minha Senha</h3>
          <form onSubmit={alterarSenha} style={{ display: 'grid', gap: '10px' }}>
            <input type="password" placeholder="Senha Atual" value={senhaAntiga} required style={styles.input} onChange={e => setSenhaAntiga(e.target.value)} />
            <input type="password" placeholder="Nova Senha" value={senhaNova} required style={styles.input} onChange={e => setSenhaNova(e.target.value)} />
            <button type="submit" style={styles.button('#e67e22')}>Atualizar Senha</button>
          </form>
        </div>

        {/* BLOCO 2: CRIAR NOVO USUÁRIO (Apenas Admin) */}
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ color: '#9b59b6', marginTop: 0 }}>👤 Criar Novo Usuário (Apenas Admin)</h3>
          <form onSubmit={criarUsuario} style={{ display: 'grid', gap: '10px' }}>
            <input type="text" placeholder="Nome de Usuário (Login)" value={novoUser.username} required style={styles.input} onChange={e => setNovoUser({...novoUser, username: e.target.value})} />
            <input type="password" placeholder="Senha Temporária" value={novoUser.senha} required style={styles.input} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#2c3e50', padding: '10px 0' }}>
              <input type="checkbox" checked={novoUser.is_admin} onChange={e => setNovoUser({...novoUser, is_admin: e.target.checked})} />
              Este usuário é um Administrador (Pode criar outros)
            </label>
            <button type="submit" style={styles.button('#9b59b6')}>Registrar Usuário</button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TELAS DO SISTEMA (DASHBOARD, CADASTRO, ENTRADA, SAÍDA, LOGS)
// Manti o código das suas telas exatamente como estavam no passo anterior!
// ==========================================

const TelaCadastro = () => {
  // ... (Cole aqui o conteúdo da sua TelaCadastro do código anterior)
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ codigo: '', nome: '' });
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);

  const carregarItens = () => api.get('/itens/').then(res => setItens(res.data));
  useEffect(() => { carregarItens(); }, []);

  const handleSalvar = async (e) => { e.preventDefault(); try { await api.post('/itens/', form); alert("✅ Cadastrado!"); setForm({ codigo: '', nome: '' }); carregarItens(); } catch (err) { alert("❌ Erro: " + err.response?.data?.detail); } };
  const handleExcluir = async (id) => { if(window.confirm("Excluir item permanentemente?")) { await api.delete(`/itens/${id}`); carregarItens(); } };
  const handleAtualizar = async () => { try { await api.put(`/itens/${editando.id}`, { codigo: editando.codigo, nome: editando.nome }); setModalAberto(false); carregarItens(); } catch (err) { alert("❌ Erro ao atualizar"); } };

  return (
    <>
      <div style={styles.card}>
        <h2 style={{ color: '#8e44ad', marginTop: 0 }}>➕ Gestão de Produtos</h2>
        <form onSubmit={handleSalvar} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <input type="text" placeholder="Código (Ex: TEC-001)" value={form.codigo} required style={styles.input} onChange={e => setForm({...form, codigo: e.target.value})} />
          <input type="text" placeholder="Nome do Produto" value={form.nome} required style={styles.input} onChange={e => setForm({...form, nome: e.target.value})} />
          <button type="submit" style={styles.button('#8e44ad')}>Cadastrar</button>
        </form>
        <hr style={{ border: '1px solid rgba(0,0,0,0.1)' }} />
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>CÓDIGO</th><th style={styles.th}>NOME</th><th style={styles.th}>AÇÕES</th></tr></thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.id}><td style={styles.td}><strong>{i.codigo}</strong></td><td style={styles.td}>{i.nome}</td>
                <td style={styles.td}>
                  <button onClick={() => { setEditando(i); setModalAberto(true); }} style={{...styles.button('#f39c12'), padding: '6px 12px', marginRight: '5px'}}>Editar</button>
                  <button onClick={() => handleExcluir(i.id)} style={{...styles.button('#e74c3c'), padding: '6px 12px'}}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>⚙️ Editar Produto</h3>
            <label style={{ fontSize: '12px', color: '#bdc3c7' }}>CÓDIGO</label>
            <input type="text" value={editando.codigo} style={styles.inputDark} onChange={e => setEditando({...editando, codigo: e.target.value})} />
            <label style={{ fontSize: '12px', color: '#bdc3c7' }}>NOME</label>
            <input type="text" value={editando.nome} style={styles.inputDark} onChange={e => setEditando({...editando, nome: e.target.value})} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}><button onClick={handleAtualizar} style={{...styles.button('#2ecc71'), flex: 1}}>Salvar</button><button onClick={() => setModalAberto(false)} style={{...styles.button('#e74c3c'), flex: 1}}>Cancelar</button></div>
          </div>
        </div>
      )}
    </>
  );
};

const TelaEntrada = () => {
  // ... (Cole aqui o conteúdo da sua TelaEntrada do código anterior)
  const [itens, setItens] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [form, setForm] = useState({ item_id: '', nfe: '', quantidade: '', data: '', obs: '' });
  const [filtroNfe, setFiltroNfe] = useState(''); const [filtroCodigo, setFiltroCodigo] = useState(''); const [filtroData, setFiltroData] = useState('');
  const [modalAberto, setModalAberto] = useState(false); const [editando, setEditando] = useState(null);

  const carregarDados = () => { api.get('/itens/').then(res => setItens(res.data)); api.get('/entradas/').then(res => setEntradas(res.data)); };
  useEffect(() => { carregarDados(); }, []);

  const handleSalvar = async (e) => { e.preventDefault(); try { await api.post('/entradas/', { item_id: parseInt(form.item_id), nfe: form.nfe, quantidade: parseInt(form.quantidade), data_entrega: `${form.data}T10:00:00`, observacao: form.obs }); alert("✅ Entrada registrada!"); carregarDados(); } catch (err) { alert("❌ Erro: " + err.response?.data?.detail); } };
  const handleExcluir = async (id) => { if(window.confirm("Excluir entrada?")) { await api.delete(`/entradas/${id}`); carregarDados(); } };
  const handleAtualizar = async () => { try { await api.put(`/entradas/${editando.id}`, { item_id: editando.item_id, nfe: editando.nfe, quantidade: parseInt(editando.quantidade), data_entrega: editando.data_entrega, observacao: editando.observacao }); setModalAberto(false); carregarDados(); } catch (err) { alert("❌ Erro ao atualizar"); } };

  const entradasFiltradas = entradas.filter(e => {
    const item = itens.find(i => i.id === e.item_id);
    const matchNfe = e.nfe.toLowerCase().includes(filtroNfe.toLowerCase());
    const matchCodigo = item ? item.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()) : false;
    const matchData = filtroData ? e.data_entrega.startsWith(filtroData) : true;
    return matchNfe && (filtroCodigo === '' || matchCodigo) && matchData;
  });

  return (
    <>
      <div style={styles.card}>
        <h2 style={{ color: '#27ae60' }}>📥 Registrar Entrada</h2>
        <form onSubmit={handleSalvar} style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
          <select required style={styles.input} onChange={e => setForm({...form, item_id: e.target.value})}><option value="">Selecione o produto...</option>{itens.map(i => <option key={i.id} value={i.id}>{i.codigo} - {i.nome}</option>)}</select>
          <div style={{ display: 'flex', gap: '10px' }}><input type="text" placeholder="NF-e" required style={styles.input} onChange={e => setForm({...form, nfe: e.target.value})} /><input type="number" placeholder="Quantidade" required style={styles.input} onChange={e => setForm({...form, quantidade: e.target.value})} /><input type="date" required style={styles.input} onChange={e => setForm({...form, data: e.target.value})} /></div>
          <button type="submit" style={styles.button('#27ae60')}>Confirmar Entrada</button>
        </form>
        <hr style={{ border: '1px solid rgba(0,0,0,0.1)' }} />
        <h3 style={{ color: '#7f8c8d' }}>📋 Filtros de Busca</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input type="text" placeholder="🔍 Filtrar por NF-e..." style={styles.input} value={filtroNfe} onChange={e => setFiltroNfe(e.target.value)} />
          <input type="text" placeholder="🔍 Filtrar por Código..." style={styles.input} value={filtroCodigo} onChange={e => setFiltroCodigo(e.target.value)} />
          <input type="date" style={styles.input} value={filtroData} onChange={e => setFiltroData(e.target.value)} />
          <button onClick={() => { setFiltroNfe(''); setFiltroCodigo(''); setFiltroData(''); }} style={styles.button('#95a5a6')}>Limpar</button>
        </div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>DATA</th><th style={styles.th}>NF-e</th><th style={styles.th}>CÓDIGO</th><th style={styles.th}>ITEM</th><th style={styles.th}>QTD</th><th style={styles.th}>AÇÕES</th></tr></thead>
          <tbody>
            {entradasFiltradas.map(e => {
              const item = itens.find(i => i.id === e.item_id);
              return (
                <tr key={e.id}><td style={styles.td}>{new Date(e.data_entrega).toLocaleDateString()}</td><td style={styles.td}><strong>{e.nfe}</strong></td><td style={styles.td}>{item?.codigo}</td><td style={styles.td}>{item?.nome}</td><td style={styles.td}>{e.quantidade}</td><td style={styles.td}><button onClick={() => { setEditando({...e, data_entrega: e.data_entrega.split('T')[0]}); setModalAberto(true); }} style={{...styles.button('#f39c12'), padding: '6px 12px', marginRight: '5px'}}>Editar</button><button onClick={() => handleExcluir(e.id)} style={{...styles.button('#e74c3c'), padding: '6px 12px'}}>Excluir</button></td></tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>⚙️ Editar Entrada</h3>
            <label style={{ fontSize: '12px', color: '#bdc3c7' }}>NÚMERO NF-E</label><input type="text" value={editando.nfe} style={styles.inputDark} onChange={e => setEditando({...editando, nfe: e.target.value})} />
            <label style={{ fontSize: '12px', color: '#bdc3c7' }}>QUANTIDADE</label><input type="number" value={editando.quantidade} style={styles.inputDark} onChange={e => setEditando({...editando, quantidade: e.target.value})} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}><button onClick={handleAtualizar} style={{...styles.button('#2ecc71'), flex: 1}}>Salvar</button><button onClick={() => setModalAberto(false)} style={{...styles.button('#e74c3c'), flex: 1}}>Cancelar</button></div>
          </div>
        </div>
      )}
    </>
  );
};

const TelaSaida = () => {
  // ... (Cole aqui o conteúdo da sua TelaSaida do código anterior)
  const [itens, setItens] = useState([]); const [saidas, setSaidas] = useState([]);
  const [form, setForm] = useState({ item_id: '', ticket: '', patrimonio: '', secretaria: '', quantidade: '' });
  const [filtroMes, setFiltroMes] = useState(''); const [filtroData, setFiltroData] = useState(''); const [filtroGeral, setFiltroGeral] = useState('');
  const [modalAberto, setModalAberto] = useState(false); const [editando, setEditando] = useState(null);

  const carregarDados = () => { api.get('/itens/').then(res => setItens(res.data)); api.get('/saidas/').then(res => setSaidas(res.data)); };
  useEffect(() => { carregarDados(); }, []);

  const handleSalvar = async (e) => { e.preventDefault(); try { await api.post('/saidas/', { ...form, item_id: parseInt(form.item_id), quantidade: parseInt(form.quantidade) }); alert("✅ Saída registrada!"); carregarDados(); } catch (err) { alert("❌ Erro: " + err.response?.data?.detail); } };
  const handleExcluir = async (id) => { if(window.confirm("Excluir saída?")) { await api.delete(`/saidas/${id}`); carregarDados(); } };
  const handleAtualizar = async () => { try { await api.put(`/saidas/${editando.id}`, { item_id: editando.item_id, ticket: editando.ticket, patrimonio: editando.patrimonio, secretaria: editando.secretaria, quantidade: parseInt(editando.quantidade) }); setModalAberto(false); carregarDados(); } catch (err) { alert("❌ Erro ao atualizar"); } };

  const saidasFiltradas = saidas.filter(s => {
    const item = itens.find(i => i.id === s.item_id);
    const texto = filtroGeral.toLowerCase();
    const matchTexto = s.ticket.toLowerCase().includes(texto) || s.patrimonio.toLowerCase().includes(texto) || s.secretaria.toLowerCase().includes(texto) || (item && item.codigo.toLowerCase().includes(texto));
    const dataObj = new Date(s.data_saida);
    const mesFormatado = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, '0')}`;
    const diaFormatado = s.data_saida.split('T')[0];
    const matchMes = filtroMes ? mesFormatado === filtroMes : true;
    const matchDia = filtroData ? diaFormatado === filtroData : true;
    return matchTexto && matchMes && matchDia;
  });

  return (
    <>
      <div style={styles.card}>
        <h2 style={{ color: '#c0392b' }}>📤 Registrar Saída</h2>
        <form onSubmit={handleSalvar} style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
          <select required style={styles.input} onChange={e => setForm({...form, item_id: e.target.value})}><option value="">Selecione o produto...</option>{itens.map(i => <option key={i.id} value={i.id}>{i.codigo} - {i.nome} (Estoque: {i.quantidade_atual})</option>)}</select>
          <div style={{ display: 'flex', gap: '10px' }}><input type="text" placeholder="Ticket" required style={styles.input} onChange={e => setForm({...form, ticket: e.target.value})} /><input type="text" placeholder="Máquina/Patrimônio" required style={styles.input} onChange={e => setForm({...form, patrimonio: e.target.value})} /></div>
          <div style={{ display: 'flex', gap: '10px' }}><input type="text" placeholder="Secretaria de Destino" required style={styles.input} onChange={e => setForm({...form, secretaria: e.target.value})} /><input type="number" placeholder="Qtd" required style={styles.input} onChange={e => setForm({...form, quantidade: e.target.value})} /></div>
          <button type="submit" style={styles.button('#c0392b')}>Confirmar Saída</button>
        </form>
        <hr style={{ border: '1px solid rgba(0,0,0,0.1)' }} />
        <h3 style={{ color: '#7f8c8d' }}>📋 Calendário e Filtros</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input type="month" style={styles.input} value={filtroMes} onChange={e => { setFiltroMes(e.target.value); setFiltroData(''); }} />
          <span style={{ padding: '10px', color: '#7f8c8d' }}>OU</span>
          <input type="date" style={styles.input} value={filtroData} onChange={e => { setFiltroData(e.target.value); setFiltroMes(''); }} />
          <input type="text" placeholder="🔍 Ticket, Setor..." style={styles.input} value={filtroGeral} onChange={e => setFiltroGeral(e.target.value)} />
          <button onClick={() => { setFiltroMes(''); setFiltroData(''); setFiltroGeral(''); }} style={styles.button('#95a5a6')}>Limpar</button>
        </div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>DATA</th><th style={styles.th}>TICKET</th><th style={styles.th}>SECRETARIA</th><th style={styles.th}>MÁQUINA</th><th style={styles.th}>CÓDIGO</th><th style={styles.th}>QTD</th><th style={styles.th}>AÇÕES</th></tr></thead>
          <tbody>
            {saidasFiltradas.map(s => {
              const item = itens.find(i => i.id === s.item_id);
              return (
                <tr key={s.id}><td style={styles.td}>{new Date(s.data_saida).toLocaleDateString()}</td><td style={styles.td}><strong>{s.ticket}</strong></td><td style={styles.td}>{s.secretaria}</td><td style={styles.td}>{s.patrimonio}</td><td style={styles.td}>{item?.codigo}</td><td style={styles.td}>{s.quantidade}</td><td style={styles.td}><button onClick={() => { setEditando(s); setModalAberto(true); }} style={{...styles.button('#f39c12'), padding: '6px 12px', marginRight: '5px'}}>Editar</button><button onClick={() => handleExcluir(s.id)} style={{...styles.button('#e74c3c'), padding: '6px 12px'}}>Excluir</button></td></tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>⚙️ Editar Saída</h3>
            <label style={{ fontSize: '12px', color: '#bdc3c7' }}>TICKET</label><input type="text" value={editando.ticket} style={styles.inputDark} onChange={e => setEditando({...editando, ticket: e.target.value})} />
            <label style={{ fontSize: '12px', color: '#bdc3c7' }}>QUANTIDADE</label><input type="number" value={editando.quantidade} style={styles.inputDark} onChange={e => setEditando({...editando, quantidade: e.target.value})} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}><button onClick={handleAtualizar} style={{...styles.button('#2ecc71'), flex: 1}}>Salvar</button><button onClick={() => setModalAberto(false)} style={{...styles.button('#e74c3c'), flex: 1}}>Cancelar</button></div>
          </div>
        </div>
      )}
    </>
  );
};

const Dashboard = () => {
  // ... (Cole aqui o conteúdo da sua Dashboard do código anterior)
  const [itens, setItens] = useState([]); const [dadosGrafico, setDadosGrafico] = useState([]); const [filtro, setFiltro] = useState('');
  useEffect(() => {
    api.get('/itens/').then(res => setItens(res.data));
    api.get('/logs/').then(res => {
      const mesAtual = new Date().getMonth();
      const saidasMes = res.data.filter(log => log.tipo === 'SAÍDA' && new Date(log.data).getMonth() === mesAtual);
      const contagem = {}; saidasMes.forEach(s => contagem[s.item_nome] = (contagem[s.item_nome] || 0) + s.quantidade_movimentada);
      setDadosGrafico(Object.keys(contagem).map(nome => ({ nome, quantidade: contagem[nome] })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 10));
    });
  }, []);
  const itensFiltrados = itens.filter(i => i.codigo.toLowerCase().includes(filtro.toLowerCase()) || i.nome.toLowerCase().includes(filtro.toLowerCase()));
  return (
    <div style={styles.card}>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>📊 Dashboard de Estoque</h2>
      <h3 style={{ color: '#7f8c8d' }}>Top 10 Saídas do Mês</h3>
      <div style={{ width: '100%', height: 300, marginBottom: '40px' }}><ResponsiveContainer><BarChart data={dadosGrafico}><XAxis dataKey="nome" tick={{fontSize: 12}} /><YAxis /><Tooltip /><Bar dataKey="quantidade" fill="#3498db" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ color: '#7f8c8d' }}>Estoque Atual</h3><input type="text" placeholder="🔍 Filtrar por Código ou Nome..." style={{...styles.input, width: '300px'}} value={filtro} onChange={e => setFiltro(e.target.value)} /></div>
      <table style={styles.table}><thead><tr><th style={styles.th}>CÓDIGO</th><th style={styles.th}>ITEM</th><th style={styles.th}>DISPONÍVEL</th></tr></thead><tbody>{itensFiltrados.map(i => (<tr key={i.id}><td style={styles.td}><strong>{i.codigo}</strong></td><td style={styles.td}>{i.nome}</td><td style={styles.td}><span style={{ backgroundColor: i.quantidade_atual > 5 ? '#e1f7e1' : '#fce4e4', padding: '4px 8px', borderRadius: '4px', color: i.quantidade_atual > 5 ? '#27ae60' : '#c0392b' }}>{i.quantidade_atual} un</span></td></tr>))}</tbody></table>
    </div>
  );
};

const TelaLogs = () => {
  // ... (Cole aqui o conteúdo da sua TelaLogs do código anterior)
  const [logs, setLogs] = useState([]); const [itens, setItens] = useState([]); const [saidas, setSaidas] = useState([]);
  useEffect(() => { api.get('/logs/').then(res => setLogs(res.data)); api.get('/itens/').then(res => setItens(res.data)); api.get('/saidas/').then(res => setSaidas(res.data)); }, []);
  return (
    <div style={styles.card}>
      <h2 style={{ color: '#2c3e50' }}>📜 Histórico Geral</h2>
      <table style={styles.table}><thead><tr><th style={styles.th}>DATA</th><th style={styles.th}>TIPO</th><th style={styles.th}>CÓDIGO</th><th style={styles.th}>ITEM</th><th style={styles.th}>SECRETARIA</th><th style={styles.th}>QTD</th></tr></thead><tbody>{logs.map((log, idx) => {const item = itens.find(i => i.nome === log.item_nome); const saidaRelacionada = saidas.find(s => log.tipo === 'SAÍDA' && s.quantidade === log.quantidade_movimentada && new Date(s.data_saida).getDate() === new Date(log.data).getDate()); return (<tr key={idx}><td style={styles.td}>{new Date(log.data).toLocaleString()}</td><td style={{...styles.td, fontWeight: 'bold', color: log.tipo.includes('ENTRADA') ? '#27ae60' : '#c0392b' }}>{log.tipo}</td><td style={styles.td}>{item ? item.codigo : '-'}</td><td style={styles.td}>{log.item_nome}</td><td style={styles.td}>{saidaRelacionada ? saidaRelacionada.secretaria : (log.tipo.includes('ENTRADA') ? 'N/A' : '-')}</td><td style={styles.td}>{log.quantidade_movimentada}</td></tr>)})}</tbody></table>
    </div>
  );
};

// ==========================================
// ESTRUTURA PRINCIPAL (GERENCIADOR DE ROTAS E LOGIN)
// ==========================================
export default function App() {
  const [logado, setLogado] = useState(!!localStorage.getItem('token'));

  // Função para fazer Logout (Limpa o Token e bloqueia a tela)
  const handleLogout = () => {
    localStorage.removeItem('token');
    setLogado(false);
  };

  if (!logado) {
    return <TelaLogin setLogado={setLogado} />;
  }

  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={{ color: 'white', fontWeight: 'bold', marginRight: '10px', borderRight: '1px solid rgba(255,255,255,0.3)', paddingRight: '20px' }}>
            ERP ESTOQUE v3.0
          </div>
          <Link to="/" style={styles.link}>📊 Dashboard</Link>
          <Link to="/cadastro" style={styles.link}>➕ Cadastro</Link>
          <Link to="/entrada" style={styles.link}>📥 Entrada</Link>
          <Link to="/saida" style={styles.link}>📤 Saída</Link>
          <Link to="/logs" style={styles.link}>📜 Histórico</Link>
          <Link to="/configuracoes" style={{...styles.link, color: '#f1c40f'}}>⚙️ Configs</Link>
          
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={handleLogout} style={{...styles.button('#e74c3c'), padding: '6px 15px', fontSize: '12px'}}>Sair do Sistema</button>
          </div>
        </nav>
        
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cadastro" element={<TelaCadastro />} />
            <Route path="/entrada" element={<TelaEntrada />} />
            <Route path="/saida" element={<TelaSaida />} />
            <Route path="/logs" element={<TelaLogs />} />
            <Route path="/configuracoes" element={<TelaConfiguracoes />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}