import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BarChart3, Settings as SettingsIcon, LogOut, UserCircle } from 'lucide-react';
import logo from '../assets/logo_login_form.png';

export function Sidebar({ activeTab, onTabChange, user, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (showLogoutConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showLogoutConfirm]);
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  const isAdmin = user?.nivel === 'admin';

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-green-600 p-2 rounded-lg text-white">
          <img src={logo} alt="BOLETIM OC" className="w-6 h-6 object-contain" />
        </div>
        <div>
          <h1 className="text-white font-bold tracking-tight">BOLETIM OC</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Controle de Ocorrências</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* SEÇÃO DO USUÁRIO IDENTICA À IMAGEM */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="bg-slate-700 p-2 rounded-full text-slate-400">
            <UserCircle size={24} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.nome || 'Usuário'}</p>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded border text-red-400 border-red-900 bg-red-900/20">
              {user?.nivel || 'Admin'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
      {showLogoutConfirm && (
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
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar Saída</h3>
            <p className="text-slate-600 mb-6">Tem certeza que deseja sair do sistema?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}