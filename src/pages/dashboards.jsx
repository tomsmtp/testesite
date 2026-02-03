import React from 'react';
import { AlertTriangle, CheckCircle, Wallet, Calendar } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="ml-64 p-8 bg-slate-50 min-h-screen">
      
      {/* 1. Cabeçalho da Página */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Operacional</h2>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <Calendar size={16} /> Safra 2025/2026 - Unidade 127
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-all active:scale-95">
          + Nova Ocorrência
        </button>
      </header>

      {/* 2. Cards de Estatísticas (Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Gasto Total (Safra)" 
          value="R$ 14.520,00" 
          icon={<Wallet className="text-red-600" size={24} />} 
          trend="+12% que mês passado"
          color="border-red-500"
        />
        <StatCard 
          title="Ocorrências Pendentes" 
          value="08 Casos" 
          icon={<AlertTriangle className="text-orange-500" size={24} />} 
          trend="Requer atenção"
          color="border-orange-500"
        />
        <StatCard 
          title="Finalizadas" 
          value="45 Casos" 
          icon={<CheckCircle className="text-emerald-500" size={24} />} 
          trend="Atualizado hoje"
          color="border-emerald-500"
        />
      </div>

      {/* 3. Tabela de Ocorrências Recentes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Últimos Apontamentos (Vindo do App)</h3>
          <span className="text-sm text-blue-600 cursor-pointer hover:underline">Ver todos</span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Item 1 - Exemplo Real da Planilha */}
          <OcorrenciaRow 
            frota="38033 - John Deere 6180 J"
            area="Preparo de Solo"
            data="20/11/2025"
            desc="Quebrou o rabicho traseiro ao puxar caminhão canavieiro."
            valor="R$ 2.351,25"
            status="Pendente"
          />

          {/* Item 2 */}
          <OcorrenciaRow 
            frota="18029 - Volvo VM 330"
            area="Logística / Transporte"
            data="16/11/2025"
            desc="Colidiu na frente quebrando o vidro e amassando a coluna."
            valor="R$ 0,00"
            status="Analisado"
          />

           {/* Item 3 */}
           <OcorrenciaRow 
            frota="16098 - M.B. ATEGO 2730"
            area="Logística"
            data="14/11/2025"
            desc="Para-choque pegou no palanque ao manobrar de ré."
            valor="R$ 300,00"
            status="Pendente"
          />
        </div>
      </div>
    </div>
  );
}

// Componente Visual do Card de Topo
function StatCard({ title, value, icon, trend, color }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <p className="text-xs text-slate-400 font-medium">{trend}</p>
    </div>
  );
}

// Componente Visual da Linha da Tabela
function OcorrenciaRow({ frota, area, data, desc, valor, status }) {
  return (
    <div className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-bold text-slate-700">{frota}</h4>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">{area}</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">"{desc}"</p>
          <p className="text-xs text-slate-400 mt-2">Ocorrido em: {data}</p>
        </div>

        <div className="text-right">
          <div className="font-bold text-slate-800 text-lg mb-1">{valor}</div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'Pendente' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {status}
          </span>
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="text-sm text-blue-600 font-semibold hover:underline">Ver Detalhes →</button>
          </div>
        </div>
      </div>
    </div>
  );
}