import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";
import { toast } from "react-toastify";

export const useUBSDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showFuncModal, setShowFuncModal] = useState(false);
  const [showCampanhaModal, setShowCampanhaModal] = useState(false);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showCancelamentoModal, setShowCancelamentoModal] = useState(false);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showInscricoesModal, setShowInscricoesModal] = useState(false);
  const [showAgendamentoCampanhaModal, setShowAgendamentoCampanhaModal] =
    useState(false);
  const [showConsultaPacienteModal, setShowConsultaPacienteModal] =
    useState(false);
  const [showEditCampanhaModal, setShowEditCampanhaModal] = useState(false);
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingCampanha, setEditingCampanha] = useState<any>(null);
  const [editingMed, setEditingMed] = useState<any>(null);
  const [medData, setMedData] = useState({
    nome: "",
    descricao: "",
    lote: "",
    quantidade: "",
    dataValidade: "",
    vencido: false,
  });
  const [selectedConsulta, setSelectedConsulta] = useState<any>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [selectedCampanha, setSelectedCampanha] = useState<any>(null);
  const [inscricoesPorCampanha, setInscricoesPorCampanha] = useState<{
    [key: string]: any[];
  }>({});
  const [selectedInscricao, setSelectedInscricao] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [consultaSearchTerm, setConsultaSearchTerm] = useState("");
  const [consultaStatusFilter, setConsultaStatusFilter] = useState("todas");

  const [funcData, setFuncData] = useState({
    nome: "",
    funcao: "",
    crm: "",
    cpf: "",
    telefone: "",
    email: "",
    senha: "",
  });

  const [campanhaData, setCampanhaData] = useState({
    titulo: "",
    descricao: "",
    tipo: "",
    dataIni: "",
    dataFim: "",
  });

  const [agendamentoData, setAgendamentoData] = useState({
    dataAgendada: "",
    funcionarioId: "",
    observacoes: "",
  });

  const [cancelamentoData, setCancelamentoData] = useState({
    observacoes: "",
  });

  const [pacienteEditData, setPacienteEditData] = useState({
    endereco: "",
    telefone: "",
  });

  const [consultaPacienteData, setConsultaPacienteData] = useState({
    especialidade: "",
    motivo: "",
    dataAgendada: "",
    funcionarioId: "",
    observacoes: "",
  });

  const [agendamentoCampanhaData, setAgendamentoCampanhaData] = useState({
    dataAgendada: "",
    horaAgendada: "",
    localAtendimento: "",
    observacoes: "",
  });

  const [editCampanhaData, setEditCampanhaData] = useState({
    titulo: "",
    descricao: "",
    tipo: "",
    dataIni: "",
    dataFim: "",
  });

  const [internacaoData, setInternacaoData] = useState({
    hospitalId: "",
    funcionarioId: "",
    tipo: "",
    motivo: "",
    detalhes: "",
    laudoMedico: "",
    prioridade: "media",
  });

  // Queries
  const { data: funcionarios, isLoading: loadingFuncionarios } = useQuery(
    "ubs-funcionarios",
    () => api.get("/ubs/funcionarios").then((res) => res.data),
    {
      enabled:
        activeTab === "funcionarios" ||
        showAgendamentoModal ||
        showCancelamentoModal ||
        showConsultaPacienteModal ||
        showInternacaoModal,
    },
  );

  const { data: pacientes, isLoading: loadingPacientes } = useQuery(
    ["ubs-pacientes", searchTerm],
    () => api.get(`/ubs/pacientes?busca=${searchTerm}`).then((res) => res.data),
    { enabled: activeTab === "pacientes" },
  );

  const { data: historicoPaciente } = useQuery(
    ["paciente-historico-ubs", selectedPaciente?.id],
    () =>
      api
        .get(`/ubs/pacientes/${selectedPaciente.id}/historico`)
        .then((res) => res.data),
    { enabled: !!selectedPaciente && showHistoricoModal },
  );

  const { data: consultasPaciente } = useQuery(
    ["paciente-consultas-ubs", selectedPaciente?.id],
    () =>
      api
        .get(`/ubs/pacientes/${selectedPaciente.id}/consultas`)
        .then((res) => res.data),
    { enabled: !!selectedPaciente && showHistoricoModal },
  );

  const { data: inscricoesCampanha } = useQuery(
    ["campanha-inscricoes", selectedCampanha?.id],
    () =>
      api
        .get(`/ubs/campanhas/${selectedCampanha.id}/inscricoes`)
        .then((res) => res.data),
    { enabled: !!selectedCampanha && showInscricoesModal },
  );

  const { data: campanhas, isLoading: loadingCampanhas } = useQuery(
    "ubs-campanhas",
    () => api.get("/ubs/campanhas").then((res) => res.data),
    {
      enabled: activeTab === "campanhas",
      onSuccess: (data) => {
        data.forEach((campanha: any) => {
          if (campanha?._count?.inscricoes > 0) {
            api
              .get(`/ubs/campanhas/${campanha.id}/inscricoes`)
              .then((res) => {
                setInscricoesPorCampanha((prev) => ({
                  ...prev,
                  [campanha.id]: res.data,
                }));
              })
              .catch((err) =>
                console.error("Erro ao carregar inscrições:", err),
              );
          }
        });
      },
    },
  );

  const { data: consultas, isLoading: loadingConsultas } = useQuery(
    "ubs-consultas",
    () => api.get("/ubs/consultas").then((res) => res.data),
    { enabled: activeTab === "consultas" },
  );

  const filteredConsultas = (consultas || []).filter((consulta: any) => {
    const matchesStatus =
      consultaStatusFilter === "todas" ||
      consulta.status === consultaStatusFilter;

    const pacienteNome = consulta?.paciente?.nome?.toLowerCase() || "";
    const matchesSearch = pacienteNome.includes(
      consultaSearchTerm.toLowerCase(),
    );

    return matchesStatus && matchesSearch;
  });

  const {
    data: hospitaisList,
    isLoading: loadingHospitais,
    isError: hospitaisError,
  } = useQuery(
    "hospitais",
    () => api.get("/ubs/hospitais").then((res) => res.data),
    {
      enabled: showInternacaoModal,
      onError: (error) => {
        console.error("Erro ao carregar hospitais:", error);
        toast.error("Erro ao carregar lista de hospitais");
      },
    },
  );

  const { data: medicamentos, isLoading: loadingMedicamentos } = useQuery(
    ["ubs-medicamentos", searchTerm],
    () =>
      api
        .get("/ubs/medicamentos", { params: { busca: searchTerm } })
        .then((res) => res.data),
    { enabled: activeTab === "medicamentos" },
  );

  const { data: dashboardStats, isLoading: loadingDashboardStats } = useQuery(
    "ubs-dashboard-estatisticas",
    () => api.get("/ubs/dashboard/estatisticas").then((res) => res.data),
    { enabled: activeTab === "dashboard" },
  );

  const [reportType, setReportType] = useState("estoque");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");

  const {
    data: relatorio,
    isLoading: loadingRelatorio,
    refetch: fetchRelatorio,
  } = useQuery(
    ["ubs-relatorio", reportType, reportStartDate, reportEndDate],
    () =>
      api
        .get("/ubs/Relatorio", {
          params: {
            tipo: reportType,
            dataInicio: reportStartDate,
            dataFim: reportEndDate,
          },
        })
        .then((res) => res.data),
    {
      enabled: false,
      retry: false,
      onError: (error: any) => {
        console.error("Erro ao carregar relatório UBS:", error);
        toast.error(
          error.response?.data?.message || "Erro ao carregar relatório",
        );
      },
    },
  );

  // Mutations
  const createFuncMutation = useMutation(
    (data: any) => api.post("/ubs/funcionarios", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-funcionarios");
        toast.success("Funcionário cadastrado com sucesso!");
        setShowFuncModal(false);
        resetFuncForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao cadastrar funcionário",
        );
      },
    },
  );

  const updateFuncMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/funcionarios/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-funcionarios");
        toast.success("Funcionário atualizado com sucesso!");
        setShowFuncModal(false);
        resetFuncForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar funcionário",
        );
      },
    },
  );

  const deleteFuncMutation = useMutation(
    (id: string) => api.delete(`/ubs/funcionarios/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-funcionarios");
        toast.success("Funcionário deletado com sucesso!");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao deletar funcionário",
        );
      },
    },
  );

  const createCampanhaMutation = useMutation(
    (data: any) => api.post("/ubs/campanhas", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-campanhas");
        toast.success("Campanha criada com sucesso!");
        setShowCampanhaModal(false);
        resetCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erro ao criar campanha");
      },
    },
  );

  const updateCampanhaMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/campanhas/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-campanhas");
        toast.success("Campanha atualizada com sucesso!");
        setShowEditCampanhaModal(false);
        resetEditCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar campanha",
        );
      },
    },
  );

  const deleteCampanhaMutation = useMutation(
    (id: string) => api.delete(`/ubs/campanhas/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-campanhas");
        toast.success("Campanha excluída com sucesso!");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao excluir campanha",
        );
      },
    },
  );

  const agendarConsultaMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/consultas/${id}/agendar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-consultas");
        toast.success("Consulta agendada com sucesso!");
        setShowAgendamentoModal(false);
        setSelectedConsulta(null);
        resetAgendamentoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao agendar consulta",
        );
      },
    },
  );

  const cancelamentoConsultaMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/consultas/${id}/cancelamento`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("ubs-consultas");
        toast.success("Consulta cancelada com sucesso!");
        setShowCancelamentoModal(false);
        setSelectedConsulta(null);
        resetCancelamentoForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao cancelar consulta",
        );
      },
    },
  );

  const editPacienteMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/ubs/pacientes/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ubs-pacientes", searchTerm]);
        toast.success("Paciente atualizado com sucesso!");
        setShowPacienteModal(false);
        setSelectedPaciente(null);
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar paciente",
        );
      },
    },
  );

  const agendarConsultaPacienteMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.post(`/ubs/pacientes/${id}/agendar-consulta`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          "paciente-consultas-ubs",
          selectedPaciente?.id,
        ]);
        toast.success("Consulta agendada com sucesso!");
        setShowConsultaPacienteModal(false);
        resetConsultaPacienteForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao agendar consulta",
        );
      },
    },
  );

  const agendarAtendimentoCampanhaMutation = useMutation(
    ({
      campanhaId,
      inscricaoId,
      data,
    }: {
      campanhaId: string;
      inscricaoId: string;
      data: any;
    }) =>
      api.put(
        `/ubs/campanhas/${campanhaId}/inscricoes/${inscricaoId}/agendar`,
        data,
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          "campanha-inscricoes",
          selectedCampanha?.id,
        ]);
        toast.success("Atendimento agendado com sucesso!");
        setShowAgendamentoCampanhaModal(false);
        setSelectedInscricao(null);
        resetAgendamentoCampanhaForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao agendar atendimento",
        );
      },
    },
  );

  const solicitarInternacaoMutation = useMutation(
    (data: any) => api.post("/ubs/solicitar-internacao", data),
    {
      onSuccess: () => {
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

  const createMedMutation = useMutation(
    (data: any) => api.post("/medicamentos", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ubs-medicamentos"]);
        toast.success("Medicamento cadastrado com sucesso!");
        setShowMedModal(false);
        resetMedForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao cadastrar medicamento",
        );
      },
    },
  );

  const updateMedMutation = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      api.put(`/medicamentos/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["ubs-medicamentos"]);
        toast.success("Medicamento atualizado com sucesso!");
        setShowMedModal(false);
        resetMedForm();
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao atualizar medicamento",
        );
      },
    },
  );

  // Reset functions
  const resetFuncForm = () => {
    setFuncData({
      nome: "",
      funcao: "",
      crm: "",
      cpf: "",
      telefone: "",
      email: "",
      senha: "",
    });
    setEditingItem(null);
  };

  const resetCampanhaForm = () => {
    setCampanhaData({
      titulo: "",
      descricao: "",
      tipo: "",
      dataIni: "",
      dataFim: "",
    });
  };

  const resetEditCampanhaForm = () => {
    setEditCampanhaData({
      titulo: "",
      descricao: "",
      tipo: "",
      dataIni: "",
      dataFim: "",
    });
    setEditingCampanha(null);
  };

  const resetAgendamentoForm = () => {
    setAgendamentoData({
      dataAgendada: "",
      funcionarioId: "",
      observacoes: "",
    });
  };

  const resetCancelamentoForm = () => {
    setCancelamentoData({
      observacoes: "",
    });
  };

  const resetConsultaPacienteForm = () => {
    setConsultaPacienteData({
      especialidade: "",
      motivo: "",
      dataAgendada: "",
      funcionarioId: "",
      observacoes: "",
    });
  };

  const resetAgendamentoCampanhaForm = () => {
    setAgendamentoCampanhaData({
      dataAgendada: "",
      horaAgendada: "",
      localAtendimento: "",
      observacoes: "",
    });
  };

  const resetInternacaoForm = () => {
    setInternacaoData({
      hospitalId: "",
      funcionarioId: "",
      tipo: "",
      motivo: "",
      detalhes: "",
      laudoMedico: "",
      prioridade: "media",
    });
  };

  const resetMedForm = () => {
    setMedData({
      nome: "",
      descricao: "",
      lote: "",
      quantidade: "",
      dataValidade: "",
      vencido: false,
    });
    setEditingMed(null);
  };

  // Handlers
  const handleFuncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateFuncMutation.mutate({ id: editingItem.id, data: funcData });
    } else {
      createFuncMutation.mutate(funcData);
    }
  };

  const handleCampanhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampanhaMutation.mutate(campanhaData);
  };

  const handleEditCampanhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCampanha) {
      updateCampanhaMutation.mutate({
        id: editingCampanha.id,
        data: editCampanhaData,
      });
    }
  };

  const handleAgendamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedConsulta) {
      agendarConsultaMutation.mutate({
        id: selectedConsulta.id,
        data: agendamentoData,
      });
    }
  };

  const handleCancelamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedConsulta) {
      cancelamentoConsultaMutation.mutate({
        id: selectedConsulta.id,
        data: cancelamentoData,
      });
    }
  };

  const handlePacienteEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      editPacienteMutation.mutate({
        id: selectedPaciente.id,
        data: pacienteEditData,
      });
    }
  };

  const handleConsultaPacienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPaciente) {
      agendarConsultaPacienteMutation.mutate({
        id: selectedPaciente.id,
        data: consultaPacienteData,
      });
    }
  };

  const handleAgendamentoCampanhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCampanha && selectedInscricao) {
      agendarAtendimentoCampanhaMutation.mutate({
        campanhaId: selectedCampanha.id,
        inscricaoId: selectedInscricao.id,
        data: agendamentoCampanhaData,
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

  const handleMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestData = {
      nome: medData.nome,
      descricao: medData.descricao,
      lote: medData.lote,
      quantidade: Number(medData.quantidade),
      dataValidade: medData.dataValidade,
      vencido: medData.vencido,
    };

    if (editingMed) {
      updateMedMutation.mutate({ id: editingMed.id, data: requestData });
    } else {
      createMedMutation.mutate(requestData);
    }
  };

  const handleEditMed = (medicamento: any) => {
    setEditingMed(medicamento);
    setMedData({
      nome: medicamento.nome || "",
      descricao: medicamento.descricao || "",
      lote: medicamento.lote || "",
      quantidade: String(medicamento.quantidade ?? ""),
      dataValidade: medicamento.dataValidade
        ? medicamento.dataValidade.split("T")[0]
        : "",
      vencido: medicamento.vencido || false,
    });
    setShowMedModal(true);
  };

  const handleEditFunc = (func: any) => {
    setEditingItem(func);
    setFuncData({
      nome: func.nome,
      funcao: func.funcao,
      crm: func.crm || "",
      cpf: func.cpf,
      telefone: func.telefone,
      email: func.email,
      senha: "",
    });
    setShowFuncModal(true);
  };

  const handleEditCampanha = (camp: any) => {
    setEditingCampanha(camp);
    setEditCampanhaData({
      titulo: camp.titulo,
      descricao: camp.descricao,
      tipo: camp.tipo,
      dataIni: camp.dataIni.split("T")[0],
      dataFim: camp.dataFim ? camp.dataFim.split("T")[0] : "",
    });
    setShowEditCampanhaModal(true);
  };

  const handleDeleteFunc = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este funcionário?")) {
      deleteFuncMutation.mutate(id);
    }
  };

  const handleDeleteCampanha = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta campanha?")) {
      deleteCampanhaMutation.mutate(id);
    }
  };

  const openAgendamentoModal = (consulta: any) => {
    setSelectedConsulta(consulta);
    setShowAgendamentoModal(true);
  };

  const openCancelamentoModal = (consulta: any) => {
    setSelectedConsulta(consulta);
    setShowCancelamentoModal(true);
  };

  const openPacienteModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setPacienteEditData({
      endereco: paciente.endereco,
      telefone: paciente.telefone,
    });
    setShowPacienteModal(true);
  };

  const openHistoricoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowHistoricoModal(true);
  };

  const openInscricoesModal = (campanha: any) => {
    setSelectedCampanha(campanha);
    setShowInscricoesModal(true);
  };

  const openAgendamentoCampanhaModal = (inscricao: any) => {
    setSelectedInscricao(inscricao);
    setShowAgendamentoCampanhaModal(true);
  };

  const openConsultaPacienteModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowConsultaPacienteModal(true);
  };

  const openInternacaoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowInternacaoModal(true);
    queryClient.prefetchQuery("hospitais", () =>
      api.get("/ubs/hospitais").then((res) => res.data),
    );
  };

  return {
    user,
    logout,
    activeTab,
    setActiveTab,
    showFuncModal,
    setShowFuncModal,
    showCampanhaModal,
    setShowCampanhaModal,
    showAgendamentoModal,
    setShowAgendamentoModal,
    showCancelamentoModal,
    setShowCancelamentoModal,
    showPacienteModal,
    setShowPacienteModal,
    showHistoricoModal,
    setShowHistoricoModal,
    showInscricoesModal,
    setShowInscricoesModal,
    showAgendamentoCampanhaModal,
    setShowAgendamentoCampanhaModal,
    showConsultaPacienteModal,
    setShowConsultaPacienteModal,
    showEditCampanhaModal,
    setShowEditCampanhaModal,
    showInternacaoModal,
    setShowInternacaoModal,
    showMedModal,
    setShowMedModal,
    editingItem,
    editingCampanha,
    editingMed,
    medData,
    setMedData,
    selectedConsulta,
    selectedPaciente,
    selectedCampanha,
    inscricoesPorCampanha,
    selectedInscricao,
    searchTerm,
    setSearchTerm,
    consultaSearchTerm,
    setConsultaSearchTerm,
    consultaStatusFilter,
    setConsultaStatusFilter,
    funcData,
    setFuncData,
    campanhaData,
    setCampanhaData,
    agendamentoData,
    setAgendamentoData,
    cancelamentoData,
    setCancelamentoData,
    pacienteEditData,
    setPacienteEditData,
    consultaPacienteData,
    setConsultaPacienteData,
    agendamentoCampanhaData,
    setAgendamentoCampanhaData,
    editCampanhaData,
    setEditCampanhaData,
    internacaoData,
    setInternacaoData,

    // Data
    funcionarios,
    loadingFuncionarios,
    pacientes,
    loadingPacientes,
    historicoPaciente,
    consultasPaciente,
    inscricoesCampanha,
    campanhas,
    loadingCampanhas,
    consultas,
    loadingConsultas,
    filteredConsultas,
    hospitaisList,
    loadingHospitais,
    hospitaisError,
    medicamentos,
    loadingMedicamentos,
    dashboardStats,
    loadingDashboardStats,
    reportType,
    setReportType,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    relatorio,
    loadingRelatorio,
    fetchRelatorio,

    // Mutations
    solicitarInternacaoMutation,

    // Handlers
    handleFuncSubmit,
    handleCampanhaSubmit,
    handleEditCampanhaSubmit,
    handleAgendamentoSubmit,
    handleCancelamentoSubmit,
    handlePacienteEditSubmit,
    handleConsultaPacienteSubmit,
    handleAgendamentoCampanhaSubmit,
    handleInternacaoSubmit,
    handleMedSubmit,
    handleEditMed,
    handleEditFunc,
    handleEditCampanha,
    handleDeleteFunc,
    handleDeleteCampanha,
    openAgendamentoModal,
    openCancelamentoModal,
    openPacienteModal,
    openHistoricoModal,
    openInscricoesModal,
    openAgendamentoCampanhaModal,
    openConsultaPacienteModal,
    openInternacaoModal,
    resetMedForm,
  };
};
