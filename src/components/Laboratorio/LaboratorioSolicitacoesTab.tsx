import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Phone, Clipboard, Calendar, Building2 } from "lucide-react";

interface SolicitacoesTabProps {
  loading: boolean;
  solicitacoes: any[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  onOpenAgendamento: (solicitacao: any) => void;
}

export const LaboratorioSolicitacoesTab: React.FC<SolicitacoesTabProps> = ({
  loading,
  solicitacoes,
  getStatusColor,
  getStatusIcon,
  onOpenAgendamento,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Solicitações de Exame
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Triagem e agendamento de novos pedidos médicos
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pendente</p>
           <p className="text-xl font-black text-sky-600">{solicitacoes?.filter(s => s.status === 'pendente').length || 0}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium italic">Sincronizando banco de dados...</p>
        </div>
      ) : solicitacoes && solicitacoes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {solicitacoes?.map((solicitacao: any) => (
            <div
              key={solicitacao.id}
              className="group bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-200"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-3 shadow-sm border"
                           style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                        <Clipboard className="h-3 w-3" />
                        ID: {solicitacao.id.substring(0, 8).toUpperCase()}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {solicitacao.tipoExame}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${getStatusColor(
                        solicitacao.status
                      )}`}
                    >
                      {getStatusIcon(solicitacao.status)}
                      {solicitacao.status}
                    </span>
                  </div>

                  {/* Informações do Paciente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-sky-50/50 group-hover:border-sky-100 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <User className="h-3 w-3" /> Paciente
                      </div>
                      <p className="text-sm font-bold text-slate-700">{solicitacao.paciente.nome}</p>
                      <p className="text-xs font-medium text-slate-500">CPF: {solicitacao.paciente.cpf}</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Phone className="h-3 w-3" /> Contato
                      </div>
                      <p className="text-sm font-bold text-slate-700">{solicitacao.paciente.telefone}</p>
                      <p className="text-xs font-medium text-slate-500">{solicitacao.paciente.email || 'Nenhum e-mail'}</p>
                    </div>
                  </div>

                  {/* Detalhes da Solicitação */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-sky-100 transition-colors">
                        <Building2 className="h-4 w-4 text-slate-500 group-hover:text-sky-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solicitado por</p>
                        <p className="text-sm font-bold text-slate-700">{solicitacao.funcionario.nome}</p>
                        <p className="text-xs font-medium text-slate-500">{solicitacao.funcionario.ubs.nome}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-sky-100 transition-colors">
                        <Calendar className="h-4 w-4 text-slate-500 group-hover:text-sky-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data do Pedido</p>
                        <p className="text-sm font-bold text-slate-700">
                          {format(new Date(solicitacao.createdAt), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          às {format(new Date(solicitacao.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {solicitacao.observacoes && (
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Observações Médicas</p>
                      <p className="text-xs text-amber-800 leading-relaxed font-medium italic">"{solicitacao.observacoes}"</p>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col justify-end items-center gap-3">
                  {solicitacao.status === "pendente" ? (
                    <button
                      onClick={() => onOpenAgendamento(solicitacao)}
                      className="w-full lg:w-40 px-6 py-3 bg-sky-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-200 hover:bg-sky-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Agendar Exame
                    </button>
                  ) : (
                    <div className="w-full lg:w-40 px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed">
                       Status: {solicitacao.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200 p-16 text-center">
          <Clipboard className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Nenhuma solicitação encontrada</h3>
          <p className="text-slate-400 font-medium mt-2">Novos pedidos aparecerão automaticamente nesta lista.</p>
        </div>
      )}
    </div>
  );
};
