import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, Printer, Calendar, AlertCircle, CheckCircle, FileText, ChevronDown, ChevronUp, Stethoscope, Pill, ClipboardList, Clock } from "lucide-react";
import { generateHistoricoMedicoPDF } from "../../utils/pdfGenerator";

interface PacienteHistoricoTabProps {
  historicoMedico: any[];
  perfil: any;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteHistoricoTab: React.FC<PacienteHistoricoTabProps> = ({
  historicoMedico,
  perfil,
  SectionHeader,
  EmptyState,
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const safeFormat = (dateValue: any, formatStr: string) => {
    if (!dateValue) return "—";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "—";
    return format(date, formatStr, { locale: ptBR });
  };

  const RecordDetails = ({ record }: { record: any }) => {
    const data = record.detalhes;
    if (!data) return null;

    return (
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Evolução Clínica */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="h-4 w-4 text-teal-600" />
            <h5 className="text-[10px] font-black uppercase text-teal-800 tracking-wider">Evolução Clínica</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Diagnóstico</p>
              <p className="text-sm font-bold text-slate-700">{data.historicoMedico?.diagnostico || data.diagnostico || "—"}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Doença / CID</p>
              <p className="text-sm font-bold text-slate-700">{data.historicoMedico?.doenca || data.doenca || "—"}</p>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Laudo Médico</p>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{data.historicoMedico?.laudo || data.laudo || "Sem laudo registrado."}</p>
          </div>
        </div>

        {/* Receita */}
        {data.receita && (
          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-blue-600" />
                <h5 className="text-[10px] font-black uppercase text-blue-800 tracking-wider">Receita Digital</h5>
              </div>
            </div>
            <div className="space-y-2">
              {data.receita.itens?.map((item: any, i: number) => (
                <div key={i} className="bg-white rounded-lg p-2.5 border border-blue-50 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{item.medicamento}</p>
                    <p className="text-[9px] text-blue-600 font-medium">{item.dosagem} • {item.posologia || "Conforme bula"}</p>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">Qtd: {item.quantidade}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Atestado */}
        {data.atestado && (
          <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-4 w-4 text-purple-600" />
              <h5 className="text-[10px] font-black uppercase text-purple-800 tracking-wider">Atestado Médico</h5>
            </div>
            <p className="text-xs font-bold text-purple-900 leading-relaxed italic">
              "Afastamento de {data.atestado.diasRepouso} dias. Motivo: {data.atestado.descricao}"
            </p>
          </div>
        )}

        {/* Retornos Vinculados */}
        {data.retornos && data.retornos.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-[1px] flex-1 bg-slate-100" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Retornos de Acompanhamento</span>
              <div className="h-[1px] flex-1 bg-slate-100" />
            </div>
            {data.retornos.map((ret: any, i: number) => (
              <div key={i} className="bg-amber-50/40 rounded-xl p-3 border border-amber-100/50 ml-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Retorno Concluído</span>
                  <span className="text-[9px] font-bold text-slate-400">{safeFormat(ret.dataRetorno, "dd/MM/yyyy")}</span>
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-relaxed mb-1">{ret.laudo || "Acompanhamento clínico."}</p>
                {ret.receita && (
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600">
                    <Pill className="h-3 w-3" /> Receita emitida no retorno
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-sm">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Prontuário Digital</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Histórico completo de atendimentos</p>
            </div>
          </div>
          {historicoMedico && historicoMedico.length > 0 && (
            <button
              onClick={() => generateHistoricoMedicoPDF(historicoMedico, perfil)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-teal-100 hover:bg-teal-700 hover:-translate-y-0.5 transition-all"
            >
              <Printer className="h-4 w-4" /> Exportar PDF Completo
            </button>
          )}
        </div>

        {historicoMedico && historicoMedico.length > 0 ? (
          <div className="space-y-6">
            {historicoMedico.map((item: any) => {
              const uniqueId = item.id;
              const isExpanded = expandedItems[uniqueId];
              const isRetorno = item.tipo === 'retorno';

              return (
                <div
                  key={uniqueId}
                  className={`rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                    ? 'border-teal-200 bg-white shadow-xl ring-4 ring-teal-50/50' 
                    : 'border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md'
                  }`}
                  style={{ borderLeftWidth: "6px", borderLeftColor: isRetorno ? '#F59E0B' : '#0D9488' }}
                >
                  <div 
                    onClick={() => toggleExpand(uniqueId)}
                    className="p-6 cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex gap-4 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-xs font-black text-slate-800 leading-none">
                            {safeFormat(item.dataRegistro, "dd")}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {safeFormat(item.dataRegistro, "MMM")}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              isRetorno ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-teal-50 text-teal-700 border-teal-100'
                            }`}>
                              {item.categoria}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {safeFormat(item.dataRegistro, "HH:mm")}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-slate-800 truncate">
                            {item.titulo}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic font-medium">
                            {item.resumo || "Clique para ver detalhes do atendimento."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-black text-slate-700">{item.detalhes?.funcionario?.nome || "Médico Sisc"}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{item.detalhes?.ubs?.nome || "Unidade de Saúde"}</p>
                        </div>
                        <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-teal-600 text-white rotate-180 shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {isExpanded && <RecordDetails record={item} />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            message="Nenhum atendimento registrado no seu prontuário digital."
          />
        )}
      </div>
    </div>
  );
};
