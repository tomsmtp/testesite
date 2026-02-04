import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, X } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export function Reports({ data }) {
  const [safrasSelecionadas, setSafrasSelecionadas] = useState([]);

  const processData = () => {
    if (!data || data.length === 0) return [];
    
    // Agrupa por ano (safra)
    const agrupado = data.reduce((acc, curr) => {
      const ano = new Date(curr.data_ocorrencia).getFullYear().toString();
      if (!acc[ano]) acc[ano] = 0;
      acc[ano] += (curr.gasto_total || 0);
      return acc;
    }, {});
    
    return Object.keys(agrupado)
      .map(key => ({
        name: `Safra ${key}`,
        ano: key,
        gasto: agrupado[key]
      }))
      .sort((a, b) => b.ano.localeCompare(a.ano)); // Ordena do ano mais recente
  };

  const processStatusData = () => {
    if (!data || data.length === 0) return [];
    
    // Agrupa por status
    const agrupado = data.reduce((acc, curr) => {
      const status = curr.status || 'Sem Status';
      if (!acc[status]) acc[status] = 0;
      acc[status] += (curr.gasto_total || 0);
      return acc;
    }, {});
    
    return Object.keys(agrupado)
      .map(key => ({
        name: key,
        gasto: agrupado[key]
      }))
      .sort((a, b) => b.gasto - a.gasto);
  };

  const chartData = processData();
  const statusChartData = processStatusData();
  
  // Filtrar gráfico por safras selecionadas
  const chartDataFiltrado = safrasSelecionadas.length > 0 
    ? chartData.filter(item => safrasSelecionadas.includes(item.ano))
    : chartData;
  
  const totalGeral = chartDataFiltrado.reduce((acc, d) => acc + d.gasto, 0);
  
  const handleToggleSafra = (ano) => {
    setSafrasSelecionadas(prev => 
      prev.includes(ano) 
        ? prev.filter(s => s !== ano)
        : [...prev, ano]
    );
  };

  const limparFiltros = () => {
    setSafrasSelecionadas([]);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    const nomeArquivo = `Relatorio_Executivo_${new Date().toISOString().split('T')[0]}`;

    // 1. Cabeçalho Corporativo
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 297, 30, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("BOLETIM OC - Relatório Gerencial", 15, 18);

    doc.setFontSize(10);
    doc.text(`DATA DE EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}`, 235, 12);
    doc.text(`TOTAL ACUMULADO: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}`, 235, 18);

    // 2. Seção de Tabela com Gráfico embutido (Ranking)
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text("Distribuição de Custos por Safra", 15, 42);

    const maxGasto = Math.max(...chartDataFiltrado.map(d => d.gasto), 1);

    const tableBody = chartDataFiltrado.map(item => [
      item.name,
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.gasto),
      // Espaço vazio para desenharmos a barra de progresso depois
      "" 
    ]);

    autoTable(doc, {
      head: [['Safra', 'Valor Total', 'Representação Visual (Peso no Custo)']],
      body: tableBody,
      startY: 48,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], halign: 'center' },
      columnStyles: {
        0: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'right' },
        2: { cellWidth: 160 } // Coluna larga para a barra
      },
      didDrawCell: (data) => {
        // Lógica para desenhar a barra dentro da célula da coluna 2
        if (data.section === 'body' && data.column.index === 2) {
          const rowIndex = data.row.index;
          const valorGasto = chartDataFiltrado[rowIndex].gasto;
          const barWidth = (valorGasto / maxGasto) * 140; // Ajuste da largura da barra

          // Cor da barra (Indigo)
          doc.setFillColor(79, 70, 229);
          // doc.rect(x, y, largura, altura, estilo)
          doc.rect(data.cell.x + 5, data.cell.y + 2, barWidth, data.cell.height - 4, 'F');
        }
      }
    });

    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Este relatório contém dados sensíveis da operação de frota. Uso restrito.", 15, 200);

    doc.save(`${nomeArquivo}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios Gerenciais</h2>
          <p className="text-sm text-slate-500">Análise financeira consolidada por safra</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg active:scale-95 font-bold"
        >
          <Download size={20} />
          Exportar PDF Executivo
        </button>
      </div>

      {/* FILTROS POR SAFRA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-3">Filtrar por Safra</h3>
        <div className="flex flex-wrap gap-2">
          {chartData.map(item => (
            <button
              key={item.ano}
              onClick={() => handleToggleSafra(item.ano)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                safrasSelecionadas.includes(item.ano)
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.name}
            </button>
          ))}
          {safrasSelecionadas.length > 0 && (
            <button
              onClick={limparFiltros}
              className="px-4 py-2 rounded-lg font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center gap-1"
            >
              <X size={16} /> Limpar
            </button>
          )}
        </div>
        {safrasSelecionadas.length > 0 && (
          <p className="text-sm text-slate-500 mt-3">
            Mostrando {safrasSelecionadas.length} de {chartData.length} safra(s)
          </p>
        )}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-700 mb-8 text-center uppercase tracking-widest">Gasto Total por Safra (Ano)</h3>
        
        {chartDataFiltrado.length > 0 ? (
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataFiltrado} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(v) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v), 'Total Gasto']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="gasto" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 font-medium">
            Nenhuma safra selecionada
          </div>
        )}
      </div>
    </div>
  );
}


