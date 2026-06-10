import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";

const ajustarData = (dataStr: string) => {
  if (!dataStr) return new Date();
  const data = new Date(dataStr);
  return new Date(data.getTime() + data.getTimezoneOffset() * 60000);
};

const MinhasCampanhas = () => {
  const queryClient = useQueryClient();
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  const [filter, setFilter] = useState<
    "todas" | "agendamentos" | "inscricoes" | "canceladas" | "realizadas"
  >("todas");

  // Busca os agendamentos das campanhas
  const { data: agendamentos, isLoading } = useQuery("paciente-campanhas", () =>
    api.get("/paciente/campanhas").then((res) => res.data),
  );

  // Mutação para Confirmar
  const confirmarMutation = useMutation(
    (id: string) => api.put(`/paciente/agendamentos-campanha/${id}/confirmar`),
    {
      onSuccess: () => {
        toast.success("Sua presença foi confirmada com sucesso!");
        queryClient.invalidateQueries("paciente-campanhas");
        setShowModal(false);
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao confirmar agendamento.",
        );
      },
    },
  );

  // Mutação para Cancelar
  const cancelarMutation = useMutation(
    ({ id, justificativa }: { id: string; justificativa: string }) =>
      api.put(`/paciente/agendamentos-campanha/${id}/cancelar`, {
        justificativa,
      }),
    {
      onSuccess: () => {
        toast.success("Agendamento cancelado com sucesso.");
        queryClient.invalidateQueries("paciente-campanhas");
        setShowModal(false);
        setIsCanceling(false);
        setJustificativa("");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao cancelar agendamento.",
        );
      },
    },
  );

  const openDetalhes = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setIsCanceling(false);
    setJustificativa("");
    setShowModal(true);
  };

  const handleConfirmar = () => {
    if (selectedAgendamento) {
      confirmarMutation.mutate(selectedAgendamento.id);
    }
  };

  const handleCancelar = () => {
    if (!justificativa.trim()) {
      toast.error("Por favor, informe uma justificativa para o cancelamento.");
      return;
    }
    if (selectedAgendamento) {
      cancelarMutation.mutate({ id: selectedAgendamento.id, justificativa });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "agendado":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "confirmada":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelada":
        return "bg-red-100 text-red-700 border-red-200";
      case "realizada":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  const campanhasFiltradas = agendamentos?.filter((item: any) => {
    if (filter === "todas") return true;
    if (filter === "agendamentos") return item.tipo === "agendamento";
    if (filter === "inscricoes") return item.tipo === "inscricao";
    if (filter === "canceladas") return item.status === "cancelada";
    if (filter === "realizadas") return item.status === "realizada";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Minhas Campanhas</h2>
          <p className="text-gray-600 mt-1">
            Gerencie e acompanhe suas inscrições e agendamentos em campanhas de
            saúde.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilter("todas")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "todas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("agendamentos")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "agendamentos" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Agendadas
          </button>
          <button
            onClick={() => setFilter("inscricoes")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "inscricoes" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter("canceladas")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "canceladas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Canceladas
          </button>
          <button
            onClick={() => setFilter("realizadas")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "realizadas" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Realizadas
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {campanhasFiltradas?.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm flex flex-col items-center">
            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              Nenhuma campanha encontrada para este filtro.
            </p>
          </div>
        ) : (
          campanhasFiltradas?.map((agendamento: any) => (
            <div
              key={agendamento.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {agendamento.campanha.titulo}
                  </h3>
                  {agendamento.tipo === "agendamento" ? (
                    <>
                      <div className="flex items-center gap-2 mt-3 text-gray-600 font-medium">
                        <Calendar className="w-5 h-5 text-red-500" />
                        <span>
                          {format(
                            ajustarData(agendamento.dataAgendada),
                            "dd 'de' MMMM 'de' yyyy",
                            { locale: ptBR },
                          )}{" "}
                          às {agendamento.horaAgendada}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span>
                          {agendamento.localAtendimento} -{" "}
                          {agendamento.ubs.nome}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 mt-3 text-gray-600 font-medium">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span>Aguardando agendamento pela unidade de saúde</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end justify-between gap-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize border ${getStatusColor(agendamento.status)}`}
                  >
                    {agendamento.status}
                  </span>

                  {/* Botão disponível para status "agendado", "cancelada" ou "realizada" */}
                  {["agendado", "cancelada", "realizada"].includes(agendamento.status) && (
                    <button
                      onClick={() => openDetalhes(agendamento)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl transition-colors font-semibold shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes e Ações */}
      <AnimatePresence>
        {showModal && selectedAgendamento && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Ações do Agendamento
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 -mr-2 -mt-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Campanha</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">
                    {selectedAgendamento.campanha.titulo}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Data</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      {format(
                        ajustarData(selectedAgendamento.dataAgendada),
                        "dd/MM/yyyy",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Horário</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      {selectedAgendamento.horaAgendada}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-500 font-medium">
                    Local de Atendimento
                  </p>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span>
                      {selectedAgendamento.localAtendimento} (
                      {selectedAgendamento.ubs.nome})
                    </span>
                  </p>
                </div>

                {selectedAgendamento.justificativa && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Motivo / Justificativa
                    </p>
                    <p className="text-gray-800 bg-white p-3 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap">
                      {selectedAgendamento.justificativa}
                    </p>
                  </div>
                )}
                {selectedAgendamento.observacoes && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Observações da Unidade
                    </p>
                    <p className="text-gray-800 bg-white p-3 rounded-xl border border-gray-200 text-sm whitespace-pre-wrap">
                      {selectedAgendamento.observacoes}
                    </p>
                  </div>
                )}
              </div>

              {/* Botões de Ação Condicionais */}
              {!isCanceling ? (
                <div className="flex flex-col gap-3">
                  {selectedAgendamento.status === "agendado" && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setIsCanceling(true)}
                        className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" /> Cancelar
                      </button>
                      <button
                        onClick={handleConfirmar}
                        disabled={confirmarMutation.isLoading}
                        className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {confirmarMutation.isLoading
                          ? "Confirmando..."
                          : "Confirmar Presença"}
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                  >
                    {selectedAgendamento.status === "agendado" ? "Fechar e decidir depois" : "Fechar"}
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                    <label className="flex items-center gap-2 text-sm font-bold text-red-900 mb-3">
                      <AlertCircle className="w-5 h-5" />
                      Justificativa do cancelamento:
                    </label>
                    <textarea
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value)}
                      placeholder="Ex: Surgiu um imprevisto inadiável no trabalho..."
                      className="w-full p-4 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm bg-white"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsCanceling(false)}
                      className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleCancelar}
                      disabled={
                        cancelarMutation.isLoading || !justificativa.trim()
                      }
                      className="flex-[2] py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center shadow-md"
                    >
                      {cancelarMutation.isLoading
                        ? "Cancelando..."
                        : "Confirmar Cancelamento"}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MinhasCampanhas;