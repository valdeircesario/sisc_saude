import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Activity,
  MapPin,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Megaphone,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import { Modal } from "./UBSModalBase";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { api } from "../../../services/api";

const ajustarData = (dataStr: string) => {
  if (!dataStr) return new Date();
  const data = new Date(dataStr);
  return new Date(data.getTime() + data.getTimezoneOffset() * 60000);
};

export const UBSInscricoesCampanhaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedCampanha: any;
  inscricoesCampanha: any[];
  openAgendamentoCampanhaModal: (inscricao: any) => void;
}> = ({
  isOpen,
  onClose,
  selectedCampanha,
  inscricoesCampanha,
  openAgendamentoCampanhaModal,
}) => {
  const [filter, setFilter] = useState<
    "todos" | "inscrito" | "agendado" | "confirmado" | "cancelado" | "realizado"
  >("todos");

  const queryClient = useQueryClient();
  const [actionState, setActionState] = useState<{ tipo: "cancelar" | "realizar", inscricao: any } | null>(null);
  const [observacaoText, setObservacaoText] = useState("");

  const cancelarMutation = useMutation(
    ({ id, justificativa }: { id: string; justificativa: string }) =>
      api.put(`/ubs/agendamentos-campanha/${id}/cancelar`, { justificativa }),
    {
      onSuccess: () => {
        toast.success("Agendamento cancelado com sucesso!");
        queryClient.invalidateQueries();
        setActionState(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Erro ao cancelar agendamento");
      },
    }
  );

  const realizarMutation = useMutation(
    ({ id, observacoes }: { id: string; observacoes: string }) =>
      api.put(`/ubs/agendamentos-campanha/${id}/realizar`, { observacoes }),
    {
      onSuccess: () => {
        toast.success("Atendimento marcado como realizado!");
        queryClient.invalidateQueries();
        setActionState(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Erro ao marcar como realizado");
      },
    }
  );

  const handleConfirmAction = () => {
    if (!actionState) return;
    
    const agendamentoId = actionState.inscricao.agendamento?.id;
    if (!agendamentoId) {
      toast.error("ID do agendamento não encontrado. O calendário pode estar desatualizado.");
      return;
    }

    if (actionState.tipo === "cancelar") {
      if (!observacaoText.trim()) {
        toast.error("A observação é obrigatória para o cancelamento.");
        return;
      }
      cancelarMutation.mutate({ id: agendamentoId, justificativa: observacaoText });
    } else {
      realizarMutation.mutate({ id: agendamentoId, observacoes: observacaoText });
    }
  };

  const inscricoesFiltradas = inscricoesCampanha?.filter((inscricao: any) => {
    if (filter === "todos") return true;
    const status = inscricao.status?.toLowerCase() || "";
    
    if (filter === "confirmado") {
      return status === "confirmado" || status === "confirmada";
    }
    if (filter === "cancelado") {
      return status === "cancelado" || status === "cancelada";
    }
    if (filter === "realizado") {
      return status === "realizado" || status === "realizada";
    }
    
    return status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "agendado":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
            <Calendar className="w-3 h-3" /> Agendado
          </span>
        );
      case "confirmada":
      case "confirmado":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3 h-3" /> Confirmado
          </span>
        );
      case "cancelada":
      case "cancelado":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
      case "inscrito":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-3 h-3" /> Aguardando
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade?.toLowerCase()) {
      case "alta":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-100 text-rose-800 uppercase tracking-tight">
            <AlertTriangle className="w-3 h-3" /> Alta Prioridade
          </span>
        );
      case "media":
      case "média":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-800 uppercase tracking-tight">
            <AlertCircle className="w-3 h-3" /> Prioridade Média
          </span>
        );
      case "baixa":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-tight">
            Prioridade Baixa
          </span>
        );
      default:
        if (!prioridade) return null;
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-800 uppercase tracking-tight">
            {prioridade}
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestão de Inscrições"
      size="xl"
    >
      <div className="space-y-8">
        {/* Campaign Brief Header */}
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[24px]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-100 flex-shrink-0">
              <Megaphone className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-none">Campanha Ativa</p>
              <h4 className="text-lg font-black text-slate-900 mt-1 truncate">
                {selectedCampanha?.titulo}
              </h4>
            </div>
          </div>
        </div>

        {inscricoesCampanha && inscricoesCampanha.length > 0 ? (
          <>
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
              <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
                {["todos", "inscrito", "agendado", "confirmado", "realizado", "cancelado"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`
                      px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                      ${filter === f 
                        ? "bg-teal-600 text-white shadow-md shadow-teal-100" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    {f === "inscrito" ? "Aguardando" : f === "todos" ? "Todas" : f + "s"}
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                Total Localizado: <span className="text-teal-600">{inscricoesFiltradas?.length || 0}</span>
              </div>
            </div>

            {inscricoesFiltradas && inscricoesFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {inscricoesFiltradas.map((inscricao: any) => (
                  <div
                    key={inscricao.id}
                    className="group relative bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
                  >
                    {/* Header: Identity & Status */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:bg-teal-600 transition-colors duration-300">
                          <User className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 text-base leading-tight group-hover:text-teal-700 transition-colors">
                            {inscricao.nome}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> {inscricao.cpf}
                            </span>
                            {inscricao.idade && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-black text-slate-500 uppercase">
                                {inscricao.idade} Anos
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {getStatusBadge(inscricao.status)}
                        {getPrioridadeBadge(inscricao.prioridade)}
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          {inscricao.telefone || "Não informado"}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <span className="truncate" title={inscricao.email}>{inscricao.email || "—"}</span>
                        </div>
                        
                        {inscricao.condicoesSaude && (
                          <div className="mt-4 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 uppercase mb-1">
                              <Activity className="w-3 h-3" /> Condições de Saúde
                            </div>
                            <p className="text-[11px] text-rose-900 leading-tight font-medium italic">"{inscricao.condicoesSaude}"</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50/80 p-4 rounded-[20px] border border-slate-100 flex flex-col">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Programação</p>
                        {inscricao.dataAgendada ? (
                          <div className="space-y-3">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0">
                                <Calendar className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="text-[11px] font-black text-slate-900 leading-none mt-1">
                                  {format(ajustarData(inscricao.dataAgendada), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                </p>
                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter mt-1">
                                  {inscricao.horaAgendada ? `Horário: ${inscricao.horaAgendada}` : "Horário Pendente"}
                                </p>
                              </div>
                            </div>
                            {inscricao.localAtendimento && (
                              <div className="flex items-start gap-2 text-[10px] font-medium text-slate-500 bg-white/50 p-2 rounded-lg border border-slate-100">
                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{inscricao.localAtendimento}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-slate-200" />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aguardando Triagem</span>
                          </div>
                        )}

                        {inscricao.pontuacao !== undefined && (
                          <div className="mt-auto pt-3 border-t border-slate-200/50 flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Escore de Risco:</span>
                            <span className="text-[11px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                              {inscricao.pontuacao} pts
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Observações Alert */}
                    {inscricao.observacoes && (
                      <div className="mb-6 text-[11px] text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 leading-relaxed">
                        <span className="font-black text-amber-800 uppercase text-[9px] tracking-widest block mb-1">Nota da Recepção:</span>
                        <span className="font-medium italic">"{inscricao.observacoes}"</span>
                      </div>
                    )}

                    {/* Footer Actions / Inline Action Form */}
                    {actionState?.inscricao.id === inscricao.id ? (
                      <div className="mt-auto pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {actionState.tipo === "cancelar" ? "Justificativa do Cancelamento *" : "Observações do Procedimento"}
                          </label>
                          <textarea
                            value={observacaoText}
                            onChange={(e) => setObservacaoText(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-medium placeholder:text-slate-300 min-h-[80px] resize-none"
                            placeholder={actionState.tipo === "cancelar" ? "Informe o motivo técnico ou ausência..." : "Registre detalhes da realização..."}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setActionState(null)}
                              className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                              Voltar
                            </button>
                            <button
                              onClick={handleConfirmAction}
                              disabled={cancelarMutation.isLoading || realizarMutation.isLoading || (actionState.tipo === "cancelar" && !observacaoText.trim())}
                              className={`
                                px-8 py-3 text-[10px] font-black text-white uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95
                                ${actionState.tipo === "cancelar"
                                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-900/10"
                                  : "bg-teal-600 hover:bg-teal-700 shadow-teal-900/10"
                                }
                              `}
                            >
                              {cancelarMutation.isLoading || realizarMutation.isLoading ? "Processando..." : "Efetivar Ação"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto pt-6 border-t border-slate-100 flex justify-end gap-2 flex-wrap">
                        {inscricao.status === "inscrito" && (
                          <button
                            onClick={() => openAgendamentoCampanhaModal(inscricao)}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[18px] hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 sm:flex-none sm:px-10"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Realizar Agendamento
                          </button>
                        )}
                        {(inscricao.status === "agendado" || inscricao.status === "confirmada" || inscricao.status === "confirmado") && (
                          <>
                            <button
                              onClick={() => {
                                setActionState({ tipo: "cancelar", inscricao });
                                setObservacaoText("");
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-[18px] border border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancelar
                            </button>
                            <button
                              onClick={() => {
                                setActionState({ tipo: "realizar", inscricao });
                                setObservacaoText("");
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-[18px] border border-teal-100 hover:bg-teal-600 hover:text-white transition-all active:scale-95"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Realizada
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center px-6">
                  Nenhum registro localizado para este filtro
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] border border-dashed border-slate-200">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-slate-100" />
            </div>
            <h5 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">Sem Inscrições Ativas</h5>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center max-w-sm px-6">
              Ainda não há pacientes aguardando triagem para esta campanha.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
