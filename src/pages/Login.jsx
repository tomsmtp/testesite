import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, HelpCircle, AlertCircle } from 'lucide-react';
import logo from '../assets/logo_login_form.png';

export function Login({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Estados de Alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error'); // 'error' ou 'info'

  // Carrega email salvo se o "Lembrar" estiver ativo
  useEffect(() => {
    const savedEmail = localStorage.getItem('agromanager_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setAlertMessage("Acesso Negado: Verifique e-mail e senha.");
      setAlertType('error');
      setShowAlert(true);
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('nome, nivel, matricula')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      setAlertMessage("Erro ao carregar perfil de acesso.");
      setAlertType('error');
      setShowAlert(true);
      setLoading(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('agromanager_remember_email', email);
    } else {
      localStorage.removeItem('agromanager_remember_email');
    }

    const sessionData = { ...authData.user, ...userData };
    localStorage.setItem('agromanager_user', JSON.stringify(sessionData));
    onLoginSuccess(sessionData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        
        <div className="bg-green-600 p-8 text-center text-white">
          <div className="inline-flex p-3 bg-green-500 rounded-xl mb-4 shadow-inner">
            <img src={logo} alt="BOLETIM OC" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold italic tracking-tighter uppercase">BOLETIM OC</h1>
          <p className="text-green-100 text-xs mt-1 font-medium">SISTEMA DE GESTÃO DE OCORRÊNCIAS v1.0</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-slate-50"
                placeholder="exemplo@agroterenas.com.br"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-slate-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-green-600 transition-colors">Lembrar meu usuário</span>
            </label>

            <button 
              type="button"
              onClick={() => {
                setAlertMessage("DICA: Sua senha padrão é o número da sua MATRÍCULA.");
                setAlertType('info');
                setShowAlert(true);
              }}
              className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1"
            >
              <HelpCircle size={14} /> Esqueci a senha
            </button>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "ACESSAR DASHBOARD"}
          </button>
        </form>

        <div className="p-4 bg-slate-50 border-t text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Uso restrito a colaboradores autorizados</p>
        </div>

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
                {alertType === 'error' ? (
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-red-600" size={20} />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <HelpCircle className="text-green-600" size={20} />
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
    </div>
  );
}