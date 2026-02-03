import React from 'react';
import { LayoutDashboard, FileText, Truck, Settings, PieChart } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* 1. Logo da Empresa */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
          A
        </div>
        <div>
          <h1 className="font-bold text-lg">AgroManager</h1>
          <p className="text-xs text-slate-400">Gestão de Frotas</p>
        </div>
      </div>

      {/* 2. Menu de Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem icon={<LayoutDashboard size={20} />} text="Visão Geral" active />
        <NavItem icon={<FileText size={20} />} text="Ocorrências" />
        <NavItem icon={<Truck size={20} />} text="Minha Frota" />
        <NavItem icon={<PieChart size={20} />} text="Relatórios" />
      </nav>

      {/* 3. Rodapé */}
      <div className="p-4 border-t border-slate-800">
        <NavItem icon={<Settings size={20} />} text="Configurações" />
      </div>
    </aside>
  );
}

// Pequeno componente para não repetir código (DRY)
function NavItem({ icon, text, active }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}>
      {icon}
      <span className="font-medium">{text}</span>
    </a>
  );
}