import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ==========================================
// CONFIGURAÇÃO DA API E DO INTERCEPTOR
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
  container: { fontFamily: 'Segoe UI, sans-serif', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', minHeight: '100vh', margin: 0, paddingBottom: '30px' },
  nav: { backgroundColor: 'rgba(44, 62, 80, 0.85)', backdropFilter: 'blur(10px)', padding: '15px 30px', display: 'flex', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100, alignItems: 'center' },
  link: { color: '#ecf0f1', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', padding: '5px 10px' },
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
// COMPONENTE LOGIN
// ==========================================
const TelaLogin = ({ setLogado }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      const response = await api.post('/login', params);
      localStorage.setItem('token', response.data.access_token);
      setLogado(true);
    } catch (err) { setErro('Usuário ou senha incorretos.'); }
  };

  return (
    <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div style={styles.modalContent}>
        <h2 style={{ textAlign: 'center', color: '#3498db' }}>🔐 ERP ESTOQUE</h2>
        {erro && <div style={{ background: '#e74c3c', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>{erro}</div>}
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} required style={styles.inputDark} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required style={styles.inputDark} />
          <button type="submit" style={{...styles.button('#3498db'), width: '100%'}}>ENTRAR</button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// TELA CONFIGURAÇÕES (GESTÃO DE USUÁRIOS)
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

  const alterarSenha = async (e) => {
    e.preventDefault();
    try {
      await api.put('/usuarios/senha', { senha_antiga: senhaAntiga, senha_nova: senhaNova });
      alert("✅ Senha alterada!");
      setSenhaAntiga(''); setSenhaNova('');
    } catch (err) { alert("❌ Erro ao alterar senha"); }
  };

  const criarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios/', novoUser);
      alert("✅ Usuário criado!");
      setNovoUser({ username: '', senha: '', is_admin: false });
      carregarDados();
    } catch (err) { alert("❌ Erro ao criar usuário"); }
  };

  const deletarUser = async (id) => {
    if (window.confirm("Excluir usuário?")) {
      await api.delete(`/usuarios/${id}`);
      carregarDados();
    }
  };

  const handleAtualizarUser = async () => {
    try {
      await api.put(`/usuarios/${editandoUser.id}`, editandoUser);
      setModalUserAberto(false);
      carregarDados();
    } catch (err) { alert("❌ Erro ao atualizar"); }
  };

  return (
    <>
      <div style={styles.card}>
        <h2>⚙️ Configurações</h2>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3>🔑 Alterar Minha Senha</h3>
            <form onSubmit={alterarSenha} style={{ display: 'grid', gap: '10px' }}>
              <input type="password" placeholder="Senha Atual" value={senhaAntiga} required style={styles.input} onChange={e => setSenhaAntiga(e.target.value)} />
              <input type="password" placeholder="Nova Senha" value={senhaNova} required style={styles.input} onChange={e => setSenhaNova(e.target.value)} />
              <button type="submit" style={styles.button('#e67e22')}>Atualizar Senha</button>
            </form>
          </div>

          {usuarioAtual?.is_admin && (
            <div style={{ flex: 1, minWidth: '400px' }}>
              <h3>👑 Painel Admin</h3>
              <form onSubmit={criarUsuario} style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                <input type="text" placeholder="Nome" value={novoUser.username} required style={styles.input} onChange={e => setNovoUser({...novoUser, username: e.target.value})} />
                <input type="password" placeholder="Senha" value={novoUser.senha} required style={styles.input} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} />
                <label><input type="checkbox" checked={novoUser.is_admin} onChange={e => setNovoUser({...novoUser, is_admin: e.target.checked})} /> Administrador</label>
                <button type="submit" style={styles.button('#8e44ad')}>Criar Usuário</button>
              </form>
              <table style={styles.table}>
                <thead><tr><th>USUÁRIO</th><th>NÍVEL</th><th>AÇÕES</th></tr></thead>
                <tbody>
                  {listaUsuarios.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.is_admin ? 'Admin' : 'Padrão'}</td>
                      <td>
                        <button onClick={() => { setEditandoUser({...u, senha: ''}); setModalUserAberto(true); }} style={styles.button('#f39c12')}>Editar</button>
                        {u.id !== usuarioAtual.id && <button onClick={() => deletarUser(u.id)} style={styles.button('#e74c3c')}>Excluir</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalUserAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Editar Usuário</h3>
            <input type="text" value={editandoUser.username} style={styles.inputDark} onChange={e => setEditandoUser({...editandoUser, username: e.target.value})} />
            <input type="password" placeholder="Nova senha (opcional)" style={styles.inputDark} onChange={e => setEditandoUser({...editandoUser, senha: e.target.value})} />
            <label><input type="checkbox" checked={editandoUser.is_admin} disabled={editandoUser.id === usuarioAtual.id} onChange={e => setEditandoUser({...editandoUser, is_admin: e.target.checked})} /> Admin</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleAtualizarUser} style={styles.button('#2ecc71')}>Salvar</button>
              <button onClick={() => setModalUserAberto(false)} style={styles.button('#e74c3c')}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================
// DEMAIS TELAS (RESUMIDAS)
// ==========================================
const Dashboard = () => {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState('');
  useEffect(() => { api.get('/itens/').then(res => setItens(res.data)); }, []);
  const filtrados = itens.filter(i => i.nome.toLowerCase().includes(filtro.toLowerCase()) || i.codigo.toLowerCase().includes(filtro.toLowerCase()));
  return (
    <div style={styles.card}>
      <h2>📊 Dashboard</h2>
      <input type="text" placeholder="🔍 Filtrar itens..." style={styles.input} value={filtro} onChange={e => setFiltro(e.target.value)} />
      <table style={styles.table}>
        <thead><tr><th>CÓDIGO</th><th>NOME</th><th>ESTOQUE</th></tr></thead>
        <tbody>
          {filtrados.map(i => (
            <tr key={i.id}><td>{i.codigo}</td><td>{i.nome}</td><td>{i.quantidade_atual} un</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TelaCadastro = () => {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ codigo: '', nome: '' });
  const carregar = () => api.get('/itens/').then(res => setItens(res.data));
  useEffect(() => { carregar(); }, []);
  const salvar = async (e) => { e.preventDefault(); await api.post('/itens/', form); setForm({codigo:'', nome:''}); carregar(); };
  return (
    <div style={styles.card}>
      <h2>➕ Cadastro de Itens</h2>
      <form onSubmit={salvar} style={{display:'flex', gap:'10px'}}>
        <input placeholder="Código" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} style={styles.input} />
        <input placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} style={styles.input} />
        <button type="submit" style={styles.button('#8e44ad')}>Salvar</button>
      </form>
      <table style={styles.table}>
        <tbody>{itens.map(i => <tr key={i.id}><td>{i.codigo}</td><td>{i.nome}</td></tr>)}</tbody>
      </table>
    </div>
  );
};

const TelaEntrada = () => {
  const [itens, setItens] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [form, setForm] = useState({ item_id: '', nfe: '', quantidade: '', data_entrega: '' });
  const carregar = () => { api.get('/itens/').then(res => setItens(res.data)); api.get('/entradas/').then(res => setEntradas(res.data)); };
  useEffect(() => { carregar(); }, []);
  const salvar = async (e) => { e.preventDefault(); await api.post('/entradas/', form); carregar(); };
  return (
    <div style={styles.card}>
      <h2>📥 Entradas</h2>
      <form onSubmit={salvar} style={{display:'grid', gap:'10px'}}>
        <select onChange={e => setForm({...form, item_id: e.target.value})} style={styles.input}>
          <option value="">Selecione...</option>
          {itens.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
        </select>
        <input placeholder="NFe" onChange={e => setForm({...form, nfe: e.target.value})} style={styles.input} />
        <input type="number" placeholder="Qtd" onChange={e => setForm({...form, quantidade: e.target.value})} style={styles.input} />
        <input type="date" onChange={e => setForm({...form, data_entrega: e.target.value})} style={styles.input} />
        <button type="submit" style={styles.button('#27ae60')}>Registrar</button>
      </form>
    </div>
  );
};

const TelaSaida = () => {
  const [itens, setItens] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [filtroMes, setFiltroMes] = useState('');
  const [form, setForm] = useState({ item_id: '', ticket: '', patrimonio: '', secretaria: '', quantidade: '' });
  const carregar = () => { api.get('/itens/').then(res => setItens(res.data)); api.get('/saidas/').then(res => setSaidas(res.data)); };
  useEffect(() => { carregar(); }, []);
  const filtradas = saidas.filter(s => filtroMes ? s.data_saida.startsWith(filtroMes) : true);
  return (
    <div style={styles.card}>
      <h2>📤 Saídas</h2>
      <input type="month" onChange={e => setFiltroMes(e.target.value)} style={styles.input} />
      <form onSubmit={async (e) => { e.preventDefault(); await api.post('/saidas/', form); carregar(); }} style={{display:'grid', gap:'10px', marginTop:'20px'}}>
        <select onChange={e => setForm({...form, item_id: e.target.value})} style={styles.input}>
          <option value="">Selecione...</option>
          {itens.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
        </select>
        <input placeholder="Secretaria" onChange={e => setForm({...form, secretaria: e.target.value})} style={styles.input} />
        <input type="number" placeholder="Qtd" onChange={e => setForm({...form, quantidade: e.target.value})} style={styles.input} />
        <button type="submit" style={styles.button('#c0392b')}>Registrar</button>
      </form>
      <table style={styles.table}>
        <thead><tr><th>DATA</th><th>TICKET</th><th>SECRETARIA</th><th>QTD</th></tr></thead>
        <tbody>{filtradas.map(s => <tr key={s.id}><td>{new Date(s.data_saida).toLocaleDateString()}</td><td>{s.ticket}</td><td>{s.secretaria}</td><td>{s.quantidade}</td></tr>)}</tbody>
      </table>
    </div>
  );
};

const TelaLogs = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/logs/').then(res => setLogs(res.data)); }, []);
  return (
    <div style={styles.card}>
      <h2>📜 Histórico</h2>
      <table style={styles.table}>
        <thead><tr><th>TIPO</th><th>ITEM</th><th>QTD</th><th>DATA</th></tr></thead>
        <tbody>{logs.map(l => <tr key={l.id}><td>{l.tipo}</td><td>{l.item_nome}</td><td>{l.quantidade_movimentada}</td><td>{new Date(l.data).toLocaleString()}</td></tr>)}</tbody>
      </table>
    </div>
  );
};

// ==========================================
// ESTRUTURA PRINCIPAL
// ==========================================
export default function App() {
  const [logado, setLogado] = useState(!!localStorage.getItem('token'));
  const handleLogout = () => { localStorage.removeItem('token'); setLogado(false); };
  if (!logado) return <TelaLogin setLogado={setLogado} />;
  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={{ color: 'white', fontWeight: 'bold' }}>ERP v3.0</div>
          <Link to="/" style={styles.link}>📊 Dash</Link>
          <Link to="/cadastro" style={styles.link}>➕ Cadastro</Link>
          <Link to="/entrada" style={styles.link}>📥 Entrada</Link>
          <Link to="/saida" style={styles.link}>📤 Saída</Link>
          <Link to="/logs" style={styles.link}>📜 Histórico</Link>
          <Link to="/configuracoes" style={{...styles.link, color: '#f1c40f'}}>⚙️ Configs</Link>
          <button onClick={handleLogout} style={{...styles.button('#e74c3c'), marginLeft: 'auto'}}>Sair</button>
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