// import React, { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { UserPlus, ShieldAlert, Trash2, Loader2, Users as UsersIcon, Settings as SettingsIcon } from 'lucide-react';

// export function Settings({ user }) {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
  
//   const [nome, setNome] = useState('');
//   const [email, setEmail] = useState('');
//   const [matricula, setMatricula] = useState('');
//   const [nivel, setNivel] = useState('comum');

//   const isAdmin = user?.nivel === 'admin';

//   useEffect(() => {
//     if (isAdmin) {
//       buscarUsuarios();
//     } else {
//       setFetching(false);
//     }
//   }, [isAdmin]);

//   async function buscarUsuarios() {
//     setFetching(true);
//     const { data } = await supabase.from('usuarios').select('*').order('nome');
//     setUsers(data || []);
//     setFetching(false);
//   }

//   const handleCreateUser = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Lógica de criação (Auth + Public Table)
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email,
//       password: matricula,
//       options: { data: { nome, matricula } }
//     });

//     if (authError) {
//       alert("Erro: " + authError.message);
//     } else {
//       await supabase.from('usuarios').insert([{
//         id: authData.user.id,
//         nome, email, matricula, nivel
//       }]);
//       alert("Usuário criado!");
//       setNome(''); setEmail(''); setMatricula('');
//       buscarUsuarios();
//     }
//     setLoading(false);
//   };

//   const handleDeleteUser = async (userId, userName) => {
//     if (!window.confirm(`Tem certeza que deseja apagar o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
//       return;
//     }

//     setLoading(true);
    
//     // Deletar do banco de dados (usuarios)
//     const { error: dbError } = await supabase
//       .from('usuarios')
//       .delete()
//       .eq('id', userId);

//     if (dbError) {
//       alert("Erro ao deletar usuário: " + dbError.message);
//     } else {
//       // Deletar da autenticação
//       const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
//       if (authError) {
//         alert("Usuário deletado do banco mas houve erro na autenticação: " + authError.message);
//       } else {
//         alert("Usuário deletado com sucesso!");
//         buscarUsuarios();
//       }
//     }
    
//     setLoading(false);
//   };

//   const handleChangeUserLevel = async (userId, novoNivel) => {
//     if (!window.confirm(`Tem certeza que deseja alterar o nível de acesso para "${novoNivel.toUpperCase()}"?`)) {
//       return;
//     }

//     setLoading(true);
    
//     const { error } = await supabase
//       .from('usuarios')
//       .update({ nivel: novoNivel })
//       .eq('id', userId);

//     if (error) {
//       alert("Erro ao alterar nível: " + error.message);
//     } else {
//       alert("Nível de acesso alterado com sucesso!");
//       buscarUsuarios();
//     }
    
//     setLoading(false);
//   };

//   return (
//     <div className="space-y-8 animate-in fade-in duration-500">
//       <div>
//         <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
//         <p className="text-slate-500">Preferências da conta e gestão de acesso.</p>
//       </div>

//       {/* SEÇÃO 1: Preferências Gerais (Visível para TODOS) */}
//       <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//         <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
//           <SettingsIcon size={20} className="text-slate-400" /> Preferências de Exportação
//         </h3>
//         <div className="max-w-xs">
//           <label className="block text-sm font-medium text-slate-600 mb-2">Formato padrão de relatório</label>
//           <select 
//             className="w-full p-2 border rounded-lg bg-slate-50"
//             defaultValue={localStorage.getItem('agromanager_export_pref') || 'csv'}
//             onChange={(e) => localStorage.setItem('agromanager_export_pref', e.target.value)}
//           >
//             <option value="csv">CSV (Excel Simples)</option>
//             <option value="xlsx">Excel (.xlsx)</option>
//             <option value="pdf">PDF (Relatório)</option>
//           </select>
//         </div>
//       </section>

//       {/* SEÇÃO 2: Gestão de Usuários (APENAS PARA ADMIN) */}
//       {isAdmin ? (
//         <div className="space-y-8">
//           <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//             <div className="flex items-center gap-2 mb-6 text-blue-600">
//               <UserPlus size={22} />
//               <h3 className="text-lg font-bold text-slate-800">Cadastrar Novo Colaborador</h3>
//             </div>
//             <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
//               <input placeholder="Nome" required value={nome} onChange={e => setNome(e.target.value)} className="p-2 border rounded-lg bg-slate-50" />
//               <input placeholder="E-mail" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="p-2 border rounded-lg bg-slate-50" />
//               <input placeholder="Matrícula" required value={matricula} onChange={e => setMatricula(e.target.value)} className="p-2 border rounded-lg bg-slate-50" />
//               <div className="flex gap-2">
//                 <select value={nivel} onChange={e => setNivel(e.target.value)} className="flex-1 p-2 border rounded-lg bg-slate-50">
//                   <option value="comum">Comum</option>
//                   <option value="admin">Admin</option>
//                 </select>
//                 <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 rounded-lg font-bold">
//                   {loading ? '...' : 'SALVAR'}
//                 </button>
//               </div>
//             </form>
//           </section>

