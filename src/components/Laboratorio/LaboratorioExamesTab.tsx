import React from "react";
import { Download, FileText, Calendar, Clock, FlaskConical, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExamesTabProps {
  loading: boolean;
  exames: any[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  onOpenResultado: (exame: any) => void;
}

export const LaboratorioExamesTab: React.FC<ExamesTabProps> = ({
  loading,
  exames,
  getStatusColor,
  getStatusIcon,
  onOpenResultado,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestão de Exames
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Controle de realização e emissão de laudos técnicos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
               <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Concluídos</p>
               <p className="text-xl font-black text-emerald-700">{exames?.filter(e => e.status === 'realizado').length || 0}</p>
            </div>
            <div className="bg-sky-50 px-4 py-2 rounded-xl border border-sky-100">
               <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Agendados</p>
               <p className="text-xl font-black text-sky-700">{exames?.filter(e => e.status === 'agendado').length || 0}</p>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Carregando base de exames...</p>
        </div>
      ) : exames && exames.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {exames?.map((exame: any) => (
            <div 
              key={exame.id} 
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-sky-100"
            >
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {/* Lado Esquerdo: Info Principal */}
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-sky-100 transition-colors">
                            <FlaskConical className="h-5 w-5 text-slate-500 group-hover:text-sky-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{exame.tipo}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(exame.status)}`}>
                                    {getStatusIcon(exame.status)}
                                    {exame.status}
                                </span>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        {exame.paciente.nome}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500 ml-3.5">
                        <span>CPF: {exame.paciente.cpf}</span>
                        <span>Tel: {exame.paciente.telefone}</span>
                    </div>
                  </div>
                </div>

                {/* Centro: Datas */}
                <div className="w-full md:w-64 p-5 bg-slate-50/50 flex flex-col justify-center space-y-3">
                  {exame.dataAgendada && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agendado para</p>
                        <p className="text-xs font-bold text-slate-700">
                          {format(new Date(exame.dataAgendada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {exame.dataRealizado && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Realizado em</p>
                        <p className="text-xs font-bold text-slate-700">
                          {format(new Date(exame.dataRealizado), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lado Direito: Ações e Resultado */}
                <div className="w-full md:w-72 p-5 flex flex-col justify-center gap-3 bg-white">
                  {exame.resultado && (
                    <div className="mb-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resultado Parcial</p>
                       <p className="text-xs text-slate-600 font-medium line-clamp-2 italic">"{exame.resultado}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 mt-auto">
                    {exame.status === 'agendado' && (
                      <button
                        onClick={() => onOpenResultado(exame)}
                        className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Registrar Laudo
                      </button>
                    )}
                    
                    {exame.arquivoPdf && (
                      <a
                        href={`http://localhost:3001/api/exames/download/${exame.arquivoPdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar Laudo PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200 p-16 text-center">
          <FlaskConical className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Nenhum exame encontrado</h3>
          <p className="text-slate-400 font-medium mt-2">Aguardando realização de novos procedimentos.</p>
        </div>
      )}
    </div>
  );
};
