import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================
const api = axios.create({ baseURL: `http://${window.location.hostname}:8000` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==========================================
// ANIMAÇÕES E ESTILOS CSS INJETADOS
// ==========================================
const globalStyles = `
  * { box-sizing: border-box; transition: all 0.2s ease-in-out; }
  body { margin: 0; font-family: 'Inter', 'Segoe UI', sans-serif; background: #f4f7f6; color: #333; }
  .fade-in { animation: fadeIn 0.4s ease-in-out; }
  .slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .glass-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07); border-radius: 16px; padding: 25px; }
  .table-hover tbody tr:hover { background-color: #f1f2f6; transform: scale(1.01); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .btn:active { transform: scale(0.95); }
  .sidebar-link:hover { background: rgba(255,255,255,0.1); border-radius: 8px; }
  
  /* Estilos herdados da versão anterior para compatibilidade da TelaConfiguracoes */
  .legacy-input { padding: 10px; border-radius: 5px; border: 1px solid #ccd1d1; width: 100%; box-sizing: border-box; font-size: 14px; margin-bottom: 5px; }
  .legacy-input-dark { padding: 12px; border-radius: 5px; border: 1px solid #7f8c8d; background-color: #34495e; color: white; width: 100%; margin-bottom: 15px; }
  .legacy-btn { border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; color: white; }
  .legacy-td { padding: 12px; border-bottom: 1px solid #ecf0f1; color: #34495e; }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(4px); }
  .modal-content { background: linear-gradient(145deg, #1e272e, #2c3e50); padding: 30px; border-radius: 15px; width: 450px; color: white; }
`;

// ==========================================
// COMPONENTES DE LAYOUT (Sidebar e Topbar)
// ==========================================
const Layout = ({ children, isAdmin, onLogout, usuarioAtual }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    ...(isAdmin ? [{ path: '/cadastro', icon: '➕', label: 'Cadastro' }] : []),
    { path: '/entrada', icon: '📥', label: 'Entradas' },
    { path: '/saida', icon: '📤', label: 'Saídas' },
    { path: '/logs', icon: '🛡️', label: 'Auditoria LGPD' },
    { path: '/config', icon: '⚙️', label: 'Configurações' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <style>{globalStyles}</style>

      {/* SIDEBAR */}
      <div style={{ 
        width: isSidebarOpen ? '250px' : '80px', 
        background: 'linear-gradient(180deg, #1e272e 0%, #2c3e50 100%)',
        color: 'white', display: 'flex', flexDirection: 'column', padding: '20px 10px',
        boxShadow: '4px 0 15px rgba(0,0,0,0.1)', zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', marginBottom: '40px', padding: '0 10px' }}>
          {isSidebarOpen && <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '1px' }}>📦 Nexus ERP</h2>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {menuItems.map(item => (
            <Link key={item.path} to={item.path} className="sidebar-link" style={{ 
              display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', 
              color: location.pathname === item.path ? '#3498db' : '#ecf0f1', textDecoration: 'none', 
              fontWeight: location.pathname === item.path ? 'bold' : 'normal',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center'
            }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* TOPBAR */}
        <header style={{ 
          height: '70px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 90 
        }}>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
            {menuItems.find(i => i.path === location.pathname)?.label || 'Sistema'}
          </div>

          {/* PERFIL DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <div onClick={() => setDropdownOpen(!dropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px 10px', borderRadius: '30px', background: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <span style={{ fontSize: '24px' }}>{usuarioAtual?.foto || '🧑‍💼'}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{usuarioAtual?.nome_completo || usuarioAtual?.username || 'Usuário'}</span>
                <span style={{ fontSize: '11px', color: '#7f8c8d' }}>{usuarioAtual?.funcao || (usuarioAtual?.is_admin ? 'Administrador' : 'Padrão')}</span>
              </div>
              <span style={{ fontSize: '10px', marginLeft: '5px' }}>▼</span>
            </div>

            {dropdownOpen && (
              <div className="fade-in" style={{ position: 'absolute', top: '55px', right: 0, background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '200px', overflow: 'hidden' }}>
                <Link to="/perfil" onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '12px 20px', textDecoration: 'none', color: '#2c3e50', borderBottom: '1px solid #f1f2f6' }}>👤 Editar Perfil</Link>
                <div onClick={() => { onLogout(); setDropdownOpen(false); }} style={{ display: 'block', padding: '12px 20px', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Sair do Sistema</div>
              </div>
            )}
          </div>
        </header>

        {/* PAGES */}
        <main style={{ padding: '30px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// TELAS DO SISTEMA
// ==========================================

const Dashboard = () => {
  const [itens, setItens] = useState([]);
  useEffect(() => { 
    api.get('/itens/').then(res => setItens(res.data)); 
  }, []);

  const itensCriticos = itens.filter(i => i.quantidade_atual < 5);
  const totalPecas = itens.reduce((acc, curr) => acc + curr.quantidade_atual, 0);
  const dadosGrafico = [...itens]
    .sort((a, b) => b.quantidade_atual - a.quantidade_atual)
    .slice(0, 10);

  const statCard = (titulo, valor, cor, icone) => (
    <div className="glass-card slide-up" style={{ 
      flex: 1, display: 'flex', alignItems: 'center', gap: '12px', 
      borderLeft: `4px solid ${cor}`, padding: '15px' 
    }}>
      <div style={{ fontSize: '24px', background: `${cor}20`, padding: '10px', borderRadius: '8px' }}>{icone}</div>
      <div>
        <div style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase' }}>{titulo}</div>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#2c3e50' }}>{valor}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* Cards Menores */}
      <div style={{ display: 'flex', gap: '15px' }}>
        {statCard('Estoque Crítico (< 5)', itensCriticos.length, '#e74c3c', '⚠️')}
        {statCard('Total Peças em Estoque', totalPecas, '#2ecc71', '🔢')}
      </div>

      {/* Lista de Alerta Compacta */}
      {itensCriticos.length > 0 && (
        <div className="glass-card slide-up" style={{ 
          padding: '12px 20px', border: '1px solid #fab1a0', background: 'rgba(255, 234, 230, 0.4)' 
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#d63031', fontSize: '13px' }}>🚨 Códigos em Alerta:</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {itensCriticos.map(item => (
              <span key={item.id} style={{ 
                background: '#d63031', color: 'white', padding: '3px 10px', 
                borderRadius: '15px', fontSize: '11px', fontWeight: 'bold' 
              }}>
                {item.codigo} ({item.quantidade_atual})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico de Colunas Reduzido */}
      <div className="glass-card slide-up" style={{ padding: '20px', animationDelay: '0.1s' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '14px' }}>📊 Maiores Estoques</h3>
        <div style={{ height: 220 }}> {/* Altura reduzida de 350 para 220 */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="codigo" 
                axisLine={false} 
                tickLine={false} 
                style={{ fontSize: '10px' }}
              />
              <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px' }} />
              <Tooltip 
                cursor={{ fill: '#f8f9fa' }}
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none' }}
              />
              <Bar dataKey="quantidade_atual" fill="#3498db" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const TelaPerfil = ({ usuarioAtual, onUpdate }) => {
  const [form, setForm] = useState({ email: '', nome_completo: '', funcao: '', foto: '🧑‍💼' });
  const avatares = ['🧑‍💼', '👩‍💼', '🧑‍💻', '👩‍💻', '🥷', '🦸‍♂️', '🦸‍♀️', '🤖', '👽'];

  useEffect(() => {
    if (usuarioAtual) setForm({ email: usuarioAtual.email || '', nome_completo: usuarioAtual.nome_completo || '', funcao: usuarioAtual.funcao || '', foto: usuarioAtual.foto || '🧑‍💼' });
  }, [usuarioAtual]);

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.put('/usuarios/perfil', form);
      alert('✅ Perfil atualizado com sucesso!');
      onUpdate();
    } catch (err) { alert('❌ Erro ao atualizar perfil.'); }
  };

  return (
    <div className="glass-card slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>👤 Meu Perfil</h2>
      <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>{form.foto}</div>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {avatares.map(a => (
              <span key={a} onClick={() => setForm({...form, foto: a})} style={{ fontSize: '24px', cursor: 'pointer', padding: '5px', border: form.foto === a ? '2px solid #3498db' : '2px solid transparent', borderRadius: '50%' }}>{a}</span>
            ))}
          </div>
        </div>

        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>NOME COMPLETO</label>
        <input value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Ex: João da Silva" />
        
        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>E-MAIL</label>
        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Ex: joao@empresa.com" />
        
        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>FUNÇÃO / CARGO</label>
        <input value={form.funcao} onChange={e => setForm({...form, funcao: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Ex: Analista de TI" />

        <button className="btn" type="submit" style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>SALVAR PERFIL</button>
      </form>
    </div>
  );
};

const TelaCadastro = () => {
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState({ codigo: '', nome: '' });
  const [busca, setBusca] = useState('');
  
  // Estados para Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoItem, setEditandoItem] = useState(null);

  const carregar = () => api.get('/itens/').then(res => {
    const dadosOrdenados = res.data.sort((a, b) => a.codigo.localeCompare(b.codigo));
    setItens(dadosOrdenados);
  });
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
      try { await api.delete(`/itens/${id}`); carregar(); } catch (err) { alert("Erro."); }
    }
  };

  const abrirEdicao = (item) => {
    setEditandoItem({ ...item });
    setModalAberto(true);
  };

  const salvarEdicao = async () => {
    try {
      await api.put(`/itens/${editandoItem.id}`, { 
        codigo: editandoItem.codigo, 
        nome: editandoItem.nome 
      });
      setModalAberto(false);
      carregar();
      alert("✅ Item atualizado!");
    } catch (err) { alert("❌ Erro ao editar."); }
  };

  const filtrar = itens.filter(i => 
    i.nome.toLowerCase().includes(busca.toLowerCase()) || 
    i.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="glass-card slide-up">
      <h2 style={{ marginTop: 0 }}>➕ Banco de Materiais ({itens.length})</h2>
      
      {/* Formulário de Cadastro */}
      <form onSubmit={salvar} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '15px', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '10px' }}>
        <input placeholder="Código (SKU)" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} required />
        <input placeholder="Nome do Material" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} required />
        <button className="btn" type="submit" style={{ padding: '12px 25px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>CADASTRAR</button>
      </form>
      
      <input placeholder="🔍 Filtrar lista..." value={busca} onChange={e => setBusca(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }} />
      
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
        <table className="table-hover" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px' }}>CÓDIGO</th>
              <th>NOME DO MATERIAL</th>
              <th style={{textAlign:'center'}}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filtrar.map(i => (
              <tr key={i.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{i.codigo}</td>
                <td style={{ padding: '15px' }}>{i.nome}</td>
                <td style={{textAlign:'center', padding: '15px', display: 'flex', gap: '8px', justifyContent: 'center'}}>
                  <button onClick={() => abrirEdicao(i)} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>EDITAR</button>
                  <button onClick={() => deletar(i.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>EXCLUIR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <h3 style={{ marginTop: 0 }}>✏️ Editar Material</h3>
            <label style={{ fontSize: '12px', color: '#bdc3c7' }}>CÓDIGO</label>
            <input className="legacy-input-dark" value={editandoItem.codigo} onChange={e => setEditandoItem({...editandoItem, codigo: e.target.value})} />
            <label style={{ fontSize: '12px', color: '#bdc3c7' }}>NOME DO MATERIAL</label>
            <input className="legacy-input-dark" value={editandoItem.nome} onChange={e => setEditandoItem({...editandoItem, nome: e.target.value})} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setModalAberto(false)} className="legacy-btn" style={{ background: '#7f8c8d' }}>CANCELAR</button>
              <button onClick={salvarEdicao} className="legacy-btn" style={{ background: '#27ae60' }}>SALVAR ALTERAÇÕES</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TelaEntrada = () => {
  const [itens, setItens] = useState([]);
  const [entradas, setEntradas] = useState([]);
  
  const [nfeGlobal, setNfeGlobal] = useState('');
  const [dataGlobal, setDataGlobal] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ item_id: '', quantidade: '' });

  // Estados para Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoEntrada, setEditandoEntrada] = useState(null);

  const carregar = async () => {
    const [resI, resE] = await Promise.all([api.get('/itens/'), api.get('/entradas/')]);
    setItens(resI.data.sort((a, b) => a.codigo.localeCompare(b.codigo))); 
    setEntradas((resE.data || []).reverse());
  };
  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    // Validação extra via JS além do 'required' do HTML
    if (!nfeGlobal || !dataGlobal || !form.item_id || !form.quantidade) {
      return alert("⚠️ Todos os campos são obrigatórios!");
    }

    try {
      await api.post('/entradas/', { 
        item_id: Number(form.item_id), 
        nfe: nfeGlobal, 
        quantidade: Number(form.quantidade), 
        data_entrega: dataGlobal 
      });
      setForm({ item_id: '', quantidade: '' });
      carregar();
      alert(`✅ Lançado com sucesso na NFe: ${nfeGlobal}`);
    } catch(err) { alert("❌ Erro ao lançar entrada."); }
  };

  const deletarEntrada = async (id) => {
    if (window.confirm("⚠️ Excluir este registro de entrada? Isso não apagará o material do banco, apenas o histórico desta entrada.")) {
      try {
        await api.delete(`/entradas/${id}`);
        carregar();
      } catch (err) { alert("❌ Erro ao excluir entrada."); }
    }
  };

  const abrirEdicao = (ent) => {
    setEditandoEntrada({ ...ent });
    setModalAberto(true);
  };

  const salvarEdicao = async () => {
    try {
      await api.put(`/entradas/${editandoEntrada.id}`, {
        item_id: Number(editandoEntrada.item_id),
        nfe: editandoEntrada.nfe,
        quantidade: Number(editandoEntrada.quantidade),
        data_entrega: editandoEntrada.data_entrega
      });
      setModalAberto(false);
      carregar();
      alert("✅ Entrada atualizada!");
    } catch (err) { alert("❌ Erro ao editar entrada."); }
  };

  return (
    <div className="glass-card slide-up">
      <h2 style={{ marginTop: 0 }}>📥 Recebimento de Materiais</h2>
      
      <form onSubmit={salvar}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #f39c12' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#7f8c8d' }}>NÚMERO DA NFe *</label>
            <input required placeholder="Digite a NFe..." value={nfeGlobal} onChange={e => setNfeGlobal(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#7f8c8d' }}>DATA DE ENTREGA *</label>
            <input required type="date" value={dataGlobal} onChange={e => setDataGlobal(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr auto', gap: '15px', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '10px' }}>
          <select required value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="">Selecione o Produto... *</option>
            {itens.map(i => <option key={i.id} value={i.id}>{i.codigo} - {i.nome}</option>)}
          </select>
          <input required type="number" placeholder="Qtd *" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <button className="btn" type="submit" style={{ padding: '12px 25px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>LANÇAR</button>
        </div>
      </form>

      <table className="table-hover" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
        <thead style={{ background: '#f8f9fa' }}>
          <tr>
            <th style={{ padding: '15px' }}>DATA</th>
            <th>NFe</th>
            <th>PRODUTO</th>
            <th>QTD</th>
            <th style={{ textAlign: 'center' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {entradas.map(ent => (
            <tr key={ent.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px' }}>{new Date(ent.data_entrega).toLocaleDateString()}</td>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>{ent.nfe}</td>
              <td style={{ padding: '15px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{itens.find(it => it.id == ent.item_id)?.codigo}</div>
                <div style={{ fontSize: '11px', color: '#7f8c8d' }}>{itens.find(it => it.id == ent.item_id)?.nome}</div>
              </td>
              <td style={{ padding: '15px', color: '#27ae60', fontWeight: 'bold' }}>+{ent.quantidade}</td>
              <td style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                  <button onClick={() => abrirEdicao(ent)} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>EDITAR</button>
                  <button onClick={() => deletarEntrada(ent.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>EXCLUIR</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL DE EDIÇÃO DE ENTRADA */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '450px' }}>
            <h3 style={{ marginTop: 0 }}>✏️ Corrigir Entrada</h3>
            
            <label style={{ fontSize: '11px', color: '#bdc3c7' }}>NFe</label>
            <input className="legacy-input-dark" value={editandoEntrada.nfe} onChange={e => setEditandoEntrada({...editandoEntrada, nfe: e.target.value})} />
            
            <label style={{ fontSize: '11px', color: '#bdc3c7' }}>QUANTIDADE</label>
            <input type="number" className="legacy-input-dark" value={editandoEntrada.quantidade} onChange={e => setEditandoEntrada({...editandoEntrada, quantidade: e.target.value})} />
            
            <label style={{ fontSize: '11px', color: '#bdc3c7' }}>DATA</label>
            <input type="date" className="legacy-input-dark" value={editandoEntrada.data_entrega} onChange={e => setEditandoEntrada({...editandoEntrada, data_entrega: e.target.value})} />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={() => setModalAberto(false)} className="legacy-btn" style={{ background: '#7f8c8d' }}>CANCELAR</button>
              <button onClick={salvarEdicao} className="legacy-btn" style={{ background: '#27ae60' }}>SALVAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TelaSaida = () => {
  const [itens, setItens] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [form, setForm] = useState({ item_id: '', quantidade: '', patrimonio: '', secretaria: '', ticket: '' });

  const carregar = async () => {
    try {
      const [resI, resS] = await Promise.all([api.get('/itens/'), api.get('/saidas/')]);
      setItens(resI.data.sort((a, b) => a.codigo.localeCompare(b.codigo))); 
      setSaidas(resS.data);
    } catch (e) { api.get('/itens/').then(res => setItens(res.data)); }
  };
  useEffect(() => { carregar(); }, []);

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/saidas/', { ...form, item_id: Number(form.item_id), quantidade: Number(form.quantidade) });
      setForm({ item_id: '', quantidade: '', patrimonio: '', secretaria: '', ticket: '' });
      carregar(); alert("✅ Sucesso!");
    } catch (err) { alert("❌ Estoque insuficiente ou erro."); }
  };

  const itensComEstoque = itens.filter(i => i.quantidade_atual > 0);

  return (
    <div className="glass-card slide-up">
      <h2 style={{ marginTop: 0 }}>📤 Liberação de Patrimônio</h2>
      <form onSubmit={salvar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', background: '#fff', padding: '25px', borderRadius: '10px' }}>
        <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', gridColumn: 'span 2' }} required>
          <option value="">Selecione o Material Disponível...</option>
          {itensComEstoque.map(i => <option key={i.id} value={i.id}>{i.codigo} - {i.nome} (Estoque: {i.quantidade_atual})</option>)}
        </select>
        <input type="number" placeholder="Qtd a Retirar" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} required />
        <input placeholder="Nº do Patrimônio Vinculado" value={form.patrimonio} onChange={e => setForm({ ...form, patrimonio: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} required />
        <input placeholder="Secretaria / Destino" value={form.secretaria} onChange={e => setForm({ ...form, secretaria: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} required />
        <input placeholder="Nº do Ticket (Opcional)" value={form.ticket} onChange={e => setForm({ ...form, ticket: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
        <button className="btn" type="submit" style={{ padding: '15px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', gridColumn: 'span 2' }}>LIBERAR MATERIAL</button>
      </form>
      
      <table className="table-hover" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
        <thead style={{ background: '#f8f9fa' }}><tr><th style={{ padding: '15px' }}>DATA</th><th>PATRIMÔNIO</th><th>CÓDIGO & MATERIAL</th><th>DESTINO</th><th>QTD</th></tr></thead>
        <tbody>
          {saidas.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px' }}>{new Date(s.data_saida).toLocaleString()}</td>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>{s.patrimonio}</td>
              <td style={{ padding: '15px' }}>{itens.find(i => i.id == s.item_id) ? `[${itens.find(i => i.id == s.item_id).codigo}] ${itens.find(i => i.id == s.item_id).nome}` : 'Item excluído'}</td>
              <td style={{ padding: '15px', color: '#7f8c8d' }}>{s.secretaria}</td>
              <td style={{ padding: '15px', color: '#c0392b', fontWeight: 'bold', fontSize: '16px' }}>-{s.quantidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TelaLogs = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/logs/').then(res => setLogs(res.data.reverse())); }, []);
  return (
    <div className="glass-card slide-up">
      <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>🛡️ Auditoria do Sistema (LGPD)</h2>
      <p style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '20px' }}>Registro imutável de todas as transações realizadas no sistema, vinculado ao operador responsável.</p>
      <table className="table-hover" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
        <thead style={{ background: '#1e272e', color: 'white' }}><tr><th style={{ padding: '15px' }}>DATA/HORA (UTC)</th><th>OPERADOR</th><th>AÇÃO</th><th>MATERIAL ENVOLVIDO</th><th>RASTREIO (DETALHES)</th></tr></thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px 15px', fontFamily: 'monospace' }}>{new Date(l.data).toLocaleString()}</td>
              <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{l.usuario_nome || 'Sistema'}</td>
              <td style={{ padding: '12px 15px' }}>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: l.tipo === 'ENTRADA' ? '#d4edda' : '#f8d7da', color: l.tipo === 'ENTRADA' ? '#155724' : '#721c24' }}>{l.tipo} ({l.tipo === 'ENTRADA' ? '+' : '-'}{l.quantidade_movimentada})</span>
              </td>
              <td style={{ padding: '12px 15px', color: '#34495e' }}>{l.item_nome}</td>
              <td style={{ padding: '12px 15px', color: '#7f8c8d', fontStyle: 'italic' }}>{l.detalhes_auditoria || 'Nenhum detalhe adicional'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// TELA CONFIGURAÇÕES E USUÁRIOS (RESTAURADA)
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
    } catch (err) { alert("❌ Erro"); }
  };

  const criarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuarios/', novoUser);
      alert("✅ Usuário criado com sucesso!");
      setNovoUser({ username: '', senha: '', is_admin: false });
      carregarDados();
    } catch (err) { alert("❌ Erro ao criar usuário."); }
  };

  const salvarEdicao = async () => {
    try {
      const payload = { username: editandoUser.username, is_admin: editandoUser.is_admin };
      if (editandoUser.senha) { payload.senha = editandoUser.senha; }
      await api.put(`/usuarios/${editandoUser.id}`, payload);
      alert("✅ Usuário atualizado!");
      setModalUserAberto(false);
      carregarDados();
    } catch (err) { alert("❌ Erro ao editar usuário."); }
  };

  const deletarUser = async (id) => {
    if (id === usuarioAtual.id) return alert("⚠️ Você não pode excluir a si mesmo!");
    if (window.confirm("Tem certeza que deseja excluir este usuário permanentemente?")) {
      try { await api.delete(`/usuarios/${id}`); carregarDados(); } 
      catch (err) { alert("❌ Erro ao excluir."); }
    }
  };

  return (
    <div className="glass-card slide-up">
      <h2>⚙️ Configurações</h2>
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>🔑 Minha Conta</h3>
          <form onSubmit={alterarSenha} style={{ display: 'grid', gap: '10px', marginBottom: '30px' }}>
            <input type="password" placeholder="Senha Atual" value={senhaAntiga} required className="legacy-input" onChange={e => setSenhaAntiga(e.target.value)} />
            <input type="password" placeholder="Nova Senha" value={senhaNova} required className="legacy-input" onChange={e => setSenhaNova(e.target.value)} />
            <button type="submit" className="legacy-btn" style={{ background: '#e67e22' }}>Atualizar Senha</button>
          </form>

          {usuarioAtual?.is_admin && (
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: '1px solid #dcdde1' }}>
              <h4 style={{ marginTop: 0 }}>➕ Novo Usuário</h4>
              <form onSubmit={criarUsuario} style={{ display: 'grid', gap: '10px' }}>
                <input placeholder="Nome de usuário" value={novoUser.username} onChange={e => setNovoUser({...novoUser, username: e.target.value})} className="legacy-input" required />
                <input type="password" placeholder="Senha provisória" value={novoUser.senha} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} className="legacy-input" required />
                <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={novoUser.is_admin} onChange={e => setNovoUser({...novoUser, is_admin: e.target.checked})} />
                  Conceder acesso de Administrador
                </label>
                <button type="submit" className="legacy-btn" style={{ background: '#2ecc71' }}>Criar Usuário</button>
              </form>
            </div>
          )}
        </div>

        {usuarioAtual?.is_admin && (
          <div style={{ flex: 2, minWidth: '400px' }}>
            <h3>👑 Admin: Gerenciar Usuários</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '13px' }}>
              <thead><tr><th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #bdc3c7', color: '#2c3e50', backgroundColor: 'rgba(236, 240, 241, 0.8)' }}>USUÁRIO</th><th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #bdc3c7', color: '#2c3e50', backgroundColor: 'rgba(236, 240, 241, 0.8)' }}>NÍVEL</th><th style={{textAlign: 'center', padding: '12px', borderBottom: '2px solid #bdc3c7', color: '#2c3e50', backgroundColor: 'rgba(236, 240, 241, 0.8)'}}>AÇÕES</th></tr></thead>
              <tbody>
                {listaUsuarios.map(u => (
                  <tr key={u.id}>
                    <td className="legacy-td">{u.username}</td>
                    <td className="legacy-td">{u.is_admin ? 'Admin 👑' : 'Padrão'}</td>
                    <td style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #ecf0f1' }}>
                       <button onClick={() => { setEditandoUser({...u, senha:''}); setModalUserAberto(true); }} className="legacy-btn" style={{ background: '#f39c12', padding:'4px 8px', marginRight: '5px'}}>EDITAR</button>
                       <button onClick={() => deletarUser(u.id)} className="legacy-btn" style={{ background: '#e74c3c', padding:'4px 8px'}}>EXCLUIR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalUserAberto && editandoUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Perfil: {editandoUser.username}</h3>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#ecf0f1', display: 'block', marginBottom: '3px' }}>Nome de Usuário</label>
            <input value={editandoUser.username} onChange={e => setEditandoUser({...editandoUser, username: e.target.value})} className="legacy-input-dark" />
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#ecf0f1', display: 'block', marginBottom: '3px' }}>Nova Senha (deixe em branco para manter)</label>
            <input type="password" placeholder="***" value={editandoUser.senha} onChange={e => setEditandoUser({...editandoUser, senha: e.target.value})} className="legacy-input-dark" />
            <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '20px' }}>
              <input type="checkbox" checked={editandoUser.is_admin} onChange={e => setEditandoUser({...editandoUser, is_admin: e.target.checked})} style={{ width: '18px', height: '18px' }} />
              Acesso Administrativo
            </label>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalUserAberto(false)} className="legacy-btn" style={{ background: '#95a5a6' }}>CANCELAR</button>
              <button onClick={salvarEdicao} className="legacy-btn" style={{ background: '#2ecc71' }}>SALVAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// LOGIN E APP ROOT
// ==========================================
const TelaLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams(); formData.append('username', username); formData.append('password', password);
    try { const res = await api.post('/login', formData); localStorage.setItem('token', res.data.access_token); onLogin(); } 
    catch (err) { alert('❌ Usuário ou senha incorretos!'); }
  };
  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1e272e 0%, #2c3e50 100%)' }}>
      <style>{globalStyles}</style>
      <div className="glass-card slide-up" style={{ width: '380px', textAlign: 'center', padding: '40px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '5px', fontSize: '32px' }}>📦 Nexus ERP</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Gestão Integrada de Materiais</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input placeholder="Usuário Operacional" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }} required />
          <input type="password" placeholder="Senha de Acesso" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }} required />
          <button className="btn" type="submit" style={{ padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>ENTRAR NO SISTEMA</button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [logado, setLogado] = useState(!!localStorage.getItem('token'));
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  const fetchUser = () => {
    if (logado) api.get('/usuarios/me').then(res => setUsuarioAtual(res.data)).catch(() => setLogado(false));
  };
  useEffect(() => { fetchUser(); }, [logado]);

  if (!logado) return <TelaLogin onLogin={() => { setLogado(true); window.location.reload(); }} />;

  return (
    <Router>
      <Layout isAdmin={usuarioAtual?.is_admin} onLogout={() => { localStorage.removeItem('token'); setLogado(false); }} usuarioAtual={usuarioAtual}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {usuarioAtual?.is_admin && <Route path="/cadastro" element={<TelaCadastro />} />}
          <Route path="/entrada" element={<TelaEntrada />} />
          <Route path="/saida" element={<TelaSaida />} />
          <Route path="/logs" element={<TelaLogs />} />
          <Route path="/config" element={<TelaConfiguracoes />} />
          <Route path="/perfil" element={<TelaPerfil usuarioAtual={usuarioAtual} onUpdate={fetchUser} />} />
        </Routes>
      </Layout>
    </Router>
  );
}