//           <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//             <div className="p-4 border-b bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
//               <UsersIcon size={18} /> Equipe Cadastrada
//             </div>
//             <table className="w-full text-left">
//               <tbody className="divide-y divide-slate-100">
//                 {users.map(u => (
//                   <tr key={u.id} className="hover:bg-slate-50 transition-colors">
//                     <td className="px-6 py-4 font-bold text-slate-700">{u.nome}</td>
//                     <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
//                     <td className="px-6 py-4">
//                       <select 
//                         value={u.nivel}
//                         onChange={(e) => handleChangeUserLevel(u.id, e.target.value)}
//                         disabled={loading}
//                         className={`px-3 py-1 rounded border font-bold text-[10px] uppercase cursor-pointer disabled:opacity-50 ${
//                           u.nivel === 'admin' 
//                             ? 'bg-red-50 border-red-200 text-red-600' 
//                             : 'bg-blue-50 border-blue-200 text-blue-600'
//                         }`}
//                       >
//                         <option value="comum">Comum</option>
//                         <option value="admin">Admin</option>
//                       </select>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button
//                         onClick={() => handleDeleteUser(u.id, u.nome)}
//                         disabled={loading}
//                         className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm disabled:opacity-50"
//                       >
//                         <Trash2 size={16} /> Deletar
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </section>
//         </div>
//       ) : (
//         /* MENSAGEM PARA USUÁRIO COMUM */
//         <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-4">
//           <ShieldAlert className="text-blue-500" size={32} />
//           <div>
//             <h4 className="font-bold text-blue-900">Gestão de Usuários Restrita</h4>
//             <p className="text-sm text-blue-700">Somente administradores podem gerenciar novos acessos.</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  UserPlus, ShieldAlert, Trash2, Loader2, 
  Users as UsersIcon, Settings as SettingsIcon, CheckCircle, AlertCircle 
} from 'lucide-react';

