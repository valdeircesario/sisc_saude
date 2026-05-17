import React, { useState } from "react";
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

  const { data: hospitais } = useQuery(
    "funcionario-hospitais",
    () => api.get("/funcionario/hospitais").then((res) => res.data),
    { enabled: showInternacaoModal },
  );

  const { data: minhasSolicitacoes } = useQuery(
    "minhas-solicitacoes-internacao",
    () =>
      api
        .get("/funcionario/minhas-solicitacoes-internacao")
        .then((res) => res.data),
    { enabled: activeTab === "solicitacoes" },
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
        queryClient.invalidateQueries("minhas-solicitacoes-internacao");
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
    setActiveTab("medicamentos");
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

  // Filtrar navegação baseado na função do usuário
  // Filtrar navegação baseado na função do usuário
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Lado esquerdo */}
            <div className="flex items-center gap-4">
              {/* Ícone */}
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>

              {/* Informações */}
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Painel do Funcionário
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mt-1">
                  <p className="text-sm text-gray-600">
                    Bem-vindo,{" "}
                    <span className="font-semibold text-gray-800">
                      {user?.nome}
                    </span>
                  </p>

                  <span className="hidden sm:block text-gray-300">•</span>

                  <p className="text-sm text-gray-600">
                    Função:{" "}
                    <span className="font-medium text-green-700">
                      {user?.funcao || "Não informada"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Botão sair */}
            <button
              onClick={logout}
              className="group flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-700 hover:shadow-lg active:scale-95"
            >
              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-2xl shadow-lg p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                          activeTab === item.key
                            ? "bg-green-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "pacientes" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Pacientes
                  </h2>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Buscar por nome, CPF ou CNS..."
                    />
                  </div>
                </div>

                {loadingPacientes ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
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
                          className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white"
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold text-xs">
                            {initials}
                          </div>

                          {/* Corpo: info + botões em duas linhas */}
                          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            {/* Linha 1 — dados */}
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {paciente.nome}
                              </span>
                              <span className="w-px h-3.5 bg-gray-200 hidden sm:block" />
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                CPF{" "}
                                <span className="text-gray-800 font-medium">
                                  {paciente.cpf}
                                </span>
                              </span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                CNS{" "}
                                <span className="text-gray-800 font-medium">
                                  {paciente.cns}
                                </span>
                              </span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                Tel{" "}
                                <span className="text-gray-800 font-medium">
                                  {paciente.telefone}
                                </span>
                              </span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                Nasc.{" "}
                                <span className="text-gray-800 font-medium">
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
                              {/* MÉDICOS */}
                              {isMedico && (
                                <>
                                  <button
                                    onClick={() => openHistoricoModal(paciente)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium whitespace-nowrap"
                                  >
                                    <Heart className="h-3 w-3" />
                                    Histórico #
                                  </button>

                                  <button
                                    onClick={() => openExameModal(paciente)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors text-xs font-medium whitespace-nowrap"
                                  >
                                    <FileText className="h-3 w-3" />
                                    Exame
                                  </button>

                                  <button
                                    onClick={() =>
                                      openInternacaoModal(paciente)
                                    }
                                    className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-xs font-medium whitespace-nowrap"
                                  >
                                    <Building2 className="h-3 w-3" />
                                    Internação
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedPaciente(paciente);
                                      setActiveTab("historico");
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium whitespace-nowrap"
                                  >
                                    <FileText className="h-3 w-3" />
                                    Ver histórico
                                  </button>
                                </>
                              )}

                              {/* ENFERMEIRO E FARMACÊUTICO */}
                              {isEnfermagemOuFarmacia && (
                                <>
                                  <button
                                    onClick={() => openVacinaModal(paciente)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-xs font-medium whitespace-nowrap"
                                  >
                                    <Shield className="h-3 w-3" />
                                    Vacina
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openAdministrarMedicamentoModal(paciente)
                                    }
                                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium whitespace-nowrap"
                                  >
                                    <Heart className="h-3 w-3" />
                                     Ministrar Medicamentos
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

            {/* Medicamentos Tab */}
            {activeTab === "medicamentos" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Medicamentos
                    </h2>
                    <p className="text-gray-600">
                      Use os controles abaixo para editar estoque ou administrar
                      medicação.
                    </p>
                  </div>
                  <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Buscar medicamento ou paciente..."
                    />
                  </div>
                </div>

                {loadingMedicamentos ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-gray-600">
                      Carregando medicamentos...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicamentosDaUbs && medicamentosDaUbs.length > 0 ? (
                      medicamentosDaUbs.map((med: any) => (
                        <div
                          key={med.id}
                          className="border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2 items-center">
                              <p className="text-sm text-gray-500">
                                {med.nome}
                              </p>
                              <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                                UBS: {med.ubs?.nome || "Não informada"}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {med.descricao}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <p>
                                <span className="font-medium text-gray-700">
                                  Lote:
                                </span>{" "}
                                {med.lote}
                              </p>
                              <p>
                                <span className="font-medium text-gray-700">
                                  Quantidade:
                                </span>{" "}
                                {med.quantidade}
                              </p>
                              <p>
                                <span className="font-medium text-gray-700">
                                  Validade:
                                </span>{" "}
                                {med.dataValidade?.split("T")[0] || "-"}
                              </p>
                              <p
                                className={
                                  med.vencido
                                    ? "text-red-600"
                                    : "text-green-600"
                                }
                              >
                                <span className="font-medium text-gray-700">
                                  Status:
                                </span>{" "}
                                {med.vencido ? "Vencido" : "Válido"}
                              </p>
                            </div>
                            {!Number(med.quantidade) ? (
                              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Atualizar medicação
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openAdministrarMed(med)}
                                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                  Ministrar ao paciente
                                </button>
                              </>
                            ) : (
                              <span className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                                Ações desabilitadas por falta de estoque
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">
                        Nenhum medicamento encontrado para sua UBS.
                      </p>
                    )}
                  </div>
                )}

                {showAdministradorMedicamentoModal && selectedAdminPaciente && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
                      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Selecionar medicamento
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900">
                            Administrar para {selectedAdminPaciente.nome}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            CNS: {selectedAdminPaciente.cns}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={resetAdministracaoForm}
                          className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        {loadingMedicamentos ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
                            <p className="mt-2 text-gray-600">
                              Carregando medicamentos...
                            </p>
                          </div>
                        ) : medicamentosDaUbs &&
                          medicamentosDaUbs.length > 0 ? (
                          <div className="space-y-4">
                            {medicamentosDaUbs.map((med: any) => (
                              <div
                                key={med.id}
                                className="border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <p className="text-sm text-gray-500">
                                      {med.nome}
                                    </p>
                                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                                      UBS: {med.ubs?.nome || "Não informada"}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {med.descricao}
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                    <p>
                                      <span className="font-medium text-gray-700">
                                        Lote:
                                      </span>{" "}
                                      {med.lote}
                                    </p>
                                    <p>
                                      <span className="font-medium text-gray-700">
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
                                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                      Administrar
                                    </button>
                                  ) : (
                                    <span className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                                      Sem estoque
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">
                            Nenhum medicamento encontrado para sua UBS.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {editingMed && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div
                      className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Editar medicação
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900">
                            {editingMed.descricao}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={resetMedForm}
                          className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form
                        onSubmit={handleMedSubmit}
                        className="space-y-6 px-6 py-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">
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
                              className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              placeholder="Ex: 100"
                            />
                          </label>
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">
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
                              className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                          </label>
                        </div>

                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">
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
                            className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            rows={4}
                            placeholder="Observações sobre o medicamento"
                          />
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={resetMedForm}
                            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={updateMedicamentoMutation.isLoading}
                            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
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
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div
                      className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Ministrar ao paciente
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900">
                            {selectedMed.nome}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={resetAdministracaoForm}
                          className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form
                        onSubmit={handleAdministrarSubmit}
                        className="space-y-6 px-6 py-6"
                      >
                        <p className="text-sm text-slate-600">
                          Lote: {selectedMed.lote} • Disponível:{" "}
                          {selectedMed.quantidade} unidades
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block md:col-span-2">
                            <span className="text-sm font-medium text-slate-700">
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
                              className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </label>
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">
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
                              className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </label>
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">
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
                              className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-sm font-medium text-slate-700">
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
                              className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                          </label>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={resetAdministracaoForm}
                            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={administrarMedicamentoMutation.isLoading}
                            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
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

            {/* Histórico Tab */}
            {activeTab === "historico" && selectedPaciente && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Histórico Médico
                    </h2>
                    <p className="text-gray-600">
                      Paciente: {selectedPaciente.nome}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("pacientes")}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Voltar
                  </button>
                </div>

                {historicoPaciente && historicoPaciente.length > 0 ? (
                  <div className="space-y-4">
                    {historicoPaciente.map((item: any) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.diagnostico}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {format(
                                new Date(item.dataConsulta),
                                "dd/MM/yyyy",
                                { locale: ptBR },
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {item.funcionario.nome}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.funcionario.funcao}
                            </p>
                            {item.funcionario.crm && (
                              <p className="text-sm text-gray-600">
                                CRM: {item.funcionario.crm}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Laudo:</p>
                            <p className="text-gray-600">{item.laudo}</p>
                          </div>
                          {item.doenca && (
                            <div>
                              <p className="font-medium text-gray-700">
                                Doença:
                              </p>
                              <p className="text-gray-600">{item.doenca}</p>
                            </div>
                          )}
                          {item.medicacao && (
                            <div>
                              <p className="font-medium text-gray-700">
                                Medicação:
                              </p>
                              <p className="text-gray-600">{item.medicacao}</p>
                            </div>
                          )}
                          {item.observacoes && (
                            <div>
                              <p className="font-medium text-gray-700">
                                Observações:
                              </p>
                              <p className="text-gray-600">
                                {item.observacoes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nenhum histórico médico encontrado para este paciente.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Minhas Solicitações Tab */}
            {activeTab === "solicitacoes" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Minhas Solicitações de Internação
                  </h2>
                </div>

                {minhasSolicitacoes && minhasSolicitacoes.length > 0 ? (
                  <div className="space-y-4">
                    {minhasSolicitacoes.map((solicitacao: any) => (
                      <div
                        key={solicitacao.id}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {solicitacao.paciente.nome}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Hospital: {solicitacao.hospital.nome}
                            </p>
                            <p className="text-sm text-gray-600">
                              Solicitado em:{" "}
                              {format(
                                new Date(solicitacao.createdAt),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR },
                              )}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(solicitacao.status)}`}
                            >
                              {solicitacao.status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getPrioridadeColor(solicitacao.prioridade)}`}
                            >
                              {solicitacao.prioridade}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Tipo:</p>
                            <p className="text-gray-600">{solicitacao.tipo}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Motivo:</p>
                            <p className="text-gray-600">
                              {solicitacao.motivo}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="font-medium text-gray-700">
                              Detalhes:
                            </p>
                            <p className="text-gray-600">
                              {solicitacao.detalhes}
                            </p>
                          </div>
                          {solicitacao.observacoes && (
                            <div className="md:col-span-2">
                              <p className="font-medium text-gray-700">
                                Observações:
                              </p>
                              <p className="text-gray-600">
                                {solicitacao.observacoes}
                              </p>
                            </div>
                          )}
                          {solicitacao.dataAgendada && (
                            <div>
                              <p className="font-medium text-gray-700">
                                Data Agendada:
                              </p>
                              <p className="text-gray-600">
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
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nenhuma solicitação de internação encontrada.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Consultas Tab */}
            {activeTab === "consultas" && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Minhas Consultas
                  </h2>
                </div>

                {consultas && consultas.length > 0 ? (
                  <div className="space-y-4">
                    {consultas.map((consulta: any) => (
                      <div
                        key={consulta.id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {consulta.paciente?.nome || "N/A"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              CPF: {consulta.paciente?.cpf || "N/A"}
                            </p>
                            {consulta.dataAgendada && (
                              <p className="text-sm text-gray-600">
                                Agendada para:{" "}
                                {format(
                                  new Date(consulta.dataAgendada),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR },
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(consulta.status)}`}
                            >
                              {consulta.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="font-medium text-gray-700">
                              Especialidade:
                            </p>
                            <p className="text-gray-600">
                              {consulta.especialidade}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Motivo:</p>
                            <p className="text-gray-600">{consulta.motivo}</p>
                          </div>
                          {consulta.ubs && (
                            <div>
                              <p className="font-medium text-gray-700">UBS:</p>
                              <p className="text-gray-600">
                                {consulta.ubs.nome}
                              </p>
                            </div>
                          )}
                          {consulta.dataCancelamento && (
                            <div>
                              <p className="font-medium text-gray-700">
                                Cancelada em:
                              </p>
                              <p className="text-gray-600">
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
                              <p className="font-medium text-gray-700">
                                Observações:
                              </p>
                              <p className="text-gray-600">
                                {consulta.observacoes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Histórico vinculado */}
                        {consulta.historicoMedico ? (
                          <div className="border-t pt-3 mt-3 bg-green-50 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-green-700 mb-1">
                                  ✓ Histórico registrado
                                </p>
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">
                                    Diagnóstico:
                                  </span>{" "}
                                  {consulta.historicoMedico.diagnostico}
                                </p>
                                {consulta.historicoMedico.doenca && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">Doença:</span>{" "}
                                    {consulta.historicoMedico.doenca}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedPaciente(consulta.paciente);
                                  setActiveTab("historico");
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <FileText className="h-3 w-3" />
                                Ver Histórico
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-t pt-3 mt-3 flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              Sem histórico médico registrado
                            </p>
                            <button
                              onClick={() =>
                                setModalHistorico({ aberto: true, consulta })
                              }
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              + Registrar Histórico
                            </button>
                          </div>
                        )}

                        <div className="border-t pt-3 mt-3">
                          <p className="text-xs text-gray-500">
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
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Nenhuma consulta encontrada.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Modal Registrar Histórico */}
            {modalHistorico.aberto && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Registrar Histórico Médico
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Paciente: {modalHistorico.consulta?.paciente?.nome}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setModalHistorico({ aberto: false, consulta: null })
                      }
                      className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  <form
                    onSubmit={handleRegistrarHistorico}
                    className="p-6 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Laudo *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formHistorico.laudo}
                        onChange={(e) =>
                          setFormHistorico((prev) => ({
                            ...prev,
                            laudo: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descreva o laudo médico..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diagnóstico *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formHistorico.diagnostico}
                        onChange={(e) =>
                          setFormHistorico((prev) => ({
                            ...prev,
                            diagnostico: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Diagnóstico do paciente..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doença
                      </label>
                      <input
                        type="text"
                        value={formHistorico.doenca}
                        onChange={(e) =>
                          setFormHistorico((prev) => ({
                            ...prev,
                            doenca: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="CID ou nome da doença..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medicação
                      </label>
                      <input
                        type="text"
                        value={formHistorico.medicacao}
                        onChange={(e) =>
                          setFormHistorico((prev) => ({
                            ...prev,
                            medicacao: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Medicações prescritas..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        rows={2}
                        value={formHistorico.observacoes}
                        onChange={(e) =>
                          setFormHistorico((prev) => ({
                            ...prev,
                            observacoes: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Observações adicionais..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data da Consulta *
                      </label>
                      <input
                        type="date"
                        required
                        value={formHistorico.dataConsulta}
                        onChange={(e) =>
                          setFormHistorico((prev) => ({
                            ...prev,
                            dataConsulta: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setModalHistorico({ aberto: false, consulta: null })
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loadingHistorico}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
