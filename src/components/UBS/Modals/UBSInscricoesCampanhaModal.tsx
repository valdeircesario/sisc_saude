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
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3.5 h-3.5" /> Agendado
          </span>
        );
      case "confirmada":
      case "confirmado":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmado
          </span>
        );
      case "cancelada":
      case "cancelado":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelado
          </span>
        );
      case "inscrito":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Aguardando
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 capitalize">
            {status}
          </span>
        );
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade?.toLowerCase()) {
      case "alta":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-800 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" /> Alta Prioridade
          </span>
        );
      case "media":
      case "média":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-100 text-orange-800 uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" /> Média
          </span>
        );
      case "baixa":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-green-100 text-green-800 uppercase tracking-wider">
            Baixa
          </span>
        );
      default:
        if (!prioridade) return null;
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-gray-100 text-gray-800 uppercase tracking-wider">
            {prioridade}
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-900">
            Inscrições da Campanha
          </span>
          <span className="text-base font-normal text-gray-500 mt-1">
            {selectedCampanha?.titulo}
          </span>
        </div>
      }
      size="xl"
    >
      {inscricoesCampanha && inscricoesCampanha.length > 0 ? (
        <>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
              <button
                onClick={() => setFilter("todos")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "todos" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter("inscrito")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "inscrito" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Aguardando
              </button>
              <button
                onClick={() => setFilter("agendado")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "agendado" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Agendadas
              </button>
              <button
                onClick={() => setFilter("confirmado")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "confirmado" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Confirmadas
              </button>
              <button
                onClick={() => setFilter("realizado")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "realizado" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Realizadas
              </button>
              <button
                onClick={() => setFilter("cancelado")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "cancelado" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                Canceladas
              </button>
            </div>
            <div className="text-sm text-gray-500 whitespace-nowrap px-1">
              <span className="font-bold text-gray-900">
                {inscricoesFiltradas?.length || 0}
              </span>{" "}
              inscrições
            </div>
          </div>

          {inscricoesFiltradas && inscricoesFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inscricoesFiltradas.map((inscricao: any) => (
                <div
                  key={inscricao.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight">
                          {inscricao.nome}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <FileText className="w-3.5 h-3.5" /> {inscricao.cpf}
                          {inscricao.idade && (
                            <>
                              <span className="text-gray-300">•</span>
                              {inscricao.idade} anos
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                      {getStatusBadge(inscricao.status)}
                      {getPrioridadeBadge(inscricao.prioridade)}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <span>{inscricao.telefone || "Não informado"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate" title={inscricao.email}>
                          {inscricao.email || "Não informado"}
                        </span>
                      </div>
                      {inscricao.condicoesSaude && (
                        <div className="flex items-start gap-2 text-gray-700 mt-3 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                          <Activity className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                          <span className="text-rose-900 text-xs">
                            <span className="font-bold block mb-0.5">
                              Condições:
                            </span>
                            {inscricao.condicoesSaude}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 h-full flex flex-col justify-center">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        Dados do Agendamento
                      </p>
                      {inscricao.dataAgendada ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-gray-900 font-medium">
                            <Calendar className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <span className="leading-tight">
                              {format(
                                ajustarData(inscricao.dataAgendada),
                                "dd 'de' MMMM, yyyy",
                                { locale: ptBR },
                              )}
                              <br />
                              <span className="text-blue-600 font-bold">
                                {inscricao.horaAgendada &&
                                  `às ${inscricao.horaAgendada}`}
                              </span>
                            </span>
                          </div>
                          {inscricao.localAtendimento && (
                            <div className="flex items-start gap-2 text-gray-600 text-xs mt-2">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">
                                {inscricao.localAtendimento}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center gap-1.5 text-gray-400 italic py-2">
                          <Clock className="w-5 h-5 text-gray-300" />
                          <span className="text-xs">Aguardando definição</span>
                        </div>
                      )}

                      {inscricao.pontuacao !== undefined && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-medium">
                            Pontuação de risco:
                          </span>
                          <span className="font-black text-gray-900 bg-gray-200 px-2 py-0.5 rounded-md">
                            {inscricao.pontuacao} pts
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {inscricao.observacoes && (
                    <div className="mb-4 text-xs text-gray-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      <span className="font-bold text-amber-800">Obs: </span>
                      <span className="whitespace-pre-wrap">{inscricao.observacoes}</span>
                    </div>
                  )}

                  {actionState?.inscricao.id === inscricao.id ? (
                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                      <label className="text-sm font-bold text-gray-700">
                        {actionState.tipo === "cancelar" ? "Motivo do Cancelamento *" : "Observações (Opcional)"}
                      </label>
                      <textarea
                        value={observacaoText}
                        onChange={(e) => setObservacaoText(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={2}
                        placeholder={actionState.tipo === "cancelar" ? "Ex: Paciente não compareceu..." : "Ex: Vacinado com sucesso..."}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setActionState(null)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={handleConfirmAction}
                          disabled={cancelarMutation.isLoading || realizarMutation.isLoading || (actionState.tipo === "cancelar" && !observacaoText.trim())}
                          className={`px-4 py-2 text-white rounded-xl text-sm font-bold transition-colors shadow-sm ${
                            actionState.tipo === "cancelar"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                        >
                          {cancelarMutation.isLoading || realizarMutation.isLoading ? "Salvando..." : "Confirmar"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end gap-2 flex-wrap">
                      {inscricao.status === "inscrito" && (
                        <button
                          onClick={() => openAgendamentoCampanhaModal(inscricao)}
                          className="flex items-center px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
                        >
                          <Calendar className="w-4 h-4 mr-2" /> Agendar Paciente
                        </button>
                      )}
                      {(inscricao.status === "agendado" || inscricao.status === "confirmada" || inscricao.status === "confirmado") && (
                        <>
                          <button
                            onClick={() => {
                              setActionState({ tipo: "cancelar", inscricao });
                              setObservacaoText("");
                            }}
                            className="flex flex-1 items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-bold rounded-xl transition-colors sm:flex-none justify-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Cancelar
                          </button>
                          <button
                            onClick={() => {
                              setActionState({ tipo: "realizar", inscricao });
                              setObservacaoText("");
                            }}
                            className="flex flex-1 items-center px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-bold rounded-xl transition-colors sm:flex-none justify-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Realizada
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-900 font-bold text-lg">
                Nenhuma inscrição encontrada
              </p>
              <p className="text-gray-500 text-center max-w-sm mt-1">
                Não há pacientes com o status selecionado neste filtro.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-lg">
            Nenhuma inscrição encontrada
          </p>
          <p className="text-gray-500 text-center max-w-sm mt-1">
            Ainda não há pacientes inscritos para participar desta campanha no
            momento.
          </p>
        </div>
      )}
    </Modal>
  );
};