export function Settings({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Estados do formulário de cadastro
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [nivel, setNivel] = useState('comum');

  // Estados dos modais de confirmação
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [showLevelConfirm, setShowLevelConfirm] = useState(false);
  const [levelData, setLevelData] = useState(null);

  // Estados dos alertas
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' ou 'error'

  const isAdmin = user?.nivel === 'admin';

  useEffect(() => {
    if (isAdmin) {
      buscarUsuarios();
    } else {
      setFetching(false);
    }
  }, [isAdmin]);

  async function buscarUsuarios() {
    setFetching(true);
    const { data } = await supabase.from('usuarios').select('*').order('nome');
    setUsers(data || []);
    setFetching(false);
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Cria o login no Supabase Auth (Senha padrão = Matrícula)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: matricula,
      options: { 
        data: { nome, matricula },
        emailRedirectTo: `${window.location.origin}`
      }
    });

    if (authError) {
      setAlertMessage("Erro ao criar acesso: " + authError.message);
      setAlertType('error');
      setShowAlert(true);
    } else if (authData.user) {
      // 2. Cria o perfil na tabela pública vinculando o ID
      await supabase.from('usuarios').insert([{
        id: authData.user.id,
        nome, email, matricula, nivel
      }]);
      
      setAlertMessage("Usuário cadastrado com sucesso!");
      setAlertType('success');
      setShowAlert(true);
      setNome(''); setEmail(''); setMatricula(''); setNivel('comum');
      buscarUsuarios();
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId, userName) => {
    setDeleteData({ userId, userName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteData) return;
    setShowDeleteConfirm(false);
    setLoading(true);
    
    const { error } = await supabase.from('usuarios').delete().eq('id', deleteData.userId);

    if (error) {
      setAlertMessage("Erro ao excluir: " + error.message);
      setAlertType('error');
      setShowAlert(true);
    } else {
      setAlertMessage("Acesso removido.");
      setAlertType('success');
      setShowAlert(true);
      buscarUsuarios();
    }
    setLoading(false);
  };

  const handleChangeUserLevel = async (userId, novoNivel) => {
    setLevelData({ userId, novoNivel });
    setShowLevelConfirm(true);
  };

  const confirmChangeLevel = async () => {
    if (!levelData) return;
    setShowLevelConfirm(false);
    setLoading(true);
    const { error } = await supabase
      .from('usuarios')
      .update({ nivel: levelData.novoNivel })
      .eq('id', levelData.userId);

    if (error) {
      setAlertMessage("Erro: " + error.message);
      setAlertType('error');
      setShowAlert(true);
    } else {
      setAlertMessage("Nível de acesso alterado com sucesso!");
      setAlertType('success');
      setShowAlert(true);
      buscarUsuarios();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Configurações do Sistema</h2>
        <p className="text-slate-500 mt-1">Gerencie suas preferências e os acessos da equipe BOLETIM OC.</p>
      </div>

      {/* SEÇÃO 1: Preferências de Exportação (Visível para TODOS) */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6 text-slate-700">
          <SettingsIcon size={20} />
          <h3 className="text-lg font-bold">Preferências de Relatório</h3>
        </div>
        <div className="max-w-xs">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Formato de Exportação Padrão</label>
          <select 
            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-green-500 transition-all cursor-pointer"
            defaultValue={localStorage.getItem('agromanager_export_pref') || 'csv'}
            onChange={(e) => localStorage.setItem('agromanager_export_pref', e.target.value)}
          >
            <option value="csv">CSV (Texto separado por vírgula)</option>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="pdf">PDF Executivo</option>
          </select>
        </div>
      </section>

      {/* SEÇÃO 2: Gestão de Usuários (APENAS PARA ADMIN) */}
      {isAdmin ? (
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6 text-green-600">
              <UserPlus size={22} />
              <h3 className="text-lg font-bold text-slate-800">Cadastrar Novo Colaborador</h3>
            </div>
            
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nome Completo</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50" placeholder="Ex: João Silva" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">E-mail Corporativo</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50" placeholder="email@empresa.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Matrícula (Senha Inicial)</label>
                <input required value={matricula} onChange={e => setMatricula(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50" placeholder="123456" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Nível de Acesso</label>
                  <select value={nivel} onChange={e => setNivel(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none">
                    <option value="comum">Comum</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-5 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'SALVAR'}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <UsersIcon size={18} /> Equipe Cadastrada
              </div>
              <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-full font-bold text-slate-500">{users.length} USUÁRIOS</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Acesso / Identificação</th>
                    <th className="px-6 py-4 text-center">Permissão</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fetching ? (
                    <tr><td colSpan="4" className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700 flex items-center gap-2">
                            {u.nome}
                            {u.id === user.id && <span className="text-[10px] text-green-500 font-black tracking-tighter">(VOCÊ)</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-500">{u.email}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Mat: {u.matricula}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <select 
                            value={u.nivel} 
                            disabled={u.id === user.id || loading}
                            onChange={(e) => handleChangeUserLevel(u.id, e.target.value)}
                            className={`text-[10px] font-black px-2 py-1 rounded border uppercase outline-none transition-colors ${
                              u.nivel === 'admin' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
                            } disabled:opacity-50`}
                          >
                            <option value="comum">Comum</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.nome)}
                            disabled={u.id === user.id || loading}
                            className="text-slate-300 hover:text-red-500 p-2 transition-colors disabled:opacity-0"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div className="p-8 bg-primary-50 border border-primary-100 rounded-2xl flex items-center gap-5">
          <div className="bg-primary-500 p-3 rounded-xl text-white shadow-lg shadow-primary-200">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h4 className="font-bold text-primary-900 text-lg">Área de Gestão Restrita</h4>
            <p className="text-sm text-primary-700 leading-relaxed">
              Você está logado como **{user?.nome}**. Atualmente, somente administradores podem visualizar a listagem da equipe e cadastrar novos colaboradores.
            </p>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE DELETE USUÁRIO */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4"
            style={{
              animation: 'slideUp 0.4s ease-out'
            }}
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2">Remover Acesso</h3>
            <p className="text-slate-600 mb-6">Tem certeza que deseja remover o acesso de <strong>{deleteData?.userName}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold disabled:opacity-50"
              >
                {loading ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE ALTERAR NÍVEL */}
      {showLevelConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4"
            style={{
              animation: 'slideUp 0.4s ease-out'
            }}
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2">Alterar Permissão</h3>
            <p className="text-slate-600 mb-6">Tem certeza que deseja alterar o nível de acesso para <strong>{levelData?.novoNivel?.toUpperCase()}</strong>?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLevelConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmChangeLevel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-bold disabled:opacity-50"
              >
                {loading ? 'Alterando...' : 'Alterar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta com Animação */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <div className="flex items-start gap-3">
              {alertType === 'success' ? (
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-slate-700 font-medium">{alertMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}