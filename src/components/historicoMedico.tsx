import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

// Função para gerar PDF do histórico médico
const imprimirHistoricoPDF = (historicoMedico, dadosPaciente) => {
  const doc = new jsPDF();
  
  // Configurações iniciais
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;
  
  // Função para adicionar nova página se necessário
  const checkPageBreak = (neededHeight) => {
    if (yPosition + neededHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };
  
  // Função para quebrar texto em linhas
  const splitText = (text, maxWidth) => {
    return doc.splitTextToSize(text, maxWidth);
  };
  
  // Cabeçalho do documento
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('HISTÓRICO MÉDICO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Linha decorativa
  doc.setDrawColor(59, 130, 246); // Azul
  doc.setLineWidth(2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Dados do paciente
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO PACIENTE', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${dadosPaciente.nome}`, margin, yPosition);
  yPosition += 8;
  doc.text(`CPF: ${dadosPaciente.cpf}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Data de Geração: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPosition);
  yPosition += 20;
  
  // Histórico médico
  historicoMedico.forEach((item, index) => {
    checkPageBreak(80); // Verificar se há espaço para o item
    
    // Título do registro
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`REGISTRO ${index + 1}`, margin, yPosition);
    yPosition += 12;
    
    // Data da consulta
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Data da Consulta:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(item.dataConsulta), 'dd/MM/yyyy', { locale: ptBR }), margin + 40, yPosition);
    yPosition += 8;
    
    // Diagnóstico
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnóstico:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    const diagnosticoLines = splitText(item.diagnostico, pageWidth - margin - 40);
    doc.text(diagnosticoLines, margin + 30, yPosition);
    yPosition += diagnosticoLines.length * 6 + 2;
    
    // Profissional responsável
    doc.setFont('helvetica', 'bold');
    doc.text('Profissional:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${item.funcionario.nome} - ${item.funcionario.funcao}`, margin + 30, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('UBS:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(item.funcionario.ubs.nome, margin + 20, yPosition);
    yPosition += 12;
    
    // Doença (se existir)
    if (item.doenca) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Doença:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      const doencaLines = splitText(item.doenca, pageWidth - margin - 25);
      doc.text(doencaLines, margin + 25, yPosition);
      yPosition += doencaLines.length * 6 + 4;
    }
    
    // Medicação (se existir)
    if (item.medicacao) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Medicação:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      const medicacaoLines = splitText(item.medicacao, pageWidth - margin - 30);
      doc.text(medicacaoLines, margin + 30, yPosition);
      yPosition += medicacaoLines.length * 6 + 4;
    }
    
    // Laudo (se existir)
    if (item.laudo) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.text('Laudo Médico:', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      const laudoLines = splitText(item.laudo, pageWidth - margin * 2);
      doc.text(laudoLines, margin, yPosition);
      yPosition += laudoLines.length * 6 + 4;
    }
    
    // Observações (se existir)
    if (item.observacoes) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      const observacoesLines = splitText(item.observacoes, pageWidth - margin * 2);
      doc.text(observacoesLines, margin, yPosition);
      yPosition += observacoesLines.length * 6 + 4;
    }
    
    // Linha separadora entre registros
    if (index < historicoMedico.length - 1) {
      checkPageBreak(15);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
    }
  });
  
  // Salvar o PDF
  const nomeArquivo = `historico-medico-${dadosPaciente.nome.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(nomeArquivo);
};

// Componente React atualizado
const HistoricoMedico = ({ activeTab, historicoMedico, dadosPaciente }) => {
  return (
    <>
      {activeTab === 'historico' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6 lg:p-8">
          <div className="mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Histórico Médico</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
            
            {/* Botão de impressão - posicionado no cabeçalho */}
            {historicoMedico && historicoMedico.length > 0 && (
              <button 
                onClick={() => imprimirHistoricoPDF(historicoMedico, dadosPaciente)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Gerar PDF
              </button>
            )}
          </div>
          
          {historicoMedico && historicoMedico.length > 0 ? (
            <div className="space-y-6">
              {historicoMedico.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Header com gradiente */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 leading-tight">{item.diagnostico}</h3>
                        <div className="flex items-center gap-2 text-blue-100">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">
                            {format(new Date(item.dataConsulta), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="lg:text-right bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <p className="font-bold text-sm">{item.funcionario.nome}</p>
                        </div>
                        <p className="text-xs text-blue-100 mb-1">{item.funcionario.funcao}</p>
                        <p className="text-xs text-blue-100">{item.funcionario.ubs.nome}</p>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo principal */}
                  <div className="p-6">
                    {/* Grid de informações principais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {item.doenca && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Doença</p>
                          </div>
                          <p className="text-red-800 font-medium">{item.doenca}</p>
                        </div>
                      )}
                      
                      {item.medicacao && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Medicação</p>
                          </div>
                          <p className="text-green-800 font-medium">{item.medicacao}</p>
                        </div>
                      )}
                    </div>

                    {/* Seções expandidas */}
                    <div className="space-y-6">
                      {item.laudo && (
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <h4 className="font-bold text-blue-800 uppercase tracking-wide text-sm">Laudo Médico</h4>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <p className="text-gray-800 leading-relaxed">{item.laudo}</p>
                          </div>
                        </div>
                      )}
                      
                      {item.observacoes && (
                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <h4 className="font-bold text-amber-800 uppercase tracking-wide text-sm">Observações</h4>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-amber-100">
                            <p className="text-gray-800 leading-relaxed">{item.observacoes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum histórico encontrado</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Não há registros médicos disponíveis para este paciente no momento.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HistoricoMedico;

