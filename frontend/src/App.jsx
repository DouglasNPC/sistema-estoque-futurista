import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ==========================================
// CONFIGURAÇÃO DA API E INTERCEPTOR
// ==========================================
const api = axios.create({ baseURL: 'http://localhost:8000' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
});

// ==========================================
// ESTILOS: TEMA GLASSMORPHISM
// ==========================================
const styles = {
  container: { fontFamily: 'Segoe UI, sans-serif', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', minHeight: '100vh', paddingBottom: '30px' },
  nav: { backgroundColor: 'rgba(44, 62, 80, 0.85)', backdropFilter: 'blur(10px)', padding: '15px 30px', display: 'flex', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100, alignItems: 'center' },
  link: { color: '#ecf0f1', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', maxWidth: '1100px', margin: '30px auto' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccd1d1', width: '100%', boxSizing: 'border-box', fontSize: '14px', marginBottom: '5px' },
  label: { fontSize: '11px', fontWeight: 'bold', color: '#2c3e50', display: 'block', marginBottom: '3px' },
  button: (color) => ({ backgroundColor: color, color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }),
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '13px' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #bdc3c7', color: '#2c3e50', backgroundColor: 'rgba(236, 240, 241, 0.8)' },
  td: { padding: '12px', borderBottom: '1px solid #ecf0f1', color: '#34495e' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modalContent: { background: 'linear-gradient(145deg, #1e272e, #2c3e50)', padding: '30px', borderRadius: '15px', width: '450px', color: 'white' },
  inputDark: { padding: '12px', borderRadius: '5px', border: '1px solid #7f8c8d', backgroundColor: '#34495e', color: 'white', width: '100%', marginBottom: '15px' }
};

// ==========================================
// TELA DASHBOARD
// ==========================================
const Dashboard = () => {
  const [itens, setItens] = useState([]);
  useEffect(() => { api.get('/itens/').then(res => setItens(res.data)); }, []);
  const dadosGrafico = [...itens].sort((a, b) => b.quantidade_atual - a.quantidade_atual).slice(0, 5);

  return (
    <div style={styles.card}>
      <h2>📊 Dashboard</h2>
      <div style={{ height: 250, marginBottom: '30px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantidade_atual" fill="#3498db" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table style={styles.table}>
        <thead><tr><th>CÓDIGO</th><th>NOME</th><th>ESTOQUE</th></tr></thead>
        <tbody>
          {itens.map(i => (
            <tr key={i.id}>
              <td style={styles.td}>{i.codigo}</td>
              <td style={styles.td}>{i.nome}</td>
              <td style={{ ...styles.td, fontWeight: 'bold', color: i.quantidade_atual < 5 ? '#e74c3c' : '#2c3e50' }}>
                {i.quantidade_atual} un {i.quantidade_atual < 5 && '⚠️'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// TELA CADASTRO MELHORADA
// ==========================================
const TelaCadastro = () => {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ codigo: '', nome: '' });
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);

  const carregar = () => api.get('/itens/').then(res => setItens(res.data));
  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/itens/', form);
      setForm({ codigo: '', nome: '' });
      carregar();
    } catch (err) { alert("Erro ao cadastrar."); }
  };

  const deletar = async (id) => {
    if (window.confirm("⚠️ Excluir este item?")) {
      try { await api.delete(`/itens/${id}`); carregar(); } catch (err) { alert("Erro ao excluir."); }
    }
  };

  const filtrar = itens.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()) || i.codigo.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div style={styles.card}>
      <h2>➕ Cadastro de Itens ({itens.length})</h2>
      <form onSubmit={salvar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="Código" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} style={styles.input} required />
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} style={styles.input} required />
        <button type="submit" style={styles.button('#8e44ad')}>SALVAR</button>
      </form>
      <input placeholder="🔍 Filtrar lista..." value={busca} onChange={e => setBusca(e.target.value)} style={styles.input} />
      <table style={styles.table}>
        <thead><tr><th>CÓDIGO</th><th>NOME</th><th style={{textAlign:'center'}}>AÇÕES</th></tr></thead>
        <tbody>
          {filtrar.map(i => (
            <tr key={i.id}>
              <td style={styles.td}>{i.codigo}</td>
              <td style={styles.td}>{i.nome}</td>
              <td style={{textAlign:'center'}}>
                <button onClick={() => setEditando(i)} style={{...styles.button('#f39c12'), padding:'4px 8px', marginRight:'5px'}}>EDITAR</button>
                <button onClick={() => deletar(i.id)} style={{...styles.button('#e74c3c'), padding:'4px 8px'}}>EXCLUIR</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editando && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Editar Item</h3>
            <input value={editando.codigo} onChange={e => setEditando({...editando, codigo: e.target.value})} style={styles.inputDark} />
            <input value={editando.nome} onChange={e => setEditando({...editando, nome: e.target.value})} style={styles.inputDark} />
            <button onClick={async () => { await api.put(`/itens/${editando.id}`, editando); setEditando(null); carregar(); }} style={styles.button('#2ecc71')}>SALVAR</button>
            <button onClick={() => setEditando(null)} style={{...styles.button('#95a5a6'), marginLeft:'10px'}}>CANCELAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// TELA ENTRADA (BUSCA BIDIRECIONAL)
// ==========================================
const TelaEntrada = () => {
  const [itens, setItens] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [form, setForm] = useState({ item_id: '', nfe: '', quantidade: '', data_entrega: '' });

  const carregar = async () => {
    const [resI, resE] = await Promise.all([api.get('/itens/'), api.get('/entradas/')]);
    setItens(resI.data); setEntradas(resE.data || []);
  };
  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    const itemSel = itens.find(i => i.id == form.item_id);
    const payload = { item_id: Number(form.item_id), codigo: itemSel?.codigo, nfe: form.nfe, quantidade: Number(form.quantidade), data_entrega: form.data_entrega };
    await api.post('/entradas/', payload);
    setForm({ item_id: '', nfe: '', quantidade: '', data_entrega: '' });
    carregar();
  };

  return (
    <div style={styles.card}>
      <h2>📥 Entrada de Materiais</h2>
      <form onSubmit={salvar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div>
          <label style={styles.label}>BUSCAR POR CÓDIGO:</label>
          <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} style={styles.input} required>
            <option value="">Cód...</option>
            {itens.map(i => <option key={i.id} value={i.id}>{i.codigo}</option>)}
          </select>
        </div>
        <div>
          <label style={styles.label}>BUSCAR POR NOME:</label>
          <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} style={styles.input} required>
            <option value="">Nome...</option>
            {itens.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </div>
        <input placeholder="Nota Fiscal (NFe)" value={form.nfe} onChange={e => setForm({ ...form, nfe: e.target.value })} style={{...styles.input, gridColumn: 'span 2'}} required />
        <input type="number" placeholder="Quantidade" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} style={styles.input} required />
        <input type="date" value={form.data_entrega} onChange={e => setForm({ ...form, data_entrega: e.target.value })} style={styles.input} required />
        <button type="submit" style={{ ...styles.button('#27ae60'), gridColumn: 'span 2' }}>REGISTRAR ENTRADA</button>
      </form>
      <table style={styles.table}>
        <thead><tr><th>CÓDIGO</th><th>NFe</th><th>ITEM</th><th>QTD</th><th>DATA</th></tr></thead>
        <tbody>
          {entradas.map(ent => (
            <tr key={ent.id}>
              <td style={styles.td}>{itens.find(it => it.id == ent.item_id)?.codigo}</td>
              <td style={styles.td}>{ent.nfe}</td>
              <td style={styles.td}>{itens.find(it => it.id == ent.item_id)?.nome}</td>
              <td style={{ ...styles.td, color: '#27ae60', fontWeight: 'bold' }}>+{ent.quantidade}</td>
              <td style={styles.td}>{new Date(ent.data_entrega).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// TELA SAÍDA
// ==========================================
const TelaSaida = () => {
  const [itens, setItens] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [form, setForm] = useState({ item_id: '', quantidade: '', patrimonio: '', secretaria: '', ticket: '' });

  const carregar = async () => {
    try {
      const [resI, resS] = await Promise.all([api.get('/itens/'), api.get('/saidas/')]);
      setItens(resI.data); 
      setSaidas(resS.data);
    } catch (error) {
      console.error("Erro ao carregar dados da Tela de Saída:", error);
      // Se der erro nas Saídas, tenta carregar pelo menos os Itens para não travar a tela
      api.get('/itens/').then(res => setItens(res.data)).catch(e => console.error(e));
    }
  };
  
  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/saidas/', { ...form, item_id: Number(form.item_id), quantidade: Number(form.quantidade) });
      setForm({ item_id: '', quantidade: '', patrimonio: '', secretaria: '', ticket: '' });
      carregar();
      alert("✅ Saída registrada com sucesso!");
    } catch (err) {
      alert("❌ " + (err.response?.data?.detail || "Erro ao registrar saída."));
    }
  };

  // 🪄 FILTRO MÁGICO: Pega apenas os itens que têm estoque maior que zero
  const itensComEstoque = itens.filter(i => i.quantidade_atual > 0);

  return (
    <div style={styles.card}>
      <h2>📤 Saídas</h2>
      <form onSubmit={salvar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        
        {/* Dropdown atualizado com Filtro e Quantidade Visível */}
        <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} style={{...styles.input, gridColumn: 'span 2'}} required>
          <option value="">Cód ou Nome...</option>
          {itensComEstoque.map(i => (
            <option key={i.id} value={i.id}>
              {i.codigo} - {i.nome} (Disponível: {i.quantidade_atual})
            </option>
          ))}
        </select>

        <input type="number" placeholder="Quantidade" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} style={styles.input} required />
        <input placeholder="Patrimônio" value={form.patrimonio} onChange={e => setForm({ ...form, patrimonio: e.target.value })} style={styles.input} required />
        <input placeholder="Secretaria" value={form.secretaria} onChange={e => setForm({ ...form, secretaria: e.target.value })} style={styles.input} required />
        <input placeholder="Ticket" value={form.ticket} onChange={e => setForm({ ...form, ticket: e.target.value })} style={styles.input} />
        <button type="submit" style={{ ...styles.button('#c0392b'), gridColumn: 'span 2' }}>REGISTRAR SAÍDA</button>
      </form>
      
      <table style={styles.table}>
        <thead><tr><th>DATA</th><th>PATRIMÔNIO</th><th>ITEM</th><th>DESTINO</th><th>QTD</th></tr></thead>
        <tbody>
          {saidas.map(s => (
            <tr key={s.id}>
              <td style={styles.td}>{new Date(s.data_saida).toLocaleDateString()}</td>
              <td style={styles.td}>{s.patrimonio}</td>
              <td style={styles.td}>{itens.find(i => i.id == s.item_id)?.nome || "Item excluído"}</td>
              <td style={styles.td}>{s.secretaria}</td>
              <td style={{ ...styles.td, color: '#c0392b', fontWeight: 'bold' }}>-{s.quantidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// TELA CONFIGURAÇÕES E USUÁRIOS
// ==========================================
const TelaConfiguracoes = () => {
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [novoUser, setNovoUser] = useState({ username: '', senha: '', is_admin: false });
  const [modalUserAberto, setModalUserAberto] = useState(false);
  const [editandoUser, setEditandoUser] = useState(null);

  const carregarDados = async () => {
    try {
      const resMe = await api.get('/usuarios/me');
      setUsuarioAtual(resMe.data);
      if (resMe.data.is_admin) {
        const resLista = await api.get('/usuarios/lista');
        setListaUsuarios(resLista.data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { carregarDados(); }, []);

  // 1. Alterar a própria senha
  const alterarSenha = async (e) => {
    e.preventDefault();
    try {
      await api.put('/usuarios/senha', { senha_antiga: senhaAntiga, senha_nova: senhaNova });
      alert("✅ Senha alterada!");
      setSenhaAntiga(''); setSenhaNova('');
    } catch (err) { alert("❌ Erro"); }
  };

  // 2. Criar novo usuário (Apenas Admin)
  const criarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios/', novoUser);
      alert("✅ Usuário criado com sucesso!");
      setNovoUser({ username: '', senha: '', is_admin: false });
      carregarDados();
    } catch (err) { alert("❌ Erro ao criar usuário."); }
  };

  // 3. Salvar edição do usuário (Modal)
  const salvarEdicao = async () => {
    try {
      // Cria o pacote de dados. Só envia a senha se o admin digitou uma nova.
      const payload = { username: editandoUser.username, is_admin: editandoUser.is_admin };
      if (editandoUser.senha) { payload.senha = editandoUser.senha; }

      await api.put(`/usuarios/${editandoUser.id}`, payload);
      alert("✅ Usuário atualizado!");
      setModalUserAberto(false);
      carregarDados();
    } catch (err) { alert("❌ Erro ao editar usuário."); }
  };

  // 4. Excluir usuário
  const deletarUser = async (id) => {
    if (id === usuarioAtual.id) return alert("⚠️ Você não pode excluir a si mesmo!");
    if (window.confirm("Tem certeza que deseja excluir este usuário permanentemente?")) {
      try {
        await api.delete(`/usuarios/${id}`);
        carregarDados();
      } catch (err) { alert("❌ Erro ao excluir."); }
    }
  };

return (
    <div style={styles.card}>
      <h2>⚙️ Configurações</h2>
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Lado Esquerdo: Minha Conta */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>🔑 Minha Conta</h3>
          <form onSubmit={alterarSenha} style={{ display: 'grid', gap: '10px', marginBottom: '30px' }}>
            <input type="password" placeholder="Senha Atual" value={senhaAntiga} required style={styles.input} onChange={e => setSenhaAntiga(e.target.value)} />
            <input type="password" placeholder="Nova Senha" value={senhaNova} required style={styles.input} onChange={e => setSenhaNova(e.target.value)} />
            <button type="submit" style={styles.button('#e67e22')}>Atualizar Senha</button>
          </form>

          {/* Criação de Usuário embute aqui embaixo se for Admin */}
          {usuarioAtual?.is_admin && (
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: '1px solid #dcdde1' }}>
              <h4 style={{ marginTop: 0 }}>➕ Novo Usuário</h4>
              <form onSubmit={criarUsuario} style={{ display: 'grid', gap: '10px' }}>
                <input placeholder="Nome de usuário" value={novoUser.username} onChange={e => setNovoUser({...novoUser, username: e.target.value})} style={styles.input} required />
                <input type="password" placeholder="Senha provisória" value={novoUser.senha} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} style={styles.input} required />
                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={novoUser.is_admin} onChange={e => setNovoUser({...novoUser, is_admin: e.target.checked})} />
                  Conceder acesso de Administrador
                </label>
                <button type="submit" style={styles.button('#2ecc71')}>Criar Usuário</button>
              </form>
            </div>
          )}
        </div>

        {/* Lado Direito: Lista de Usuários */}
        {usuarioAtual?.is_admin && (
          <div style={{ flex: 2, minWidth: '400px' }}>
            <h3>👑 Admin: Gerenciar Usuários</h3>
            <table style={styles.table}>
              <thead><tr><th>USUÁRIO</th><th>NÍVEL</th><th style={{textAlign: 'center'}}>AÇÕES</th></tr></thead>
              <tbody>
                {listaUsuarios.map(u => (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.username}</td>
                    <td style={styles.td}>{u.is_admin ? 'Admin 👑' : 'Padrão'}</td>
                    <td style={{ textAlign: 'center' }}>
                       <button onClick={() => { setEditandoUser({...u, senha:''}); setModalUserAberto(true); }} style={{...styles.button('#f39c12'), padding:'4px 8px', marginRight: '5px'}}>EDITAR</button>
                       <button onClick={() => deletarUser(u.id)} style={{...styles.button('#e74c3c'), padding:'4px 8px'}}>EXCLUIR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO DE USUÁRIO */}
      {modalUserAberto && editandoUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Editar Perfil: {editandoUser.username}</h3>
            
            <label style={styles.label}>Nome de Usuário</label>
            <input value={editandoUser.username} onChange={e => setEditandoUser({...editandoUser, username: e.target.value})} style={styles.inputDark} />
            
            <label style={styles.label}>Nova Senha (deixe em branco para manter)</label>
            <input type="password" placeholder="***" value={editandoUser.senha} onChange={e => setEditandoUser({...editandoUser, senha: e.target.value})} style={styles.inputDark} />
            
            <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '20px' }}>
              <input type="checkbox" checked={editandoUser.is_admin} onChange={e => setEditandoUser({...editandoUser, is_admin: e.target.checked})} style={{ width: '18px', height: '18px' }} />
              Acesso Administrativo
            </label>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalUserAberto(false)} style={styles.button('#95a5a6')}>CANCELAR</button>
              <button onClick={salvarEdicao} style={styles.button('#2ecc71')}>SALVAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// TELA HISTÓRICO (LOGS)
// ==========================================
const TelaLogs = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/logs/').then(res => setLogs(res.data)); }, []);
  return (
    <div style={styles.card}>
      <h2>📜 Histórico Geral</h2>
      <table style={styles.table}>
        <thead><tr><th>DATA</th><th>TIPO</th><th>ITEM</th><th>QTD</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td style={styles.td}>{new Date(l.data).toLocaleString()}</td>
              <td style={styles.td}>
                <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: l.tipo === 'ENTRADA' ? '#d4edda' : '#f8d7da', color: l.tipo === 'ENTRADA' ? '#155724' : '#721c24' }}>{l.tipo}</span>
              </td>
              <td style={styles.td}>{l.item_nome}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{l.tipo === 'ENTRADA' ? `+${l.quantidade_movimentada}` : `-${l.quantidade_movimentada}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// TELA DE LOGIN
// ==========================================
const TelaLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await api.post('/login', formData);
      localStorage.setItem('token', res.data.access_token);
      onLogin(); 
    } catch (err) {
      alert('❌ Usuário ou senha incorretos!');
    }
  };

  return (
    <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ ...styles.card, width: '350px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>📦 ERP Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            placeholder="Usuário (ex: admin)" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            style={styles.input} 
            required 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={styles.input} 
            required 
          />
          <button type="submit" style={{ ...styles.button('#2980b9'), marginTop: '10px' }}>
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// ESTRUTURA PRINCIPAL
// ==========================================
export default function App() {
  const [logado, setLogado] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (logado) {
      api.get('/usuarios/me').then(res => setIsAdmin(res.data.is_admin)).catch(() => setLogado(false));
    }
  }, [logado]);

  if (!logado) return <TelaLogin onLogin={() => { setLogado(true); window.location.reload(); }} />;

  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', marginRight: '10px' }}>📦 ERP</div>
          <Link to="/" style={styles.link}>📊 Dash</Link>
          {isAdmin && <Link to="/cadastro" style={styles.link}>➕ Cadastro</Link>}
          <Link to="/entrada" style={styles.link}>📥 Entrada</Link>
          <Link to="/saida" style={styles.link}>📤 Saída</Link>
          <Link to="/logs" style={styles.link}>📜 Histórico</Link>
          <Link to="/config" style={styles.link}>⚙️ Config</Link>
          <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} style={{ ...styles.button('#e74c3c'), marginLeft: 'auto', padding: '5px 10px', fontSize: '12px' }}>SAIR</button>
        </nav>
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {isAdmin && <Route path="/cadastro" element={<TelaCadastro />} />}
            <Route path="/entrada" element={<TelaEntrada />} />
            <Route path="/saida" element={<TelaSaida />} />
            <Route path="/logs" element={<TelaLogs />} />
            <Route path="/config" element={<TelaConfiguracoes />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}