import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Trash2, Wrench, ClipboardList, Map, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function NewOccurrenceModal({ isOpen, onClose, onSuccess, occurrenceToEdit }) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  
  const defaultData = {
    unidade: '127',
    safra: '2025-2026',
    frota: '',
    marca_modelo: '',
    area: '',
    data_ocorrencia: new Date().toISOString().split('T')[0],
    relato: '',
    tipo_ocorrencia: 'Avarias Diversas',
    status: 'Pendente',
    
    // CAMPOS FINANCEIROS/TÉCNICOS
    ordem_servico: '',
    valor_os: '',
    requisicao: '',
    valor_requisicao: '',
    gasto_total: '',

    // CAMPOS DE RESPONSABILIDADE
    finalizado_por_nome: '',
    finalizado_por_matricula: ''
  };

  const [formData, setFormData] = useState(defaultData);

  useEffect(() => {
    if (isOpen) {
      if (occurrenceToEdit) {
        setFormData({
          ...occurrenceToEdit,
          // Fallback para strings vazias para evitar warnings de input controlado
          ordem_servico: occurrenceToEdit.ordem_servico || '',
          valor_os: occurrenceToEdit.valor_os || '',
          requisicao: occurrenceToEdit.requisicao || '',
          valor_requisicao: occurrenceToEdit.valor_requisicao || '',
          gasto_total: occurrenceToEdit.gasto_total || '',
          area: occurrenceToEdit.area || '',
          marca_modelo: occurrenceToEdit.marca_modelo || '',
          finalizado_por_nome: occurrenceToEdit.finalizado_por_nome || '',
          finalizado_por_matricula: occurrenceToEdit.finalizado_por_matricula || ''
        });
      } else {
        setFormData(defaultData);
      }
    }
  }, [isOpen, occurrenceToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const parseCurrency = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace(',', '.'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação do campo Relato
    if (!formData.relato || formData.relato.trim() === '') {
      setValidationMessage('O campo "Relato Detalhado" é obrigatório. Por favor, descreva o ocorrido.');
      setShowValidationError(true);
      return;
    }

    setLoading(true);

    if (formData.status === 'Finalizado' && (!formData.finalizado_por_nome || !formData.finalizado_por_matricula)) {
      setValidationMessage('Para finalizar, preencha o Nome e Matrícula do responsável.');
      setShowValidationError(true);
      setLoading(false);
      return;
    }

    const dadosParaSalvar = {
      ...formData,
      valor_os: parseCurrency(formData.valor_os),
      valor_requisicao: parseCurrency(formData.valor_requisicao),
      gasto_total: parseCurrency(formData.gasto_total),
    };

    let error;
    if (occurrenceToEdit) {
      const { error: err } = await supabase.from('ocorrencias').update(dadosParaSalvar).eq('id', occurrenceToEdit.id);
      error = err;
    } else {
      const boGerado = `${formData.unidade}${Math.floor(10000 + Math.random() * 90000)}`;
      const { error: err } = await supabase.from('ocorrencias').insert([{ ...dadosParaSalvar, numero_bo: boGerado }]);
      error = err;
    }

    setLoading(false);
    if (error) alert('Erro: ' + error.message);
    else { onSuccess(); onClose(); }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    const { error } = await supabase.from('ocorrencias').delete().eq('id', occurrenceToEdit.id);
    setLoading(false);
    if (!error) { onSuccess(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-0 max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg text-white">
              <ClipboardList size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {occurrenceToEdit ? `Editar Registro: ${occurrenceToEdit.numero_bo}` : 'Novo Apontamento'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* BLOCO 1: IDENTIFICAÇÃO BÁSICA */}
          <section className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Map size={14} /> Identificação e Localização
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                <select name="unidade" value={formData.unidade} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-green-500">
                  <option value="127">127</option><option value="115">115</option>
                  <option value="112">112</option><option value="100">100</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Safra</label>
                <select name="safra" value={formData.safra} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-green-500">
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Área / Setor</label>
                <input name="area" placeholder="Ex: Plantio, Colheita..." value={formData.area} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Frota *</label>
                <input name="frota" required placeholder="Ex: TR-10" value={formData.frota} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-green-500 font-bold" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Marca / Modelo</label>
                <input name="marca_modelo" placeholder="Ex: John Deere 6150J" value={formData.marca_modelo} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </section>

          {/* BLOCO 2: DETALHES DA OCORRÊNCIA */}
          <section className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} /> Detalhes do Evento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Ocorrência</label>
                <select name="tipo_ocorrencia" value={formData.tipo_ocorrencia} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">
                  <option value="Avarias Diversas">Avarias Diversas</option>
                  <option value="Manutenção Corretiva">Manutenção Corretiva</option>
                  <option value="Acidente">Acidente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data da Ocorrência</label>
                <input type="date" name="data_ocorrencia" required value={formData.data_ocorrencia} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-slate-50 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Relato Detalhado *</label>
              <textarea name="relato" rows="3" required placeholder="Descreva o ocorrido..." value={formData.relato} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-green-500 italic" />
            </div>
          </section>

          {/* BLOCO 3: FINANCEIRO E TÉCNICO */}
          <section className="space-y-4 bg-green-50/50 p-5 rounded-2xl border border-green-100">
            <h4 className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Wrench size={14} /> Dados Técnicos e Custos
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-green-900 mb-1 uppercase">Nº O.S.</label>
                <input name="ordem_servico" placeholder="0000" value={formData.ordem_servico} onChange={handleChange} className="w-full p-2 border border-green-200 rounded-lg outline-none bg-white" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-green-900 mb-1 uppercase">Valor O.S.</label>
                <input name="valor_os" type="number" step="0.01" placeholder="0.00" value={formData.valor_os} onChange={handleChange} className="w-full p-2 border border-green-200 rounded-lg outline-none bg-white font-bold" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-green-900 mb-1 uppercase">Nº Requisição</label>
                <input name="requisicao" placeholder="0000" value={formData.requisicao} onChange={handleChange} className="w-full p-2 border border-green-200 rounded-lg outline-none bg-white" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold text-green-900 mb-1 uppercase">Valor Req.</label>
                <input name="valor_requisicao" type="number" step="0.01" placeholder="0.00" value={formData.valor_requisicao} onChange={handleChange} className="w-full p-2 border border-green-200 rounded-lg outline-none bg-white font-bold" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-green-900 mb-1">GASTO TOTAL CONSOLIDADO (R$)</label>
              <input name="gasto_total" type="number" step="0.01" value={formData.gasto_total} onChange={handleChange} className="w-full p-3 border-2 border-green-600 rounded-xl bg-white text-xl font-black text-green-700 outline-none shadow-inner" />
            </div>
          </section>

          {/* BLOCO 4: STATUS E FINALIZAÇÃO */}
          <section className={`p-5 rounded-2xl border transition-all ${formData.status === 'Finalizado' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-700 mb-1">Status do Processo</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border rounded-xl bg-white font-bold outline-none">
                  <option value="Pendente">🟡 Pendente</option>
                  <option value="Em Andamento">🔵 Em Andamento</option>
                  <option value="Finalizado">🟢 Finalizado</option>
                </select>
              </div>
              {formData.status === 'Finalizado' && (
                <>
                  <div className="flex-1 w-full animate-in fade-in slide-in-from-left-2">
                    <label className="block text-xs font-bold text-green-800 mb-1">Matrícula Responsável</label>
                    <input name="finalizado_por_matricula" required value={formData.finalizado_por_matricula} onChange={handleChange} className="w-full p-2.5 border border-green-300 rounded-xl bg-white" />
                  </div>
                  <div className="flex-[2] w-full animate-in fade-in slide-in-from-left-4">
                    <label className="block text-xs font-bold text-green-800 mb-1">Nome Completo</label>
                    <input name="finalizado_por_nome" required value={formData.finalizado_por_nome} onChange={handleChange} className="w-full p-2.5 border border-green-300 rounded-xl bg-white" />
                  </div>
                </>
              )}
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex gap-3">
          {occurrenceToEdit && (
            <button type="button" onClick={handleDelete} className="px-5 py-3 bg-white text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all font-bold shadow-sm">
              <Trash2 size={20} />
            </button>
          )}
          <button type="submit" onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200 active:scale-[0.98] disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {occurrenceToEdit ? "ATUALIZAR APONTAMENTO" : "CRIAR OCORRÊNCIA"}
          </button>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE DELETE */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm"
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
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Apontamento</h3>
            <p className="text-slate-600 mb-6">Tem certeza que deseja excluir esta ocorrência permanentemente? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-all font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold disabled:opacity-50"
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VALIDAÇÃO DE CAMPOS */}
      {showValidationError && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm"
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
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 border-l-4 border-yellow-500"
            style={{
              animation: 'slideUp 0.4s ease-out'
            }}
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2">⚠️ Campo Obrigatório</h3>
            <p className="text-slate-600 mb-6">{validationMessage}</p>
            <button
              onClick={() => setShowValidationError(false)}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all font-bold"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}