import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export const useLaboratorioDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("solicitacoes");
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showResultadoModal, setShowResultadoModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<any>(null);
  const [selectedExame, setSelectedExame] = useState<any>(null);

  const [agendamentoData, setAgendamentoData] = useState({
    dataAgendada: "",
  });

  const [resultadoData, setResultadoData] = useState({
    resultado: "",
    arquivo: null as File | null,
  });

  // Queries
  const { data: rawSolicitacoes, isLoading: loadingSolicitacoes } = useQuery(
    "laboratorio-solicitacoes",
    () => api.get("/laboratorio/solicitacoes").then((res) => res.data),
    { enabled: activeTab === "solicitacoes" }
  );

  const solicitacoes = useMemo(() => {
    return rawSolicitacoes?.filter((s: any) => s.status === "pendente") || [];
  }, [rawSolicitacoes]);

  const { data: exames, isLoading: loadingExames } = useQuery(
    "laboratorio-exames",
    () => api.get("/laboratorio/exames").then((res) => res.data),
    { enabled: activeTab === "exames" }
  );

  // Mutations
  const agendarExameMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/laboratorio/solicitacoes/${id}/agendar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("laboratorio-solicitacoes");
        queryClient.invalidateQueries("laboratorio-exames");
        toast.success("Exame agendado com sucesso!");
        setShowAgendamentoModal(false);
        setSelectedSolicitacao(null);
        resetAgendamentoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao agendar exame");
      },
    }
  );

  const registrarResultadoMutation = useMutation(
    ({ id, formData }: { id: string; formData: FormData }) =>
      api.put(`/laboratorio/exames/${id}/resultado`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("laboratorio-exames");
        toast.success("Resultado registrado com sucesso!");
        setShowResultadoModal(false);
        setSelectedExame(null);
        resetResultadoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao registrar resultado"
        );
      },
    }
  );

  const resetAgendamentoForm = () => {
    setAgendamentoData({
      dataAgendada: "",
    });
  };

  const resetResultadoForm = () => {
    setResultadoData({
      resultado: "",
      arquivo: null,
    });
  };

  const handleAgendamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSolicitacao) {
      agendarExameMutation.mutate({
        id: selectedSolicitacao.id,
        data: agendamentoData,
      });
    }
  };

  const handleResultadoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExame) {
      const formData = new FormData();
      formData.append("resultado", resultadoData.resultado);
      if (resultadoData.arquivo) {
        formData.append("arquivo", resultadoData.arquivo);
      }

      registrarResultadoMutation.mutate({
        id: selectedExame.id,
        formData,
      });
    }
  };

  const openAgendamentoModal = (solicitacao: any) => {
    setSelectedSolicitacao(solicitacao);
    setShowAgendamentoModal(true);
  };

  const openResultadoModal = (exame: any) => {
    setSelectedExame(exame);
    setResultadoData({
      resultado: exame.resultado || "",
      arquivo: null,
    });
    setShowResultadoModal(true);
  };

  return {
    user,
    logout,
    activeTab,
    setActiveTab,
    solicitacoes,
    loadingSolicitacoes,
    exames,
    loadingExames,
    showAgendamentoModal,
    setShowAgendamentoModal,
    selectedSolicitacao,
    setSelectedSolicitacao,
    agendamentoData,
    setAgendamentoData,
    handleAgendamentoSubmit,
    resetAgendamentoForm,
    showResultadoModal,
    setShowResultadoModal,
    selectedExame,
    setSelectedExame,
    resultadoData,
    setResultadoData,
    handleResultadoSubmit,
    resetResultadoForm,
    openAgendamentoModal,
    openResultadoModal,
  };
};
