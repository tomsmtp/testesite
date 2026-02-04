import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, Download, Loader2, Calendar, MapPin, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Filter, LayoutGrid
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

import { NewOccurrenceModal } from '../components/NewOccurrenceModal';
import { Sidebar } from '../components/Sidebar';
import { Reports } from './Reports';
import { Settings } from './Settings';

export function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.nivel === 'admin';

  // --- PAGINAÇÃO ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [unidadeFilter, setUnidadeFilter] = useState('Todas');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Estados de Modal de Alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => { buscarOcorrencias(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, unidadeFilter, dataInicio, dataFim]);

  async function buscarOcorrencias() {
    setLoading(true);
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .order('data_ocorrencia', { ascending: false });

    if (error) console.error('Erro:', error);
    else setOcorrencias(data || []);
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Finalizado': return 'bg-green-100 text-green-700 border-green-200';
      case 'Em Andamento': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusEmoji = (status) => {
    switch(status) {
      case 'Finalizado': return '🟢';
      case 'Em Andamento': return '🔵';
      default: return '🟡';
    }
  };

  // --- FILTRAGEM ---
  const ocorrenciasFiltradas = ocorrencias.filter(item => {
    const termo = searchTerm.toLowerCase();
    const textoMatch = 
      (item.frota || '').toLowerCase().includes(termo) ||
      (item.numero_bo || '').toLowerCase().includes(termo) ||
      (item.safra || '').toLowerCase().includes(termo) ||
      (item.unidade || '').toLowerCase().includes(termo) ||
      (item.relato || '').toLowerCase().includes(termo);

    const statusMatch = statusFilter === 'Todos' ? true : item.status === statusFilter;
    const unidadeMatch = unidadeFilter === 'Todas' ? true : item.unidade === unidadeFilter;

    let dataMatch = true;
    if (dataInicio) dataMatch = dataMatch && item.data_ocorrencia >= dataInicio;
    if (dataFim) dataMatch = dataMatch && item.data_ocorrencia <= dataFim;

    return textoMatch && statusMatch && unidadeMatch && dataMatch;
  });

  // --- LÓGICA DE PAGINAÇÃO ---
  const totalItems = ocorrenciasFiltradas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ocorrenciasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

  const handleNew = () => { if (isAdmin) { setEditingItem(null); setIsModalOpen(true); } };
  const handleEdit = (item) => { if (isAdmin) { setEditingItem(item); setIsModalOpen(true); } };

  const handleExport = () => {
    if (ocorrenciasFiltradas.length === 0) {
      setAlertMessage("Nenhum dado para exportar. Tente ajustar os filtros.");
      setShowAlert(true);
      return;
    }    const formato = localStorage.getItem('agromanager_export_pref') || 'csv';
    const nomeArquivo = `Relatorio_BOLETIM_OC_${new Date().toISOString().split('T')[0]}`;

    // Filtrar apenas os campos desejados (sem created_at)
    const dadosFiltrados = ocorrenciasFiltradas.map(i => ({
      numero_id: i.id,
      data_ocorrencia: new Date(i.data_ocorrencia).toLocaleDateString('pt-BR'),
      frota: i.frota,
      numero_bo: i.numero_bo,
      unidade: i.unidade,
      area: i.area || '-',
      relato: i.relato,
      status: i.status,
      ordem_servico: i.ordem_servico || '-',
      requisicao: i.requisicao || '-',
      finalizado_por_nome: i.finalizado_por_nome || '-',
      finalizado_por_matricula: i.finalizado_por_matricula || '-',
      valor_os: i.valor_os || '-',
      gasto_total: i.gasto_total
    }));

    if (formato === 'pdf') {
      const doc = new jsPDF({ orientation: 'l' });
      doc.text("Relatório Geral de Ocorrências", 14, 15);
      autoTable(doc, {
        head: [["OC", "Data", "Frota", "B.O.", "Unidade", "Área", "Relato", "Status", "OS", "Requisição", "Final. Nome", "Final. Mat.", "Valor OS", "Valor Total"]],
        body: ocorrenciasFiltradas.map(i => [i.id, new Date(i.data_ocorrencia).toLocaleDateString('pt-BR'), i.frota, i.numero_bo, i.unidade, i.area || '-', i.relato, i.status, i.ordem_servico || '-', i.requisicao || '-', i.finalizado_por_nome || '-', i.finalizado_por_matricula || '-', formatMoney(i.valor_os || 0), formatMoney(i.gasto_total)]),
        startY: 25, theme: 'grid', styles: { fontSize: 8 }
      });
      doc.save(`${nomeArquivo}.pdf`);
    } else {
      const ws = XLSX.utils.json_to_sheet(dadosFiltrados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dados");
      XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />
      
      <div className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        
        {activeTab === 'dashboard' && (
          <>
            <header className="flex flex-col md:flex-row justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Painel Operacional</h2>
                <p className="text-slate-500 mt-1 font-medium">Olá, **{user?.nome}** | Mostrando **{totalItems}** registros encontrados</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <Download size={18} className="text-green-500" /> Exportar Dados
                </button>
                {isAdmin && (
                  <button onClick={handleNew} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95">
                    + Nova Ocorrência
                  </button>
                )}
              </div>
            </header>

            {/* BARRA DE FILTROS AVANÇADA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-slate-200">
              <div className="flex flex-wrap gap-4 mb-5">
                <div className="flex-1 min-w-[300px] relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={20} />
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 bg-slate-50/50 transition-all text-sm font-medium" 
                    placeholder="Pesquisar por Frota (TR-10), Safra (24/25), B.O., Unidade ou descrição..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Filter size={14} /> Filtros:
                  </div>
                  <select className="border-slate-200 border rounded-xl px-4 py-2 text-sm outline-none font-semibold text-slate-600 bg-white" value={unidadeFilter} onChange={e => setUnidadeFilter(e.target.value)}>
                    <option value="Todas">Todas Unidades</option>
                    <option value="127">Unidade 127</option><option value="115">Unidade 115</option><option value="112">Unidade 112</option>
                  </select>
                  <select className="border-slate-200 border rounded-xl px-4 py-2 text-sm outline-none font-semibold text-slate-600 bg-white" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="Todos">Todos Status</option>
                    <option value="Pendente">Pendente</option><option value="Em Andamento">Em Andamento</option><option value="Finalizado">Finalizado</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <Calendar size={16} className="text-slate-400 ml-2" />
                  <input type="date" className="bg-transparent border-none rounded-lg px-2 py-1 text-xs font-bold text-slate-600 outline-none" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                  <span className="text-slate-300 font-bold">à</span>
                  <input type="date" className="bg-transparent border-none rounded-lg px-2 py-1 text-xs font-bold text-slate-600 outline-none" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                </div>
              </div>
            </div>

            {/* TABELA RICH UI */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              {loading ? (
                <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-green-500" size={40} /></div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <div className="min-w-[1000px] divide-y divide-slate-100">
                      {/* Header Tabela */}
                      <div className="grid grid-cols-12 px-8 py-4 bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <div className="col-span-3">Identificação / Safra</div>
                        <div className="col-span-5">Detalhamento do Relato</div>
                        <div className="col-span-2 text-center">Status / Data</div>
                        <div className="col-span-2 text-right">Investimento</div>
                      </div>

                      {currentItems.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => isAdmin && handleEdit(item)} 
                          className={`grid grid-cols-12 px-8 py-6 items-center transition-all ${isAdmin ? 'hover:bg-green-50/50 cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className="col-span-3">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-800 text-lg tracking-tight">{item.frota}</span>
                              <span className="bg-green-50 text-green-600 text-[10px] px-2 py-0.5 rounded-md font-black border border-green-100 uppercase italic">
                                {item.safra}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 font-bold text-[11px]">
                              <MapPin size={12} className="text-indigo-400" />
                              UNIDADE {item.unidade}
                            </div>
                          </div>
                          <div className="col-span-5 pr-10">
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 font-medium italic">"{item.relato}"</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">B.O. Nº {item.numero_bo || 'S/N'}</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <div className={`inline-block px-3 py-1 text-[10px] font-black rounded-full border uppercase mb-1.5 tracking-wider ${getStatusColor(item.status)}`}>
                              {getStatusEmoji(item.status)} {item.status}
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold">{new Date(item.data_ocorrencia).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className="text-lg font-black text-slate-700">{formatMoney(item.gasto_total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NAVEGAÇÃO DE PÁGINA */}
                  {totalPages > 1 && (
                    <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-sm font-bold text-slate-500">
                        Mostrando <span className="text-indigo-600">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}</span> de <span className="text-slate-800">{totalItems}</span> registros
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all shadow-sm">
                          <ChevronsLeft size={20} />
                        </button>
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all shadow-sm">
                          <ChevronLeft size={20} />
                        </button>

                        <div className="bg-white border border-slate-200 px-5 py-2 rounded-xl text-sm font-black text-slate-700 shadow-sm">
                          {currentPage} / {totalPages}
                        </div>

                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all shadow-sm">
                          <ChevronRight size={20} />
                        </button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all shadow-sm">
                          <ChevronsRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <NewOccurrenceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} occurrenceToEdit={editingItem} onSuccess={buscarOcorrencias} />
          </>
        )}

        {/* MODAL DE ALERTA */}
        {showAlert && (
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Aviso</h3>
              <p className="text-slate-600 mb-6">{alertMessage}</p>
              <button
                onClick={() => setShowAlert(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold"
              >
                OK
              </button>
            </div>
          </div>
        )}        {activeTab === 'reports' && <Reports data={ocorrencias} />}
        {activeTab === 'relatorios' && <Reports data={ocorrencias} />}
        {activeTab === 'settings' && <Settings user={user} />}
      </div>
    </div>
  );
}