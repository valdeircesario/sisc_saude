import React, { useState } from "react";
import { FileText, Search, User, Calendar, Activity, ChevronRight, History, ArrowLeft, Clock, Pill, ClipboardList, ChevronDown, ChevronUp, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pagination } from "../UI/Pagination";

interface HistoricoTabProps {
  historicoBuscaResultado: any;
  setShowBuscaHistoricoModal: (show: boolean) => void;
  abrirDetalheHistorico: (registro: any) => void;
  selectedPaciente: any;
  setActiveTab: (tab: string) => void;
  historicoPaciente: any[];
}

const FuncionarioHistoricoTab: React.FC<HistoricoTabProps> = ({
  historicoBuscaResultado,
  setShowBuscaHistoricoModal,
  abrirDetalheHistorico,
  selectedPaciente,
  setActiveTab,
  historicoPaciente,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const itemsPerPage = 8;

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Determina quais dados paginar
  const isSpecificPatient = Boolean(selectedPaciente);
  const dataToPaginate = isSpecificPatient 
    ? (historicoPaciente || []) 
    : (historicoBuscaResultado?.registros || []);

  const totalPages = Math.ceil(dataToPaginate.length / itemsPerPage);
  const currentItems = dataToPaginate.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const RecordDetails = ({ record }: { record: any }) => {
    if (record.tipo === 'consulta' || record.tipo === 'retorno') {
      const data = record.detalhes;
      if (!data) return null;
      
      return (
        <div className="mt-4 pt-4 border-t border-[#EEF2F7] space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Evolução Clínica */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4EDF7] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="h-4 w-4 text-teal-600" />
              <h5 className="text-[11px] font-black uppercase text-teal-800 tracking-wider">Evolução Clínica</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[9px] font-black text-[#8FA8C4] uppercase mb-1">Diagnóstico / CID</p>
                <p className="text-sm font-bold text-[#1A2E4A]">{data.historicoMedico?.diagnostico || data.diagnostico || "—"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-[#8FA8C4] uppercase mb-1">Doença</p>
                <p className="text-sm font-bold text-[#1A2E4A]">{data.historicoMedico?.doenca || data.doenca || "—"}</p>
              </div>
            </div>
            <div className="bg-[#F8FAFD] rounded-xl p-4 border border-[#EEF2F7]">
              <p className="text-[9px] font-black text-[#8FA8C4] uppercase mb-2">Laudo e Conduta</p>
              <p className="text-sm text-[#1A2E4A] leading-relaxed whitespace-pre-wrap">{data.historicoMedico?.laudo || data.laudo || "Sem laudo registrado."}</p>
            </div>
          </div>

          {/* Receita Vinculada */}
          {(data.receita) && (
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <h5 className="text-[11px] font-black uppercase text-blue-800 tracking-wider">Receita Médica</h5>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  {data.receita.status}
                </span>
              </div>
              <div className="space-y-3">
                {data.receita.itens?.map((item: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl p-3 border border-blue-50 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-xs font-black text-[#1A2E4A]">{item.medicamento}</p>
                      <p className="text-[10px] text-blue-600 font-bold">{item.dosagem} • {item.posologia || "Uso conforme bula"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-[#8FA8C4] uppercase">Qtd</p>
                      <p className="text-xs font-bold text-[#1A2E4A]">{item.quantidade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Atestado Vinculado */}
          {data.atestado && (
            <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="h-4 w-4 text-purple-600" />
                <h5 className="text-[11px] font-black uppercase text-purple-800 tracking-wider">Atestado Médica</h5>
              </div>
              <p className="text-xs font-bold text-purple-900 leading-relaxed">
                Afastamento de {data.atestado.diasRepouso} dias por motivo de {data.atestado.descricao}.
              </p>
            </div>
          )}

          {/* Retornos Vinculados */}
          {data.retornos && data.retornos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="h-[1px] flex-1 bg-[#EEF2F7]" />
                <span className="text-[9px] font-black text-[#8FA8C4] uppercase tracking-[0.2em]">Acompanhamentos / Retornos</span>
                <div className="h-[1px] flex-1 bg-[#EEF2F7]" />
              </div>
              {data.retornos.map((ret: any, i: number) => (
                <div key={i} className="bg-amber-50/30 rounded-2xl p-4 border border-amber-100/50 ml-4 relative">
                  <div className="absolute left-[-17px] top-1/2 w-4 h-[1px] bg-amber-200" />
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Retorno Realizado</span>
                        <span className="text-[10px] font-bold text-[#8FA8C4]">
                          {ret.dataRetorno ? format(new Date(ret.dataRetorno), "dd/MM/yyyy") : "Data —"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#1A2E4A]">{ret.laudo || "Acompanhamento clínico efetuado."}</p>
                    </div>
                  </div>
                  {ret.receita && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 mt-2">
                      <Pill className="h-3 w-3" /> Receita emitida no retorno
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const safeFormat = (dateValue: any, formatStr: string) => {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "—";
    return format(date, formatStr, { locale: ptBR });
  };

  return (
    <div
      className="rounded-2xl flex flex-col h-full"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2FB] flex items-center justify-center border border-[#C8D9ED]">
              <History className="h-5 w-5 text-[#1A3F72]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                {isSpecificPatient ? "Prontuário Digital" : "Histórico por CPF"}
              </h2>
              <p className="text-xs text-[#8FA8C4]">
                {isSpecificPatient 
                  ? "Histórico completo e acompanhamento clínico." 
                  : "Busque registros cronológicos de qualquer paciente."}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isSpecificPatient ? (
              <button
                onClick={() => setActiveTab("pacientes")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#5C7A9B] border border-[#D9E4F0] hover:bg-[#F8FAFD] transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </button>
            ) : (
              <button
                onClick={() => setShowBuscaHistoricoModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1A3F72] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#1A3F72]/20 hover:scale-105 transition-all"
              >
                <Search className="h-3.5 w-3.5" /> Buscar por CPF
              </button>
            )}
          </div>
        </div>

        {/* Informações do Paciente */}
        {(selectedPaciente || historicoBuscaResultado?.paciente) && (
          <div className="mb-6 p-4 bg-[#F8FAFD] rounded-2xl border border-[#E4EDF7] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white border border-[#C8D9ED] flex items-center justify-center shadow-sm">
              <User className="h-6 w-6 text-[#1A3F72]" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-[#0F2242]">
                {selectedPaciente?.nome || historicoBuscaResultado?.paciente?.nome}
              </h3>
              <div className="flex gap-3 mt-1">
                <p className="text-[10px] font-bold text-[#3A5B82] uppercase tracking-widest">
                  CPF: {selectedPaciente?.cpf || historicoBuscaResultado?.paciente?.cpf}
                </p>
                {selectedPaciente?.cns && (
                  <p className="text-[10px] font-bold text-[#3A5B82] uppercase tracking-widest border-l border-[#C8D9ED] pl-3">
                    CNS: {selectedPaciente.cns}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {dataToPaginate.length > 0 ? (
          <div className="space-y-4 min-h-[400px]">
            {currentItems.map((item: any, idx: number) => {
              const uniqueId = item.id + '-' + idx;
              const isExpanded = expandedItems[uniqueId];
              
              return (
                <div
                  key={uniqueId}
                  className={`group rounded-[2rem] border transition-all duration-300 ${
                    isExpanded 
                    ? 'border-blue-200 bg-white shadow-xl ring-4 ring-blue-50/50' 
                    : 'border-[#E4EDF7] bg-[#FAFCFF] hover:border-blue-100 hover:bg-white'
                  }`}
                  style={{ borderLeftWidth: "6px", borderLeftColor: item.tipo === 'consulta' ? '#1A3F72' : item.tipo === 'retorno' ? '#F59E0B' : '#64748B' }}
                >
                  <div 
                    onClick={() => {
                      if (isSpecificPatient) toggleExpand(uniqueId);
                      else abrirDetalheHistorico(item);
                    }}
                    className="p-5 cursor-pointer flex items-center gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-[#E4EDF7] flex flex-col items-center justify-center shadow-sm group-hover:border-blue-200 transition-colors">
                      <span className="text-xs font-black text-[#1A3F72] leading-none">
                        {safeFormat(item.dataRegistro, "dd")}
                      </span>
                      <span className="text-[9px] font-bold text-[#8FA8C4] uppercase">
                        {safeFormat(item.dataRegistro, "MMM")}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          item.tipo === 'consulta' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          item.tipo === 'retorno' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          item.tipo === 'exame' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                          'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          {item.categoria}
                        </span>
                        <span className="text-[10px] font-bold text-[#8FA8C4] flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {safeFormat(item.dataRegistro, "HH:mm")}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-black text-[#0F2242] truncate">
                        {item.titulo}
                      </h4>
                      <p className="text-[11px] text-[#5C7A9B] mt-0.5 line-clamp-1 italic">
                        {item.resumo || "Registro sem resumo."}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isSpecificPatient && (
                        <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-blue-600 text-white rotate-180' : 'bg-blue-50 text-blue-600'}`}>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      )}
                      {!isSpecificPatient && <ChevronRight className="h-4 w-4 text-[#C8D9ED] group-hover:text-[#1A3F72] transition-colors" />}
                    </div>
                  </div>

                  {isExpanded && isSpecificPatient && (
                    <div className="px-6 pb-6">
                      <RecordDetails record={item} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-[#F8FAFD] rounded-2xl border border-dashed border-[#C8D9ED]">
            <Activity className="h-12 w-12 text-[#C8D9ED] mb-4" />
            <h3 className="text-sm font-bold text-[#8FA8C4] uppercase tracking-widest text-center">
              {isSpecificPatient ? "Nenhum prontuário encontrado" : "Nenhum registro carregado"}
            </h3>
            <p className="text-xs text-[#8FA8C4] mt-2 text-center max-w-xs">
              {isSpecificPatient 
                ? "Este paciente ainda não possui evoluções clínicas registradas." 
                : "Busque o paciente por CPF para visualizar seu histórico médico completo."}
            </p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={dataToPaginate.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default FuncionarioHistoricoTab;
