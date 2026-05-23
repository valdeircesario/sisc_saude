import React, { useMemo, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Users,
  Heart,
  Shield,
  FileText,
  LogOut,
  Plus,
  Search,
  Save,
  Send,
  Pill,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const FuncionarioDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("pacientes");
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showVacinaModal, setShowVacinaModal] = useState(false);
  const [showExameModal, setShowExameModal] = useState(false);
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [medSearchTerm, setMedSearchTerm] = useState("");
  const [solicitacoesFiltroPaciente, setSolicitacoesFiltroPaciente] =
    useState("");
  const [solicitacoesFiltroTipo, setSolicitacoesFiltroTipo] = useState("todos");
  const [editingMed, setEditingMed] = useState<any>(null);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [selectedAdminPaciente, setSelectedAdminPaciente] = useState<any>(null);
  const [
    showAdministradorMedicamentoModal,
    setShowAdministradorMedicamentoModal,
  ] = useState(false);
  const [medData, setMedData] = useState({
    quantidade: "",
    dataValidade: "",
    observacoes: "",
  });
  const [administracaoData, setAdministracaoData] = useState({
    pacienteCns: "",
    quantidade: "",
    dataRetirada: new Date().toISOString().slice(0, 16),
    observacoes: "",
  });

  const [historicoData, setHistoricoData] = useState({
    laudo: "",
    doenca: "",
    diagnostico: "",
    medicacao: "",
    observacoes: "",
    dataConsulta: new Date().toISOString().split("T")[0],
  });

  const [vacinaData, setVacinaData] = useState({
    nome: "",
    lote: "",
    dataApl: new Date().toISOString().split("T")[0],
    proximaDose: "",
  });

  const [exameData, setExameData] = useState({
    laboratorioId: "",
    tipoExame: "",
    observacoes: "",
  });

  const [internacaoData, setInternacaoData] = useState({
    hospitalId: "",
    tipo: "",
    motivo: "",
    detalhes: "",
    laudoMedico: "",
    prioridade: "medio",
    observacoes: "",
  });

  // Queries
  const { data: pacientes, isLoading: loadingPacientes } = useQuery(
    ["funcionario-pacientes", searchTerm],
    () =>
      api
        .get(`/funcionario/pacientes?busca=${searchTerm}`)
        .then((res) => res.data),
    { enabled: activeTab === "pacientes" },
  );

  const { data: historicoPaciente } = useQuery(
    ["paciente-historico", selectedPaciente?.id],
    () =>
      api
        .get(`/funcionario/pacientes/${selectedPaciente.id}/historico`)
        .then((res) => res.data),
    { enabled: !!selectedPaciente && activeTab === "historico" },
  );

  const { data: laboratorios } = useQuery(
    "funcionario-laboratorios",
    () => api.get("/funcionario/laboratorios").then((res) => res.data),
    { enabled: showExameModal },
  );

  const {
    data: hospitais,
    isLoading: loadingHospitais,
    isError: hospitaisError,
  } = useQuery(
    "funcionario-hospitais",
    () => api.get("/funcionario/hospitais").then((res) => res.data),
    { enabled: showInternacaoModal },
  );

  const { data: minhasSolicitacoes } = useQuery(
    "minhas-solicitacoes",
    () => api.get("/funcionario/minhas-solicitacoes").then((res) => res.data),
    { enabled: activeTab === "solicitacoes" },
  );

  const pacientesSolicitacoes = useMemo(() => {
    const map = new Map<string, string>();

    minhasSolicitacoes?.forEach((solicitacao: any) => {
      const pacienteId =
        solicitacao.paciente?.id || solicitacao.paciente?.nome || "";
      if (pacienteId && !map.has(pacienteId)) {
        map.set(
          pacienteId,
          solicitacao.paciente?.nome || "Paciente desconhecido",
        );
      }
    });

    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [minhasSolicitacoes]);

  const filteredSolicitacoes = useMemo(
    () =>
      minhasSolicitacoes?.filter((solicitacao: any) => {
        const pacienteNome = solicitacao.paciente?.nome || "";
        const query = solicitacoesFiltroPaciente.trim().toLowerCase();
        const matchesPaciente = query
          ? pacienteNome.toLowerCase().includes(query)
          : true;
        const matchesTipo =
          solicitacoesFiltroTipo === "todos" ||
          solicitacao.solicitacaoTipo === solicitacoesFiltroTipo;

        return matchesPaciente && matchesTipo;
      }) || [],
    [minhasSolicitacoes, solicitacoesFiltroPaciente, solicitacoesFiltroTipo],
  );

  const { data: consultas } = useQuery(
    "funcionario-consultas",
    () => api.get("/funcionario/consultas").then((res) => res.data),
    { enabled: activeTab === "consultas" },
  );

  // Mutations
  const createHistoricoMutation = useMutation(
    (data: any) => api.post("/funcionario/historico-medico", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          "paciente-historico",
          selectedPaciente?.id,
        ]);
        toast.success("Histórico médico registrado com sucesso!");
        setShowHistoricoModal(false);
        resetHistoricoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao registrar histórico médico",
        );
      },
    },
  );

  const createVacinaMutation = useMutation(
    (data: any) => api.post("/funcionario/vacinas", data),
    {
      onSuccess: () => {
        toast.success("Vacina registrada com sucesso!");
        setShowVacinaModal(false);
        resetVacinaForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao registrar vacina",
        );
      },
    },
  );

  const solicitarExameMutation = useMutation(
    (data: any) => api.post("/funcionario/solicitar-exame", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("minhas-solicitacoes");
        toast.success("Solicitação de exame enviada com sucesso!");
        setShowExameModal(false);
        resetExameForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao solicitar exame");
      },
    },
  );

  const solicitarInternacaoMutation = useMutation(
    (data: any) => api.post("/funcionario/solicitacoes-internacao", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("minhas-solicitacoes");
        toast.success("Solicitação de internação enviada com sucesso!");
        setShowInternacaoModal(false);
        resetInternacaoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao solicitar internação",
        );
      },
    },
  );

  const { data: medicamentosDaUbs, isLoading: loadingMedicamentos } = useQuery(
    ["funcionario-medicamentos", searchTerm],
    () =>
      api
        .get(
          `/funcionario/medicamentos?busca=${encodeURIComponent(searchTerm)}`,
        )
        .then((res) => res.data),
    {
      enabled:
        activeTab === "medicamentos" || showAdministradorMedicamentoModal,
    },
  );

  const { data: pacientesForMed, isLoading: loadingPacientesForMed } = useQuery(
    ["funcionario-pacientes-para-medicamentos", searchTerm],
    () =>
      api
        .get(`/funcionario/pacientes?busca=${encodeURIComponent(searchTerm)}`)
        .then((res) => res.data),
    { enabled: activeTab === "medicamentos" || selectedMed !== null },
  );

  const filteredMedicamentos = medicamentosDaUbs?.filter((med: any) =>
    med.nome?.toLowerCase().includes(medSearchTerm.trim().toLowerCase()),
  );

  const updateMedicamentoMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/funcionario/medicamentos/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["funcionario-medicamentos"]);
        toast.success("Medicamento atualizado com sucesso!");
        resetMedForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar medicamento",
        );
      },
    },
  );

  const administrarMedicamentoMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.post(`/funcionario/medicamentos/${id}/administrar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["funcionario-medicamentos"]);
        toast.success("Medicação ministrada com sucesso!");
        setSelectedMed(null);
        resetAdministracaoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao ministrar medicação",
        );
      },
    },
  );

  const resetHistoricoForm = () => {
    setHistoricoData({
      laudo: "",
      doenca: "",
      diagnostico: "",
      medicacao: "",
      observacoes: "",
      dataConsulta: new Date().toISOString().split("T")[0],
    });
  };

  const resetVacinaForm = () => {
    setVacinaData({
      nome: "",
      lote: "",
      dataApl: new Date().toISOString().split("T")[0],
      proximaDose: "",
    });
  };

  const resetExameForm = () => {
    setExameData({
      laboratorioId: "",
      tipoExame: "",
      observacoes: "",
    });
  };

  const resetInternacaoForm = () => {
    setInternacaoData({
      hospitalId: "",
      tipo: "",
      motivo: "",
      detalhes: "",
      laudoMedico: "",
      prioridade: "medio",
      observacoes: "",
    });
  };

  const resetMedForm = () => {
    setMedData({
      quantidade: "",
      dataValidade: "",
      observacoes: "",
    });
    setEditingMed(null);
  };

  const resetAdministracaoForm = () => {
    setAdministracaoData({
      pacienteCns: "",
      quantidade: "",
      dataRetirada: new Date().toISOString().slice(0, 16),
      observacoes: "",
    });
    setSelectedMed(null);
    setSelectedAdminPaciente(null);
    setShowAdministradorMedicamentoModal(false);
  };

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) {
      return;
    }

    updateMedicamentoMutation.mutate({
      id: editingMed.id,
      data: {
        quantidade: Number(medData.quantidade),
        dataValidade: medData.dataValidade,
        observacoes: medData.observacoes,
      },
    });
  };

  const handleAdministrarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) {
      return;
    }

    administrarMedicamentoMutation.mutate({
      id: selectedMed.id,
      data: {
        pacienteCns: administracaoData.pacienteCns,
        quantidade: Number(administracaoData.quantidade),
        dataRetirada: administracaoData.dataRetirada,
        observacoes: administracaoData.observacoes,
      },
    });
  };

  const handleEditMed = (med: any) => {
    setEditingMed(med);
    setMedData({
      quantidade: String(med.quantidade ?? ""),
      dataValidade: med.dataValidade ? med.dataValidade.split("T")[0] : "",
      observacoes: med.observacoes || "",
    });
  };

  const openAdministrarMedicamentoModal = (paciente: any) => {
    setSelectedAdminPaciente(paciente);
    setShowAdministradorMedicamentoModal(true);
    setAdministracaoData({
      pacienteCns: paciente.cns || "",
      quantidade: "",
      dataRetirada: new Date().toISOString().slice(0, 16),
      observacoes: "",
    });
  };

  const openAdministrarMed = (med: any) => {
    setSelectedMed(med);
    setAdministracaoData((prev) => ({
      ...prev,
      pacienteCns: selectedAdminPaciente?.cns || prev.pacienteCns || "",
      quantidade: "",
      dataRetirada: new Date().toISOString().slice(0, 16),
      observacoes: "",
    }));
    setShowAdministradorMedicamentoModal(false);
  };

  const handleHistoricoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      createHistoricoMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...historicoData,
      });
    }
  };

  const handleVacinaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      createVacinaMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...vacinaData,
      });
    }
  };

  const handleExameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      solicitarExameMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...exameData,
      });
    }
  };

  const handleInternacaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      solicitarInternacaoMutation.mutate({
        pacienteId: selectedPaciente.id,
        ...internacaoData,
      });
    }
  };

  const openHistoricoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowHistoricoModal(true);
  };

  const openVacinaModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowVacinaModal(true);
  };

  const openExameModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowExameModal(true);
  };

  const openInternacaoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowInternacaoModal(true);
    queryClient.prefetchQuery("funcionario-hospitais", () =>
      api.get("/funcionario/hospitais").then((res) => res.data),
    );
  };

  // Estados
  const [modalHistorico, setModalHistorico] = useState<{
    aberto: boolean;
    consulta: any;
  }>({
    aberto: false,
    consulta: null,
  });

  const [formHistorico, setFormHistorico] = useState({
    laudo: "",
    diagnostico: "",
    doenca: "",
    medicacao: "",
    observacoes: "",
    dataConsulta: format(new Date(), "yyyy-MM-dd"),
  });

  const [loadingHistorico, setLoadingHistorico] = useState(false);

  // Função de submit
  const handleRegistrarHistorico = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingHistorico(true);
    try {
      await api.post("/funcionario/historico-medico", {
        pacienteId: modalHistorico.consulta?.paciente?.id,
        consultaId: modalHistorico.consulta?.id, // <- vincula à consulta
        ...formHistorico,
      });

      toast.success("Histórico médico registrado com sucesso!");

      // Fecha modal, limpa form e atualiza lista
      setModalHistorico({ aberto: false, consulta: null });
      setFormHistorico({
        laudo: "",
        diagnostico: "",
        doenca: "",
        medicacao: "",
        observacoes: "",
        dataConsulta: format(new Date(), "yyyy-MM-dd"),
      });
      queryClient.invalidateQueries(["funcionario-consultas"]); // atualiza a lista
    } catch (error) {
      console.error("Erro ao registrar histórico:", error);
      toast.error("Erro ao registrar histórico médico");
    } finally {
      setLoadingHistorico(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "text-yellow-600 bg-yellow-100";
      case "avaliando":
        return "text-blue-600 bg-blue-100";
      case "agendado":
      case "agendada":
        return "text-purple-600 bg-purple-100";
      case "realizado":
        return "text-green-600 bg-green-100";
      case "cancelado":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "gravissimo":
        return "text-red-800 bg-red-200";
      case "urgente":
        return "text-red-600 bg-red-100";
      case "grave":
        return "text-orange-600 bg-orange-100";
      case "medio":
        return "text-yellow-600 bg-yellow-100";
      case "leve":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const allNavigation = [
    { name: "Pacientes", key: "pacientes", icon: Users },
    { name: "Minhas Consultas", key: "consultas", icon: Heart },
    { name: "Histórico Médico", key: "historico", icon: FileText },
    { name: "Minhas Solicitações", key: "solicitacoes", icon: Building2 },
    { name: "Medicamentos", key: "medicamentos", icon: Pill },
  ];

  const navigation = allNavigation.filter((item) => {
    const funcao = user?.funcao?.toLowerCase().trim() || "";

    // Apenas médicos podem visualizar "Consultas"
    if (item.key === "consultas") {
      return ["medico", "médico"].includes(funcao);
    }
    if (item.key === "historico") {
      return ["medico", "médico"].includes(funcao);
    }
    if (item.key === "solicitacoes") {
      return ["medico", "médico"].includes(funcao);
    }

    // Apenas enfermeiro/farmacêutico podem visualizar "Medicamentos"
    if (item.key === "medicamentos") {
      return ["enfermeiro", "farmaceutico", "farmacêutico"].includes(funcao);
    }

    return true;
  });

  // Normalizar função do usuário
  const funcao =
    user?.funcao
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim() || "";

  // Permissões
  const isMedico = ["medico"].includes(funcao);

  const isEnfermagemOuFarmacia = ["enfermeiro", "farmaceutico"].includes(
    funcao,
  );

  return (
    <div
      className="min-h-screen bg-[#EEF2F7]"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 border-b border-[#1A3F72]/20"
        style={{
          background: "#1A3F72",
          boxShadow: "0 2px 16px rgba(26,63,114,0.3)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3.5">
            {/* Esquerda */}
            <div className="flex items-center gap-3.5">
              <div
                className="flex items-center justify-center h-10 w-10 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.13)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[15px] font-bold tracking-tight text-white leading-tight">
                  Painel do Funcionário
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-white/60">
                    Bem-vindo,{" "}
                    <span className="font-semibold text-white/90">
                      {user?.nome}
                    </span>
                  </p>
                  <span className="text-white/30">·</span>
                  <p className="text-xs text-white/60">
                    <span className="font-medium text-white/80">
                      {user?.funcao || "Não informada"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Botão sair */}
            <button
              onClick={logout}
              className="group flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white/90 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── SIDEBAR ── */}
          <div className="lg:w-56">
            <nav
              className="rounded-xl p-3 sticky top-[68px]"
              style={{
                background: "#fff",
                border: "1px solid #D9E4F0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4] px-3 mb-2">
                Menu
              </p>
              <ul className="space-y-0.5">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
                          activeTab === item.key
                            ? "text-[#1A3F72]"
                            : "text-[#5C7A9B] hover:text-[#1A3F72]"
                        }`}
                        style={
                          activeTab === item.key
                            ? {
                                background: "#EBF2FB",
                                borderLeft: "3px solid #1A3F72",
                              }
                            : { borderLeft: "3px solid transparent" }
                        }
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">
            {/* ══ PACIENTES ══ */}
            {activeTab === "pacientes" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid #D9E4F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                    Pacientes
                  </h2>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-[#8FA8C4]" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] rounded-lg outline-none transition-all"
                      style={{
                        border: "1px solid #C8D9ED",
                        background: "#F4F8FC",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#1A3F72";
                        e.target.style.background = "#fff";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#C8D9ED";
                        e.target.style.background = "#F4F8FC";
                      }}
                      placeholder="Buscar por nome, CPF ou CNS..."
                    />
                  </div>
                </div>

                {loadingPacientes ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
                    <p className="mt-3 text-sm text-[#8FA8C4]">Carregando...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {pacientes?.map((paciente: any) => {
                      const initials = paciente.nome
                        .split(" ")
                        .slice(0, 2)
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase();
                      return (
                        <div
                          key={paciente.id}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
                          style={{
                            border: "1px solid #E4EDF7",
                            background: "#FAFCFF",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#A8C4E0";
                            e.currentTarget.style.boxShadow =
                              "0 2px 8px rgba(26,63,114,0.07)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#E4EDF7";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          {/* Avatar */}
                          <div
                            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{ background: "#EBF2FB", color: "#1A3F72" }}
                          >
                            {initials}
                          </div>

                          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            {/* Linha 1 — dados */}
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-sm font-semibold text-[#0F2242] whitespace-nowrap">
                                {paciente.nome}
                              </span>
                              <span className="w-px h-3 bg-[#D9E4F0] hidden sm:block" />
                              <span className="text-xs text-[#8FA8C4] whitespace-nowrap">
                                CPF{" "}
                                <span className="text-[#3A5B82] font-medium">
                                  {paciente.cpf}
                                </span>
                              </span>
                              <span className="text-xs text-[#8FA8C4] whitespace-nowrap">
                                CNS{" "}
                                <span className="text-[#3A5B82] font-medium">
                                  {paciente.cns}
                                </span>
                              </span>
                              <span className="text-xs text-[#8FA8C4] whitespace-nowrap">
                                Tel{" "}
                                <span className="text-[#3A5B82] font-medium">
                                  {paciente.telefone}
                                </span>
                              </span>
                              <span className="text-xs text-[#8FA8C4] whitespace-nowrap">
                                Nasc.{" "}
                                <span className="text-[#3A5B82] font-medium">
                                  {format(
                                    new Date(paciente.nascimento),
                                    "dd/MM/yyyy",
                                    { locale: ptBR },
                                  )}
                                </span>
                              </span>
                            </div>

                            {/* Linha 2 — botões */}
                            <div className="flex flex-wrap items-center gap-2">
                              {isMedico && (
                                <>
                                  <button
                                    onClick={() => openHistoricoModal(paciente)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                                    style={{
                                      background: "#EBF2FB",
                                      color: "#1A3F72",
                                      border: "1px solid #C0D6EE",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "#D5E7F7")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "#EBF2FB")
                                    }
                                  >
                                    <Heart className="h-3 w-3" />
                                    Histórico #
                                  </button>
                                  <button
                                    onClick={() => openExameModal(paciente)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                                    style={{
                                      background: "#F0EDFB",
                                      color: "#4C3799",
                                      border: "1px solid #C9C0F0",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "#E2DBF7")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "#F0EDFB")
                                    }
                                  >
                                    <FileText className="h-3 w-3" />
                                    Exame
                                  </button>
                                  <button
                                    onClick={() =>
                                      openInternacaoModal(paciente)
                                    }
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                                    style={{
                                      background: "#FEF0F0",
                                      color: "#8B1F1F",
                                      border: "1px solid #F0C0C0",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "#FADDDD")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "#FEF0F0")
                                    }
                                  >
                                    <Building2 className="h-3 w-3" />
                                    Internação
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedPaciente(paciente);
                                      setActiveTab("historico");
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                                    style={{
                                      background: "#F0F4F8",
                                      color: "#4A6280",
                                      border: "1px solid #C8D9ED",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "#E0EAF4")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "#F0F4F8")
                                    }
                                  >
                                    <FileText className="h-3 w-3" />
                                    Ver histórico
                                  </button>
                                </>
                              )}
                              {isEnfermagemOuFarmacia && (
                                <>
                                  <button
                                    onClick={() => openVacinaModal(paciente)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                                    style={{
                                      background: "#EAF5EF",
                                      color: "#145C35",
                                      border: "1px solid #B0D9C0",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "#D5EDE0")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "#EAF5EF")
                                    }
                                  >
                                    <Shield className="h-3 w-3" />
                                    Vacina
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openAdministrarMedicamentoModal(paciente)
                                    }
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                                    style={{
                                      background: "#EBF2FB",
                                      color: "#1A3F72",
                                      border: "1px solid #C0D6EE",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "#D5E7F7")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "#EBF2FB")
                                    }
                                  >
                                    <Heart className="h-3 w-3" />
                                    Ministrar Medicamento
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ MEDICAMENTOS ══ */}
            {activeTab === "medicamentos" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid #D9E4F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                      Medicamentos
                    </h2>
                    <p className="text-sm text-[#8FA8C4] mt-0.5">
                      Use os controles abaixo para editar estoque ou administrar
                      medicação.
                    </p>
                  </div>
                  <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-[#8FA8C4]" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] rounded-lg outline-none transition-all"
                      style={{
                        border: "1px solid #C8D9ED",
                        background: "#F4F8FC",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#1A3F72";
                        e.target.style.background = "#fff";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#C8D9ED";
                        e.target.style.background = "#F4F8FC";
                      }}
                      placeholder="Buscar medicamento ou paciente..."
                    />
                  </div>
                </div>

                {loadingMedicamentos ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
                    <p className="mt-3 text-sm text-[#8FA8C4]">
                      Carregando medicamentos...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medicamentosDaUbs && medicamentosDaUbs.length > 0 ? (
                      medicamentosDaUbs.map((med: any) => (
                        <div
                          key={med.id}
                          className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          style={{
                            border: "1px solid #E4EDF7",
                            background: "#FAFCFF",
                          }}
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 items-center">
                              <p className="text-xs text-[#8FA8C4]">
                                {med.nome}
                              </p>
                              <span
                                className="px-2 py-0.5 text-xs rounded-full font-medium"
                                style={{
                                  background: "#EBF2FB",
                                  color: "#1A3F72",
                                }}
                              >
                                UBS: {med.ubs?.nome || "Não informada"}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-[#0F2242]">
                              {med.descricao}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#5C7A9B]">
                              <p>
                                <span className="font-semibold text-[#3A5B82]">
                                  Lote:
                                </span>{" "}
                                {med.lote}
                              </p>
                              <p>
                                <span className="font-semibold text-[#3A5B82]">
                                  Quantidade:
                                </span>{" "}
                                {med.quantidade}
                              </p>
                              <p>
                                <span className="font-semibold text-[#3A5B82]">
                                  Validade:
                                </span>{" "}
                                {med.dataValidade?.split("T")[0] || "-"}
                              </p>
                              <p
                                className={
                                  med.vencido
                                    ? "text-[#8B1F1F] font-semibold"
                                    : "text-[#145C35] font-semibold"
                                }
                              >
                                <span className="font-semibold text-[#3A5B82]">
                                  Status:
                                </span>{" "}
                                {med.vencido ? "Vencido" : "Válido"}
                              </p>
                            </div>
                            {!Number(med.quantidade) ? (
                              <div
                                className="mt-2 rounded-lg px-3 py-2 text-xs font-medium"
                                style={{
                                  background: "#FEF0F0",
                                  color: "#8B1F1F",
                                  border: "1px solid #F0C0C0",
                                }}
                              >
                                Sem estoque disponível no momento.
                              </div>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Number(med.quantidade) > 0 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditMed(med)}
                                  className="px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                                  style={{ background: "#1A3F72" }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "#0F2A52")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "#1A3F72")
                                  }
                                >
                                  Atualizar medicação
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openAdministrarMed(med)}
                                  className="px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                                  style={{ background: "#145C35" }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "#0E4226")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "#145C35")
                                  }
                                >
                                  Ministrar ao paciente
                                </button>
                              </>
                            ) : (
                              <span
                                className="px-3 py-2 rounded-lg text-xs font-medium"
                                style={{
                                  border: "1px solid #F0C0C0",
                                  background: "#FEF0F0",
                                  color: "#8B1F1F",
                                }}
                              >
                                Ações desabilitadas por falta de estoque
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#8FA8C4]">
                        Nenhum medicamento encontrado para sua UBS.
                      </p>
                    )}
                  </div>
                )}

                {showAdministradorMedicamentoModal && selectedAdminPaciente && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                      background: "rgba(10,25,47,0.55)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <div
                      className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
                      style={{
                        border: "1px solid #D9E4F0",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                      }}
                    >
                      <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ borderBottom: "1px solid #EEF2F7" }}
                      >
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                            Selecionar medicamento
                          </p>
                          <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                            Administrar para {selectedAdminPaciente.nome}
                          </h3>
                          <p className="text-xs text-[#8FA8C4] mt-0.5">
                            CNS: {selectedAdminPaciente.cns}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={resetAdministracaoForm}
                          className="rounded-full p-2 transition-all"
                          style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#D9E4F0")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#F0F4F8")
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8FA8C4]">
                            Buscar medicamento
                          </p>
                          <div className="w-full max-w-md">
                            <label htmlFor="med-search" className="sr-only">
                              Buscar medicamento
                            </label>
                            <input
                              id="med-search"
                              type="text"
                              value={medSearchTerm}
                              onChange={(e) => setMedSearchTerm(e.target.value)}
                              className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] outline-none transition-all"
                              style={{
                                border: "1px solid #C8D9ED",
                                background: "#F4F8FC",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#1A3F72";
                                e.target.style.background = "#fff";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#C8D9ED";
                                e.target.style.background = "#F4F8FC";
                              }}
                              placeholder="Pesquisar por nome de medicamento"
                            />
                          </div>
                        </div>
                        {loadingMedicamentos ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
                            <p className="mt-3 text-sm text-[#8FA8C4]">
                              Carregando medicamentos...
                            </p>
                          </div>
                        ) : filteredMedicamentos &&
                          filteredMedicamentos.length > 0 ? (
                          <div className="space-y-3">
                            {filteredMedicamentos.map((med: any) => (
                              <div
                                key={med.id}
                                className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                style={{
                                  border: "1px solid #E4EDF7",
                                  background: "#FAFCFF",
                                }}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <p className="text-xs text-[#8FA8C4]">
                                      {med.nome}
                                    </p>
                                    <span
                                      className="px-2 py-0.5 text-xs rounded-full font-medium"
                                      style={{
                                        background: "#EBF2FB",
                                        color: "#1A3F72",
                                      }}
                                    >
                                      UBS: {med.ubs?.nome || "Não informada"}
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-bold text-[#0F2242]">
                                    {med.descricao}
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#5C7A9B]">
                                    <p>
                                      <span className="font-semibold text-[#3A5B82]">
                                        Lote:
                                      </span>{" "}
                                      {med.lote}
                                    </p>
                                    <p>
                                      <span className="font-semibold text-[#3A5B82]">
                                        Quantidade:
                                      </span>{" "}
                                      {med.quantidade}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {Number(med.quantidade) > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => openAdministrarMed(med)}
                                      className="px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                                      style={{ background: "#145C35" }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                          "#0E4226")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.background =
                                          "#145C35")
                                      }
                                    >
                                      Administrar
                                    </button>
                                  ) : (
                                    <span
                                      className="px-3 py-2 rounded-lg text-xs font-medium"
                                      style={{
                                        border: "1px solid #F0C0C0",
                                        background: "#FEF0F0",
                                        color: "#8B1F1F",
                                      }}
                                    >
                                      Sem estoque
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[#8FA8C4]">
                            Nenhum medicamento encontrado para sua UBS.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {editingMed && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                      background: "rgba(10,25,47,0.55)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <div
                      className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
                      style={{
                        border: "1px solid #D9E4F0",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ borderBottom: "1px solid #EEF2F7" }}
                      >
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                            Editar medicação
                          </p>
                          <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                            {editingMed.descricao}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={resetMedForm}
                          className="rounded-full p-2 transition-all"
                          style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#D9E4F0")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#F0F4F8")
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <form
                        onSubmit={handleMedSubmit}
                        className="space-y-5 px-6 py-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                              Quantidade
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={medData.quantidade}
                              onChange={(e) =>
                                setMedData({
                                  ...medData,
                                  quantidade: e.target.value,
                                })
                              }
                              className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                              style={{
                                border: "1px solid #C8D9ED",
                                background: "#F4F8FC",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#1A3F72";
                                e.target.style.background = "#fff";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#C8D9ED";
                                e.target.style.background = "#F4F8FC";
                              }}
                              placeholder="Ex: 100"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                              Data de validade
                            </span>
                            <input
                              type="date"
                              value={medData.dataValidade}
                              onChange={(e) =>
                                setMedData({
                                  ...medData,
                                  dataValidade: e.target.value,
                                })
                              }
                              className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                              style={{
                                border: "1px solid #C8D9ED",
                                background: "#F4F8FC",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#1A3F72";
                                e.target.style.background = "#fff";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#C8D9ED";
                                e.target.style.background = "#F4F8FC";
                              }}
                            />
                          </label>
                        </div>
                        <label className="block">
                          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                            Observações
                          </span>
                          <textarea
                            value={medData.observacoes}
                            onChange={(e) =>
                              setMedData({
                                ...medData,
                                observacoes: e.target.value,
                              })
                            }
                            className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
                            style={{
                              border: "1px solid #C8D9ED",
                              background: "#F4F8FC",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "#1A3F72";
                              e.target.style.background = "#fff";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#C8D9ED";
                              e.target.style.background = "#F4F8FC";
                            }}
                            rows={4}
                            placeholder="Observações sobre o medicamento"
                          />
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={resetMedForm}
                            className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                            style={{
                              border: "1px solid #C8D9ED",
                              color: "#5C7A9B",
                              background: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#F0F4F8")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={updateMedicamentoMutation.isLoading}
                            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: "#1A3F72" }}
                            onMouseEnter={(e) =>
                              !updateMedicamentoMutation.isLoading &&
                              (e.currentTarget.style.background = "#0F2A52")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#1A3F72")
                            }
                          >
                            {updateMedicamentoMutation.isLoading
                              ? "Salvando..."
                              : "Salvar alterações"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {selectedMed && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                      background: "rgba(10,25,47,0.55)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <div
                      className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
                      style={{
                        border: "1px solid #D9E4F0",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ borderBottom: "1px solid #EEF2F7" }}
                      >
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                            Ministrar ao paciente
                          </p>
                          <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                            {selectedMed.nome}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={resetAdministracaoForm}
                          className="rounded-full p-2 transition-all"
                          style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#D9E4F0")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#F0F4F8")
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <form
                        onSubmit={handleAdministrarSubmit}
                        className="space-y-5 px-6 py-5"
                      >
                        <p className="text-xs text-[#8FA8C4]">
                          Lote: {selectedMed.lote} · Disponível:{" "}
                          <span className="font-semibold text-[#145C35]">
                            {selectedMed.quantidade} unidades
                          </span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block md:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                              CNS do paciente *
                            </span>
                            <input
                              type="text"
                              value={administracaoData.pacienteCns}
                              onChange={(e) =>
                                setAdministracaoData({
                                  ...administracaoData,
                                  pacienteCns: e.target.value,
                                })
                              }
                              required
                              placeholder="Informe o CNS do paciente"
                              className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                              style={{
                                border: "1px solid #C8D9ED",
                                background: "#F4F8FC",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#145C35";
                                e.target.style.background = "#fff";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#C8D9ED";
                                e.target.style.background = "#F4F8FC";
                              }}
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                              Quantidade *
                            </span>
                            <input
                              type="number"
                              min="1"
                              max={selectedMed.quantidade}
                              value={administracaoData.quantidade}
                              onChange={(e) =>
                                setAdministracaoData({
                                  ...administracaoData,
                                  quantidade: e.target.value,
                                })
                              }
                              required
                              placeholder={`Máx: ${selectedMed.quantidade}`}
                              className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                              style={{
                                border: "1px solid #C8D9ED",
                                background: "#F4F8FC",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#145C35";
                                e.target.style.background = "#fff";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#C8D9ED";
                                e.target.style.background = "#F4F8FC";
                              }}
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                              Data e Hora *
                            </span>
                            <input
                              type="datetime-local"
                              value={administracaoData.dataRetirada}
                              onChange={(e) =>
                                setAdministracaoData({
                                  ...administracaoData,
                                  dataRetirada: e.target.value,
                                })
                              }
                              required
                              className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                              style={{
                                border: "1px solid #C8D9ED",
                                background: "#F4F8FC",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#145C35";
                                e.target.style.background = "#fff";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#C8D9ED";
                                e.target.style.background = "#F4F8FC";
                              }}
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                              Observações
                            </span>
                            <textarea
                              value={administracaoData.observacoes}
                              onChange={(e) =>
                                setAdministracaoData({
                                  ...administracaoData,
                                  observacoes: e.target.value,
                                })
                              }
                              rows={4}
                              placeholder="Observações sobre a administração (opcional)"
                              className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
                              style={{
                                border: "1px solid #C8D9ED",
                                background: "#F4F8FC",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = "#145C35";
                                e.target.style.background = "#fff";
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = "#C8D9ED";
                                e.target.style.background = "#F4F8FC";
                              }}
                            />
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={resetAdministracaoForm}
                            className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                            style={{
                              border: "1px solid #C8D9ED",
                              color: "#5C7A9B",
                              background: "transparent",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#F0F4F8")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={administrarMedicamentoMutation.isLoading}
                            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: "#145C35" }}
                            onMouseEnter={(e) =>
                              !administrarMedicamentoMutation.isLoading &&
                              (e.currentTarget.style.background = "#0E4226")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#145C35")
                            }
                          >
                            {administrarMedicamentoMutation.isLoading
                              ? "Registrando..."
                              : "Registrar Administração"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showAdministradorMedicamentoModal && selectedAdminPaciente && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{
                  background: "rgba(10,25,47,0.55)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
                  style={{
                    border: "1px solid #D9E4F0",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid #EEF2F7" }}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                        Selecionar medicamento
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                        Administrar para {selectedAdminPaciente.nome}
                      </h3>
                      <p className="text-xs text-[#8FA8C4] mt-0.5">
                        CNS: {selectedAdminPaciente.cns}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetAdministracaoForm}
                      className="rounded-full p-2 transition-all"
                      style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#D9E4F0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#F0F4F8")
                      }
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4]">
                        Buscar medicamento
                      </p>
                      <div className="w-full max-w-md">
                        <label htmlFor="med-search" className="sr-only">
                          Buscar medicamento
                        </label>
                        <input
                          id="med-search"
                          type="text"
                          value={medSearchTerm}
                          onChange={(e) => setMedSearchTerm(e.target.value)}
                          className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] outline-none transition-all"
                          style={{
                            border: "1px solid #C8D9ED",
                            background: "#F4F8FC",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#1A3F72";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#C8D9ED";
                            e.target.style.background = "#F4F8FC";
                          }}
                          placeholder="Pesquisar por nome de medicamento"
                        />
                      </div>
                    </div>
                    {loadingMedicamentos ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
                        <p className="mt-3 text-sm text-[#8FA8C4]">
                          Carregando medicamentos...
                        </p>
                      </div>
                    ) : filteredMedicamentos &&
                      filteredMedicamentos.length > 0 ? (
                      <div className="space-y-3">
                        {filteredMedicamentos.map((med: any) => (
                          <div
                            key={med.id}
                            className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            style={{
                              border: "1px solid #E4EDF7",
                              background: "#FAFCFF",
                            }}
                          >
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap gap-2 items-center">
                                <p className="text-xs text-[#8FA8C4]">
                                  {med.nome}
                                </p>
                                <span
                                  className="px-2 py-0.5 text-xs rounded-full font-medium"
                                  style={{
                                    background: "#EBF2FB",
                                    color: "#1A3F72",
                                  }}
                                >
                                  UBS: {med.ubs?.nome || "Não informada"}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-[#0F2242]">
                                {med.descricao}
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#5C7A9B]">
                                <p>
                                  <span className="font-semibold text-[#3A5B82]">
                                    Lote:
                                  </span>{" "}
                                  {med.lote}
                                </p>
                                <p>
                                  <span className="font-semibold text-[#3A5B82]">
                                    Quantidade:
                                  </span>{" "}
                                  {med.quantidade}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {Number(med.quantidade) > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => openAdministrarMed(med)}
                                  className="px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                                  style={{ background: "#145C35" }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                      "#0E4226")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                      "#145C35")
                                  }
                                >
                                  Administrar
                                </button>
                              ) : (
                                <span
                                  className="px-3 py-2 rounded-lg text-xs font-medium"
                                  style={{
                                    border: "1px solid #F0C0C0",
                                    background: "#FEF0F0",
                                    color: "#8B1F1F",
                                  }}
                                >
                                  Sem estoque
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#8FA8C4]">
                        Nenhum medicamento encontrado para sua UBS.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {editingMed && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{
                  background: "rgba(10,25,47,0.55)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
                  style={{
                    border: "1px solid #D9E4F0",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid #EEF2F7" }}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                        Editar medicação
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                        {editingMed.descricao}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={resetMedForm}
                      className="rounded-full p-2 transition-all"
                      style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#D9E4F0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#F0F4F8")
                      }
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <form
                    onSubmit={handleMedSubmit}
                    className="space-y-5 px-6 py-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                          Quantidade
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={medData.quantidade}
                          onChange={(e) =>
                            setMedData({
                              ...medData,
                              quantidade: e.target.value,
                            })
                          }
                          className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                          style={{
                            border: "1px solid #C8D9ED",
                            background: "#F4F8FC",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#1A3F72";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#C8D9ED";
                            e.target.style.background = "#F4F8FC";
                          }}
                          placeholder="Ex: 100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                          Data de validade
                        </span>
                        <input
                          type="date"
                          value={medData.dataValidade}
                          onChange={(e) =>
                            setMedData({
                              ...medData,
                              dataValidade: e.target.value,
                            })
                          }
                          className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                          style={{
                            border: "1px solid #C8D9ED",
                            background: "#F4F8FC",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#1A3F72";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#C8D9ED";
                            e.target.style.background = "#F4F8FC";
                          }}
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                        Observações
                      </span>
                      <textarea
                        value={medData.observacoes}
                        onChange={(e) =>
                          setMedData({
                            ...medData,
                            observacoes: e.target.value,
                          })
                        }
                        className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
                        style={{
                          border: "1px solid #C8D9ED",
                          background: "#F4F8FC",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#1A3F72";
                          e.target.style.background = "#fff";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#C8D9ED";
                          e.target.style.background = "#F4F8FC";
                        }}
                        rows={4}
                        placeholder="Observações sobre o medicamento"
                      />
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={resetMedForm}
                        className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                        style={{
                          border: "1px solid #C8D9ED",
                          color: "#5C7A9B",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#F0F4F8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={updateMedicamentoMutation.isLoading}
                        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: "#1A3F72" }}
                        onMouseEnter={(e) =>
                          !updateMedicamentoMutation.isLoading &&
                          (e.currentTarget.style.background = "#0F2A52")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#1A3F72")
                        }
                      >
                        {updateMedicamentoMutation.isLoading
                          ? "Salvando..."
                          : "Salvar alterações"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {selectedMed && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{
                  background: "rgba(10,25,47,0.55)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
                  style={{
                    border: "1px solid #D9E4F0",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid #EEF2F7" }}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                        Ministrar ao paciente
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                        {selectedMed.nome}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={resetAdministracaoForm}
                      className="rounded-full p-2 transition-all"
                      style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#D9E4F0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#F0F4F8")
                      }
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <form
                    onSubmit={handleAdministrarSubmit}
                    className="space-y-5 px-6 py-5"
                  >
                    <p className="text-xs text-[#8FA8C4]">
                      Lote: {selectedMed.lote} · Disponível:{" "}
                      <span className="font-semibold text-[#145C35]">
                        {selectedMed.quantidade} unidades
                      </span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block md:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                          CNS do paciente *
                        </span>
                        <input
                          type="text"
                          value={administracaoData.pacienteCns}
                          onChange={(e) =>
                            setAdministracaoData({
                              ...administracaoData,
                              pacienteCns: e.target.value,
                            })
                          }
                          required
                          placeholder="Informe o CNS do paciente"
                          className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                          style={{
                            border: "1px solid #C8D9ED",
                            background: "#F4F8FC",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#145C35";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#C8D9ED";
                            e.target.style.background = "#F4F8FC";
                          }}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                          Quantidade *
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={selectedMed.quantidade}
                          value={administracaoData.quantidade}
                          onChange={(e) =>
                            setAdministracaoData({
                              ...administracaoData,
                              quantidade: e.target.value,
                            })
                          }
                          required
                          placeholder={`Máx: ${selectedMed.quantidade}`}
                          className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                          style={{
                            border: "1px solid #C8D9ED",
                            background: "#F4F8FC",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#145C35";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#C8D9ED";
                            e.target.style.background = "#F4F8FC";
                          }}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                          Data e Hora *
                        </span>
                        <input
                          type="datetime-local"
                          value={administracaoData.dataRetirada}
                          onChange={(e) =>
                            setAdministracaoData({
                              ...administracaoData,
                              dataRetirada: e.target.value,
                            })
                          }
                          required
                          className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                          style={{
                            border: "1px solid #C8D9ED",
                            background: "#F4F8FC",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#145C35";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#C8D9ED";
                            e.target.style.background = "#F4F8FC";
                          }}
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                          Observações
                        </span>
                        <textarea
                          value={administracaoData.observacoes}
                          onChange={(e) =>
                            setAdministracaoData({
                              ...administracaoData,
                              observacoes: e.target.value,
                            })
                          }
                          rows={4}
                          placeholder="Observações sobre a administração (opcional)"
                          className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
                          style={{
                            border: "1px solid #C8D9ED",
                            background: "#F4F8FC",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#145C35";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#C8D9ED";
                            e.target.style.background = "#F4F8FC";
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={resetAdministracaoForm}
                        className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                        style={{
                          border: "1px solid #C8D9ED",
                          color: "#5C7A9B",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#F0F4F8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={administrarMedicamentoMutation.isLoading}
                        className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: "#145C35" }}
                        onMouseEnter={(e) =>
                          !administrarMedicamentoMutation.isLoading &&
                          (e.currentTarget.style.background = "#0E4226")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#145C35")
                        }
                      >
                        {administrarMedicamentoMutation.isLoading
                          ? "Registrando..."
                          : "Registrar Administração"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ══ HISTÓRICO ══ */}
            {activeTab === "historico" && selectedPaciente && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid #D9E4F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                      Histórico Médico
                    </h2>
                    <p className="text-sm text-[#8FA8C4] mt-0.5">
                      Paciente: {selectedPaciente.nome}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("pacientes")}
                    className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                    style={{
                      border: "1px solid #C8D9ED",
                      color: "#5C7A9B",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#F0F4F8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    ← Voltar
                  </button>
                </div>
                {historicoPaciente && historicoPaciente.length > 0 ? (
                  <div className="space-y-3">
                    {historicoPaciente.map((item: any) => (
                      <div
                        key={item.id}
                        className="rounded-xl p-4"
                        style={{
                          border: "1px solid #E4EDF7",
                          borderLeft: "3px solid #1A3F72",
                          background: "#FAFCFF",
                        }}
                      >
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
                          <div>
                            <h3 className="text-base font-bold text-[#0F2242]">
                              {item.diagnostico}
                            </h3>
                            <p className="text-xs text-[#8FA8C4] mt-0.5">
                              {format(
                                new Date(item.dataConsulta),
                                "dd/MM/yyyy",
                                { locale: ptBR },
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#0F2242]">
                              {item.funcionario.nome}
                            </p>
                            <p className="text-xs text-[#8FA8C4]">
                              {item.funcionario.funcao}
                            </p>
                            {item.funcionario.crm && (
                              <p className="text-xs text-[#8FA8C4]">
                                CRM: {item.funcionario.crm}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                              Laudo
                            </p>
                            <p className="text-[#3A5B82]">{item.laudo}</p>
                          </div>
                          {item.doenca && (
                            <div>
                              <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                Doença
                              </p>
                              <p className="text-[#3A5B82]">{item.doenca}</p>
                            </div>
                          )}
                          {item.medicacao && (
                            <div>
                              <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                Medicação
                              </p>
                              <p className="text-[#3A5B82]">{item.medicacao}</p>
                            </div>
                          )}
                          {item.observacoes && (
                            <div>
                              <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                Observações
                              </p>
                              <p className="text-[#3A5B82]">
                                {item.observacoes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
                    <p className="text-sm text-[#8FA8C4]">
                      Nenhum histórico médico encontrado para este paciente.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ══ SOLICITAÇÕES ══ */}
            {activeTab === "solicitacoes" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid #D9E4F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                      Minhas Solicitações
                    </h2>
                    <p className="text-sm text-[#8FA8C4] mt-0.5">
                      Exames e internações solicitados por você.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-end gap-4 mb-5">
                  <div className="w-full md:w-1/2">
                    <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                      Filtrar por paciente
                    </label>
                    <input
                      value={solicitacoesFiltroPaciente}
                      onChange={(e) =>
                        setSolicitacoesFiltroPaciente(e.target.value)
                      }
                      list="pacientes-solicitacoes"
                      placeholder="Digite o nome do paciente"
                      className="w-full px-3 py-2 text-sm text-[#1A2E4A] rounded-lg outline-none transition-all"
                      style={{
                        border: "1px solid #C8D9ED",
                        background: "#F4F8FC",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#1A3F72";
                        e.target.style.background = "#fff";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#C8D9ED";
                        e.target.style.background = "#F4F8FC";
                      }}
                    />
                    <datalist id="pacientes-solicitacoes">
                      {pacientesSolicitacoes.map((paciente: any) => (
                        <option key={paciente.id} value={paciente.nome} />
                      ))}
                    </datalist>
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                      Filtrar por tipo
                    </label>
                    <select
                      value={solicitacoesFiltroTipo}
                      onChange={(e) =>
                        setSolicitacoesFiltroTipo(e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm text-[#1A2E4A] rounded-lg outline-none transition-all"
                      style={{
                        border: "1px solid #C8D9ED",
                        background: "#F4F8FC",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#1A3F72";
                        e.target.style.background = "#fff";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#C8D9ED";
                        e.target.style.background = "#F4F8FC";
                      }}
                    >
                      <option value="todos">Todos os tipos</option>
                      <option value="internacao">Internação</option>
                      <option value="exame">Exame</option>
                    </select>
                  </div>
                </div>
                {filteredSolicitacoes && filteredSolicitacoes.length > 0 ? (
                  <div className="space-y-3">
                    {filteredSolicitacoes.map((solicitacao: any) => (
                      <div
                        key={`${solicitacao.solicitacaoTipo}-${solicitacao.id}`}
                        className="rounded-xl p-4"
                        style={{
                          border: "1px solid #E4EDF7",
                          borderLeft: `3px solid ${solicitacao.solicitacaoTipo === "internacao" ? "#8B1F1F" : "#1A3F72"}`,
                          background: "#FAFCFF",
                        }}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                          <div>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${solicitacao.solicitacaoTipo === "internacao" ? "" : ""}`}
                              style={
                                solicitacao.solicitacaoTipo === "internacao"
                                  ? {
                                      background: "#FEF0F0",
                                      color: "#8B1F1F",
                                      border: "1px solid #F0C0C0",
                                    }
                                  : {
                                      background: "#EBF2FB",
                                      color: "#1A3F72",
                                      border: "1px solid #C0D6EE",
                                    }
                              }
                            >
                              {solicitacao.solicitacaoTipo === "internacao"
                                ? "Solicitação de Internação"
                                : "Solicitação de Exame"}
                            </span>
                            <h3 className="text-base font-bold text-[#0F2242] mt-2">
                              {solicitacao.paciente?.nome ||
                                "Paciente não informado"}
                            </h3>
                            <p className="text-xs text-[#5C7A9B] mt-0.5">
                              {solicitacao.solicitacaoTipo === "internacao"
                                ? `Internação solicitada para ${solicitacao.tipo}`
                                : `Exame solicitado: ${solicitacao.tipoExame}`}
                            </p>
                            <p className="text-xs text-[#8FA8C4]">
                              Solicitado em:{" "}
                              {format(
                                new Date(solicitacao.createdAt),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR },
                              )}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(solicitacao.status)}`}
                            >
                              {solicitacao.status}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${solicitacao.solicitacaoTipo === "internacao" ? getPrioridadeColor(solicitacao.prioridade) : "text-[#1A3F72] bg-[#EBF2FB]"}`}
                            >
                              {solicitacao.solicitacaoTipo === "internacao"
                                ? solicitacao.prioridade
                                : "Exame"}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                              Tipo
                            </p>
                            <p className="text-[#3A5B82] capitalize">
                              {solicitacao.solicitacaoTipo === "internacao"
                                ? "Internação"
                                : "Exame"}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                              Local
                            </p>
                            <p className="text-[#3A5B82]">
                              {solicitacao.solicitacaoTipo === "internacao"
                                ? solicitacao.hospital?.nome
                                : solicitacao.laboratorio?.nome}
                            </p>
                          </div>
                          {solicitacao.solicitacaoTipo === "internacao" && (
                            <>
                              <div>
                                <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                  Motivo
                                </p>
                                <p className="text-[#3A5B82]">
                                  {solicitacao.motivo}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                  Detalhes
                                </p>
                                <p className="text-[#3A5B82]">
                                  {solicitacao.detalhes}
                                </p>
                              </div>
                            </>
                          )}
                          {solicitacao.solicitacaoTipo === "exame" && (
                            <div className="md:col-span-2">
                              <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                Observações
                              </p>
                              <p className="text-[#3A5B82]">
                                {solicitacao.observacoes ||
                                  "Nenhuma observação"}
                              </p>
                            </div>
                          )}
                          {solicitacao.solicitacaoTipo === "internacao" &&
                            solicitacao.dataAgendada && (
                              <div>
                                <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                  Data Agendada
                                </p>
                                <p className="text-[#3A5B82]">
                                  {format(
                                    new Date(solicitacao.dataAgendada),
                                    "dd/MM/yyyy",
                                    { locale: ptBR },
                                  )}
                                  {solicitacao.horaAgendada &&
                                    ` às ${solicitacao.horaAgendada}`}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
                    <p className="text-sm text-[#8FA8C4]">
                      Nenhuma solicitação encontrada.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ══ CONSULTAS ══ */}
            {activeTab === "consultas" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid #D9E4F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                    Minhas Consultas
                  </h2>
                </div>
                {consultas && consultas.length > 0 ? (
                  <div className="space-y-3">
                    {consultas.map((consulta: any) => (
                      <div
                        key={consulta.id}
                        className="rounded-xl p-4 transition-all duration-150"
                        style={{
                          border: "1px solid #E4EDF7",
                          background: "#FAFCFF",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 2px 12px rgba(26,63,114,0.07)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                          <div>
                            <h3 className="text-base font-bold text-[#0F2242]">
                              {consulta.paciente?.nome || "N/A"}
                            </h3>
                            <p className="text-xs text-[#8FA8C4]">
                              CPF: {consulta.paciente?.cpf || "N/A"}
                            </p>
                            {consulta.dataAgendada && (
                              <p className="text-xs text-[#8FA8C4]">
                                Agendada para:{" "}
                                {format(
                                  new Date(consulta.dataAgendada),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR },
                                )}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(consulta.status)}`}
                          >
                            {consulta.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                          <div>
                            <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                              Especialidade
                            </p>
                            <p className="text-[#3A5B82]">
                              {consulta.especialidade}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                              Motivo
                            </p>
                            <p className="text-[#3A5B82]">{consulta.motivo}</p>
                          </div>
                          {consulta.ubs && (
                            <div>
                              <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                UBS
                              </p>
                              <p className="text-[#3A5B82]">
                                {consulta.ubs.nome}
                              </p>
                            </div>
                          )}
                          {consulta.dataCancelamento && (
                            <div>
                              <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                Cancelada em
                              </p>
                              <p className="text-[#3A5B82]">
                                {format(
                                  new Date(consulta.dataCancelamento),
                                  "dd/MM/yyyy",
                                  { locale: ptBR },
                                )}
                              </p>
                            </div>
                          )}
                          {consulta.observacoes && (
                            <div className="md:col-span-2">
                              <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                                Observações
                              </p>
                              <p className="text-[#3A5B82]">
                                {consulta.observacoes}
                              </p>
                            </div>
                          )}
                        </div>

                        {consulta.historicoMedico ? (
                          <div
                            className="rounded-lg p-3 flex justify-between items-start gap-3"
                            style={{
                              background: "#EAF5EF",
                              border: "1px solid #B0D9C0",
                            }}
                          >
                            <div className="flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#145C35] mb-1">
                                ✓ Histórico registrado
                              </p>
                              <p className="text-xs text-[#3A5B82]">
                                <span className="font-semibold">
                                  Diagnóstico:
                                </span>{" "}
                                {consulta.historicoMedico.diagnostico}
                              </p>
                              {consulta.historicoMedico.doenca && (
                                <p className="text-xs text-[#3A5B82]">
                                  <span className="font-semibold">Doença:</span>{" "}
                                  {consulta.historicoMedico.doenca}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedPaciente(consulta.paciente);
                                setActiveTab("historico");
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all flex-shrink-0"
                              style={{ background: "#145C35" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#0E4226")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "#145C35")
                              }
                            >
                              <FileText className="h-3 w-3" />
                              Ver Histórico
                            </button>
                          </div>
                        ) : consulta.status === "agendada" ||
                          consulta.status === "agendado" ? (
                          <div
                            className="flex justify-between items-center pt-3"
                            style={{ borderTop: "1px solid #EEF2F7" }}
                          >
                            <p className="text-xs text-[#8FA8C4]">
                              Sem histórico médico registrado
                            </p>
                            <button
                              onClick={() =>
                                setModalHistorico({ aberto: true, consulta })
                              }
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                              style={{ background: "#1A3F72" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#0F2A52")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "#1A3F72")
                              }
                            >
                              + Registrar Histórico
                            </button>
                          </div>
                        ) : (
                          <div
                            className="pt-3 flex items-center"
                            style={{ borderTop: "1px solid #EEF2F7" }}
                          >
                            <p className="text-xs text-[#8FA8C4]">
                              Sem histórico médico registrado
                            </p>
                          </div>
                        )}

                        <div
                          className="pt-2.5 mt-2.5"
                          style={{ borderTop: "1px solid #EEF2F7" }}
                        >
                          <p className="text-[10px] text-[#8FA8C4]">
                            Registrada em:{" "}
                            {format(
                              new Date(consulta.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
                    <p className="text-sm text-[#8FA8C4]">
                      Nenhuma consulta encontrada.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ══ MODAL REGISTRAR HISTÓRICO ══ */}
            {modalHistorico.aberto && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
                style={{
                  background: "rgba(10,25,47,0.55)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="bg-white rounded-2xl w-full max-w-lg overflow-y-auto"
                  style={{
                    maxHeight: "90vh",
                    border: "1px solid #D9E4F0",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                  }}
                >
                  <div
                    className="flex justify-between items-center p-6"
                    style={{ borderBottom: "1px solid #EEF2F7" }}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                        Registrar histórico
                      </p>
                      <h2 className="text-lg font-bold text-[#0F2242] mt-1">
                        Histórico Médico
                      </h2>
                      <p className="text-xs text-[#8FA8C4] mt-0.5">
                        Paciente: {modalHistorico.consulta?.paciente?.nome}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setModalHistorico({ aberto: false, consulta: null })
                      }
                      className="text-[#8FA8C4] hover:text-[#5C7A9B] text-2xl font-bold leading-none transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <form
                    onSubmit={handleRegistrarHistorico}
                    className="p-6 space-y-4"
                  >
                    {[
                      {
                        label: "Laudo",
                        key: "laudo",
                        required: true,
                        type: "textarea",
                        rows: 3,
                        placeholder: "Descreva o laudo médico...",
                      },
                      {
                        label: "Diagnóstico",
                        key: "diagnostico",
                        required: true,
                        type: "textarea",
                        rows: 2,
                        placeholder: "Diagnóstico do paciente...",
                      },
                    ].map(
                      ({ label, key, required, type, rows, placeholder }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                            {label}
                            {required && (
                              <span className="text-[#8B1F1F]"> *</span>
                            )}
                          </label>
                          <textarea
                            required={required}
                            rows={rows}
                            value={formHistorico[key]}
                            onChange={(e) =>
                              setFormHistorico((prev: any) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
                            style={{
                              border: "1px solid #C8D9ED",
                              background: "#F4F8FC",
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = "#1A3F72";
                              e.target.style.background = "#fff";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#C8D9ED";
                              e.target.style.background = "#F4F8FC";
                            }}
                            placeholder={placeholder}
                          />
                        </div>
                      ),
                    )}
                    {[
                      {
                        label: "Doença",
                        key: "doenca",
                        placeholder: "CID ou nome da doença...",
                      },
                      {
                        label: "Medicação",
                        key: "medicacao",
                        placeholder: "Medicações prescritas...",
                      },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={formHistorico[key]}
                          onChange={(e) =>
                            setFormHistorico((prev: any) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                          style={{
                            border: "1px solid #C8D9ED",
                            background: "#F4F8FC",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#1A3F72";
                            e.target.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#C8D9ED";
                            e.target.style.background = "#F4F8FC";
                          }}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                        Observações
                      </label>
                      <textarea
                        rows={2}
                        value={formHistorico.observacoes}
                        onChange={(e) =>
                          setFormHistorico((prev: any) => ({
                            ...prev,
                            observacoes: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
                        style={{
                          border: "1px solid #C8D9ED",
                          background: "#F4F8FC",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#1A3F72";
                          e.target.style.background = "#fff";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#C8D9ED";
                          e.target.style.background = "#F4F8FC";
                        }}
                        placeholder="Observações adicionais..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                        Data da Consulta{" "}
                        <span className="text-[#8B1F1F]">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formHistorico.dataConsulta}
                        onChange={(e) =>
                          setFormHistorico((prev: any) => ({
                            ...prev,
                            dataConsulta: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                        style={{
                          border: "1px solid #C8D9ED",
                          background: "#F4F8FC",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#1A3F72";
                          e.target.style.background = "#fff";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#C8D9ED";
                          e.target.style.background = "#F4F8FC";
                        }}
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setModalHistorico({ aberto: false, consulta: null })
                        }
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          border: "1px solid #C8D9ED",
                          color: "#5C7A9B",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#F0F4F8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loadingHistorico}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: "#1A3F72" }}
                        onMouseEnter={(e) =>
                          !loadingHistorico &&
                          (e.currentTarget.style.background = "#0F2A52")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#1A3F72")
                        }
                      >
                        {loadingHistorico ? "Salvando..." : "Salvar Histórico"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Histórico Médico */}
      {showHistoricoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Registrar Histórico Médico
              </h3>
              <button
                onClick={() => setShowHistoricoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedPaciente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {selectedPaciente.nome}
                </p>
                <p className="text-sm text-gray-600">
                  CPF: {selectedPaciente.cpf}
                </p>
              </div>
            )}

            <form onSubmit={handleHistoricoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Consulta
                </label>
                <input
                  type="date"
                  value={historicoData.dataConsulta}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      dataConsulta: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Laudo *
                </label>
                <textarea
                  value={historicoData.laudo}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      laudo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico *
                </label>
                <input
                  type="text"
                  value={historicoData.diagnostico}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      diagnostico: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doença
                </label>
                <input
                  type="text"
                  value={historicoData.doenca}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      doenca: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicação
                </label>
                <textarea
                  value={historicoData.medicacao}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      medicacao: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={historicoData.observacoes}
                  onChange={(e) =>
                    setHistoricoData({
                      ...historicoData,
                      observacoes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowHistoricoModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createHistoricoMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {createHistoricoMutation.isLoading
                      ? "Salvando..."
                      : "Salvar"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Vacina */}
      {showVacinaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Registrar Vacina
              </h3>
              <button
                onClick={() => setShowVacinaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedPaciente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {selectedPaciente.nome}
                </p>
                <p className="text-sm text-gray-600">
                  CPF: {selectedPaciente.cpf}
                </p>
              </div>
            )}

            <form onSubmit={handleVacinaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Vacina *
                </label>
                <input
                  type="text"
                  value={vacinaData.nome}
                  onChange={(e) =>
                    setVacinaData({ ...vacinaData, nome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lote *
                </label>
                <input
                  type="text"
                  value={vacinaData.lote}
                  onChange={(e) =>
                    setVacinaData({ ...vacinaData, lote: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Aplicação *
                </label>
                <input
                  type="date"
                  value={vacinaData.dataApl}
                  onChange={(e) =>
                    setVacinaData({ ...vacinaData, dataApl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Próxima Dose
                </label>
                <input
                  type="date"
                  value={vacinaData.proximaDose}
                  onChange={(e) =>
                    setVacinaData({
                      ...vacinaData,
                      proximaDose: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVacinaModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createVacinaMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {createVacinaMutation.isLoading ? "Salvando..." : "Salvar"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exame */}
      {showExameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Solicitar Exame
              </h3>
              <button
                onClick={() => setShowExameModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedPaciente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {selectedPaciente.nome}
                </p>
                <p className="text-sm text-gray-600">
                  CPF: {selectedPaciente.cpf}
                </p>
              </div>
            )}

            <form onSubmit={handleExameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Laboratório *
                </label>
                <select
                  value={exameData.laboratorioId}
                  onChange={(e) =>
                    setExameData({
                      ...exameData,
                      laboratorioId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um laboratório</option>
                  {laboratorios?.map((lab: any) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Exame *
                </label>
                <input
                  type="text"
                  value={exameData.tipoExame}
                  onChange={(e) =>
                    setExameData({ ...exameData, tipoExame: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Hemograma completo, Glicemia, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={exameData.observacoes}
                  onChange={(e) =>
                    setExameData({ ...exameData, observacoes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Informações adicionais sobre o exame..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExameModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={solicitarExameMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {solicitarExameMutation.isLoading
                      ? "Enviando..."
                      : "Solicitar"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Internação */}
      {showInternacaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Solicitar Internação
              </h3>
              <button
                onClick={() => setShowInternacaoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedPaciente && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">
                  {selectedPaciente.nome}
                </p>
                <p className="text-sm text-gray-600">
                  CPF: {selectedPaciente.cpf}
                </p>
              </div>
            )}

            <form onSubmit={handleInternacaoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital *
                </label>
                {loadingHospitais ? (
                  <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                    Carregando hospitais...
                  </div>
                ) : hospitaisError ? (
                  <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-3 text-sm text-red-700">
                    Erro ao carregar hospitais. Atualize a página e tente
                    novamente.
                  </div>
                ) : (
                  <select
                    value={internacaoData.hospitalId}
                    onChange={(e) =>
                      setInternacaoData({
                        ...internacaoData,
                        hospitalId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um hospital</option>
                    {hospitais?.map((hospital: any) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Internação *
                </label>
                <select
                  value={internacaoData.tipo}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      tipo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="internacao">Internação</option>
                  <option value="cirurgia">Cirurgia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade *
                </label>
                <select
                  value={internacaoData.prioridade}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      prioridade: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="leve">Leve</option>
                  <option value="medio">Médio</option>
                  <option value="grave">Grave</option>
                  <option value="urgente">Urgente</option>
                  <option value="gravissimo">Gravíssimo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo *
                </label>
                <input
                  type="text"
                  value={internacaoData.motivo}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      motivo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Dor abdominal intensa, Fratura exposta, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detalhes *
                </label>
                <textarea
                  value={internacaoData.detalhes}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      detalhes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva detalhadamente o quadro clínico e a necessidade de internação..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Laudo Médico *
                </label>
                <textarea
                  value={internacaoData.laudoMedico}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      laudoMedico: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                  placeholder="Laudo médico detalhado justificando a necessidade de internação..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={internacaoData.observacoes}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      observacoes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="Informações adicionais relevantes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInternacaoModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={solicitarInternacaoMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {solicitarInternacaoMutation.isLoading
                      ? "Enviando..."
                      : "Solicitar Internação"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncionarioDashboard;
