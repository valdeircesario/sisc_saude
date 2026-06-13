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
  Download,
  Package,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReceitasAtestado from "../../components/receitasAtestado";
import FuncionarioPacientesTab from "../../components/Funcionario/FuncionarioPacientesTab";
import FuncionarioMedicamentosTab from "../../components/Funcionario/FuncionarioMedicamentosTab";
import FuncionarioMedicationModals from "../../components/Funcionario/FuncionarioMedicationModals";
import FuncionarioConsultarReceitaTab from "../../components/Funcionario/FuncionarioConsultarReceitaTab";
import FuncionarioConsultasTab from "../../components/Funcionario/FuncionarioConsultasTab";
import FuncionarioConsultaModals from "../../components/Funcionario/FuncionarioConsultaModals";
import { FuncionarioHeader } from "../../components/Funcionario/FuncionarioHeader";
import { FuncionarioSidebar } from "../../components/Funcionario/FuncionarioSidebar";
import { urlToBase64 } from "../../utils/urlToBase64";
import { generateReceitaPDF } from "../../utils/pdfGenerator";

const FuncionarioDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("pacientes");
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showBuscaHistoricoModal, setShowBuscaHistoricoModal] = useState(false);
  const [showVacinaModal, setShowVacinaModal] = useState(false);
  const [showExameModal, setShowExameModal] = useState(false);
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exameSearchTerm, setExameSearchTerm] = useState("");
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
  const [cpfHistoricoBusca, setCpfHistoricoBusca] = useState("");
  const [historicoBuscaResultado, setHistoricoBuscaResultado] =
    useState<any>(null);
  const [registroHistoricoDetalhe, setRegistroHistoricoDetalhe] =
    useState<any>(null);

  // Estados para consulta de receita (UBS - Enfermeiro/Farmacêutico)
  const [registroReceitaBusca, setRegistroReceitaBusca] = useState("");
  const [receitaEncontrada, setReceitaEncontrada] = useState<any>(null);
  const [carregandoReceita, setCarregandoReceita] = useState(false);

  // Estados para dispensação de receita
  const [showDispensacaoModal, setShowDispensacaoModal] = useState(false);
  const [showDetalhesDispensacaoModal, setShowDetalhesDispensacaoModal] =
    useState(false);
  const [dispensacaoData, setDispensacaoData] = useState({
    statusDispensacao: "completa",
    medicamentoFornecido: "",
    quantidadeDispensada: "",
    observacoesDispensacao: "",
  });
  const [medicamentosSelecionados, setMedicamentosSelecionados] = useState<
    Record<
      string,
      {
        selecionado: boolean;
        medicamentoFornecido: string;
        quantidadeDispensada: number;
        observacoes: string;
      }
    >
  >({});
  const [carregandoValidacaoDispensacao, setCarregandoValidacaoDispensacao] =
    useState(false);
  const [erroDispensacao, setErroDispensacao] = useState<any>(null);

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

  const {
    data: consultas,
    refetch: refetchConsultas,
    isFetching: loadingConsultas,
  } = useQuery(
    "funcionario-consultas",
    () => api.get("/funcionario/consultas").then((res) => res.data),
    {
      enabled: activeTab === "consultas",
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
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

  const buscarHistoricoPorCpfMutation = useMutation(
    (cpf: string) =>
      api
        .get("/funcionario/historico-paciente/cpf", { params: { cpf } })
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setHistoricoBuscaResultado(data);
        setSelectedPaciente(data.paciente);
        setRegistroHistoricoDetalhe(null);
        setCpfHistoricoBusca("");
        setShowBuscaHistoricoModal(false);
        toast.success("Histórico encontrado com sucesso!");
      },
      onError: (error: any) => {
        setHistoricoBuscaResultado(null);
        toast.error(
          error.response?.data?.message ||
            "Não foi possível buscar o histórico.",
        );
      },
    },
  );

  // seus estados de receita, paciente, medico, ubs já existem aqui...

  // Mutation para buscar receita pelo registro de assinatura
  const buscarReceitaMutation = useMutation(
    (registro: string) =>
      api
        .get(`/funcionario/consultar-receita/${encodeURIComponent(registro)}`)
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setReceitaEncontrada(data);
        setRegistroReceitaBusca("");
        toast.success("Receita encontrada com sucesso!");
      },
      onError: (error: any) => {
        setReceitaEncontrada(null);
        toast.error(error.response?.data?.message || "Receita não encontrada");
      },
    },
  );

  // Mutation para validar se a receita pode ser dispensada
  const validarDispensacaoMutation = useMutation(
    (receitaId: string) =>
      api
        .get(`/funcionario/validar-dispensacao/${receitaId}`)
        .then((res) => res.data),
    {
      onSuccess: (data) => {
        setErroDispensacao(null);
        setDispensacaoData({
          statusDispensacao: "completa",
          medicamentoFornecido: data.receita?.medicamento || "",
          quantidadeDispensada: String(data.receita?.quantidade || "1"),
          observacoesDispensacao: "",
        });
        setShowDispensacaoModal(true);
      },
      onError: (error: any) => {
        setErroDispensacao(error.response?.data);
        toast.error(
          error.response?.data?.message ||
            "Erro ao validar dispensação da receita",
        );
      },
    },
  );

  // Mutation para dispensar receita
  const dispensarReceitaMutation = useMutation(
    (data: any) => api.post("/funcionario/dispensar-receita", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("funcionario-receitas");
        toast.success("Receita dispensada com sucesso!");
        setShowDispensacaoModal(false);
        resetDispensacaoForm();
        // Recarregar a receita após dispensação
        if (receitaEncontrada) {
          buscarReceitaMutation.mutate(
            receitaEncontrada.registroAssinatura || registroReceitaBusca,
          );
        }
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao dispensar receita",
        );
        setErroDispensacao(error.response?.data);
      },
    },
  );

  const dispensarMedicamentosMutation = useMutation(
    (data: any) => api.post("/funcionario/dispensar-medicamentos", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("funcionario-receitas");
        toast.success("Medicamentos dispensados com sucesso!");
        setShowDispensacaoModal(false);
        resetDispensacaoForm();
        setMedicamentosSelecionados({});
        // Recarregar a receita após dispensação
        if (receitaEncontrada) {
          buscarReceitaMutation.mutate(
            receitaEncontrada.registroAssinatura || registroReceitaBusca,
          );
        }
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao dispensar medicamentos",
        );
        setErroDispensacao(error.response?.data);
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

  const resetDispensacaoForm = () => {
    setDispensacaoData({
      statusDispensacao: "completa",
      medicamentoFornecido: "",
      quantidadeDispensada: "",
      observacoesDispensacao: "",
    });
    setMedicamentosSelecionados({});
    setErroDispensacao(null);
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

  // Handlers para consulta de receita
  const handleBuscarReceita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroReceitaBusca.trim()) {
      toast.error("Informe o registro da assinatura da receita");
      return;
    }
    setCarregandoReceita(true);
    buscarReceitaMutation.mutate(registroReceitaBusca.trim());
    setCarregandoReceita(false);
  };

  const handleLimparReceita = () => {
    setReceitaEncontrada(null);
    setRegistroReceitaBusca("");
  };

  const handleValidarDispensacao = () => {
    if (!receitaEncontrada?.id) {
      toast.error("Receita não encontrada");
      return;
    }
    validarDispensacaoMutation.mutate(receitaEncontrada.id);
  };

  const handleDispensarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receitaEncontrada?.id) {
      toast.error("Receita não encontrada");
      return;
    }

    dispensarReceitaMutation.mutate({
      receitaId: receitaEncontrada.id,
      statusDispensacao: dispensacaoData.statusDispensacao,
      medicamentoFornecido:
        dispensacaoData.medicamentoFornecido || receitaEncontrada.medicamento,
      quantidadeDispensada:
        parseInt(dispensacaoData.quantidadeDispensada) ||
        parseInt(receitaEncontrada.quantidade),
      observacoesDispensacao: dispensacaoData.observacoesDispensacao,
    });
  };

  const handleDispensarMedicamentos = () => {
    if (!receitaEncontrada?.id) {
      toast.error("Receita não encontrada");
      return;
    }

    // Filtrar apenas medicamentos selecionados
    const medicamentosParaDispensar = Object.entries(medicamentosSelecionados)
      .filter(([_, data]) => data.selecionado)
      .map(([medicamentoId, data]) => {
        const medicamento = receitaEncontrada.itens.find(
          (item: any) => item.id === medicamentoId,
        );
        return {
          receitaMedicamentoId: medicamentoId,
          medicamentoFornecido:
            data.medicamentoFornecido || medicamento.medicamento,
          quantidadeDispensada:
            data.quantidadeDispensada || medicamento.quantidade,
          observacoes: data.observacoes,
        };
      });

    if (medicamentosParaDispensar.length === 0) {
      toast.error("Selecione pelo menos um medicamento para dispensar");
      return;
    }

    dispensarMedicamentosMutation.mutate({
      receitaId: receitaEncontrada.id,
      medicamentos: medicamentosParaDispensar,
    });
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

  const handleBuscarHistoricoPorCpf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfHistoricoBusca.trim()) {
      toast.error("Informe o CPF do paciente para buscar o histórico.");
      return;
    }

    buscarHistoricoPorCpfMutation.mutate(cpfHistoricoBusca.trim());
  };

  const abrirDetalheHistorico = (registro: any) => {
    setRegistroHistoricoDetalhe(registro);
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
  const [selectedConsulta, setSelectedConsulta] = useState<any>(null);
  const [showConsultaDetailsModal, setShowConsultaDetailsModal] =
    useState(false);

  const [formHistorico, setFormHistorico] = useState({
    laudo: "",
    diagnostico: "",
    doenca: "",
    medicacao: "",
    observacoes: "",
    dataConsulta: format(new Date(), "yyyy-MM-dd"),
  });

  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const formatConsultaDate = (value?: string | Date | null) => {
    if (!value) {
      return "Não informado";
    }

    return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getConsultaDisease = (consulta: any) =>
    consulta?.historicoMedico?.doenca?.trim() || "Sem doença registrada";

  // Função de submit
  const handleRegistrarHistorico = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingHistorico(true);
    try {
      await api.post("/funcionario/historico-medico", {
        pacienteId: modalHistorico.consulta?.paciente?.id,
        consultaId: modalHistorico.consulta?.id,
        ...formHistorico,
      });

      await queryClient.invalidateQueries("funcionario-consultas");
      await queryClient.invalidateQueries(["paciente-historico"]);
      await refetchConsultas();

      toast.success("Histórico médico registrado com sucesso!");

      setModalHistorico({ aberto: false, consulta: null });
      setFormHistorico({
        laudo: "",
        diagnostico: "",
        doenca: "",
        medicacao: "",
        observacoes: "",
        dataConsulta: format(new Date(), "yyyy-MM-dd"),
      });
    } catch (error: any) {
      console.error("Erro ao registrar histórico:", error);
      toast.error(
        error.response?.data?.message || "Erro ao registrar histórico médico",
      );
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
    { name: "Minhas Solicitações", key: "solicitacoes", icon: Building2 },
    { name: "Medicamentos", key: "medicamentos", icon: Pill },
    { name: "Exames", key: "exames", icon: FileText },
    { name: "Histórico Médico", key: "historico", icon: Shield },
    { name: "Receita/Atestado", key: "receitas", icon: FileText },
    { name: "Consultar Receita", key: "consultar_receita", icon: FileText },
  ];

  const navigation = allNavigation.filter((item) => {
    const funcao = user?.funcao?.toLowerCase().trim() || "";

    if (item.key === "consultas") {
      return ["medico", "médico"].includes(funcao);
    }
    if (item.key === "historico") {
      return ["medico", "médico"].includes(funcao);
    }
    if (item.key === "solicitacoes") {
      return ["medico", "médico"].includes(funcao);
    }
    if (item.key === "exames") {
      return ["medico", "médico"].includes(funcao);
    }
    if (item.key === "receitas") {
      return ["medico", "médico"].includes(funcao);
    }

    if (item.key === "medicamentos") {
      return ["enfermeiro", "farmaceutico", "farmacêutico"].includes(funcao);
    }
    if (item.key === "consultar_receita") {
      return ["enfermeiro", "farmaceutico", "farmacêutico"].includes(funcao);
    }

    return true;
  });

  const funcao =
    user?.funcao
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim() || "";

  const atualizarConsultas = async () => {
    await queryClient.invalidateQueries(["funcionario-consultas"]);
    await refetchConsultas();
  };

  const handleTabChange = (key: string) => {
    if (key === "historico") {
      setActiveTab("historico");
      setShowBuscaHistoricoModal(true);
      setHistoricoBuscaResultado(null);
      setRegistroHistoricoDetalhe(null);
      return;
    }

    if (key === "consultas") {
      setActiveTab("consultas");
      atualizarConsultas();
      return;
    }

    setActiveTab(key);
  };

  const isMedico = ["medico"].includes(funcao);

  const isEnfermagemOuFarmacia = ["enfermeiro", "farmaceutico"].includes(
    funcao,
  );

  const { data: examesRealizados, isLoading: loadingExames } = useQuery(
    "funcionario-exames",
    () => api.get("/funcionario/exames").then((res) => res.data),
    { enabled: isMedico && activeTab === "exames" },
  );

  React.useEffect(() => {
    if (!isMedico && activeTab === "exames") {
      setActiveTab("pacientes");
    }
  }, [activeTab, isMedico]);

  const filteredExames = useMemo(() => {
    const query = exameSearchTerm.trim().toLowerCase();

    return (examesRealizados || []).filter((item: any) => {
      const pacienteNome = item.paciente?.nome || "";
      const laboratorioNome = item.laboratorio?.nome || "";
      const tipoExame = item.tipo || "";

      return (
        pacienteNome.toLowerCase().includes(query) ||
        laboratorioNome.toLowerCase().includes(query) ||
        tipoExame.toLowerCase().includes(query)
      );
    });
  }, [examesRealizados, exameSearchTerm]);

  return (
    <div
      className="min-h-screen bg-[#EEF2F7]"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* ── HEADER ── */}
      <FuncionarioHeader
        userNome={user?.nome}
        userFuncao={user?.funcao}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── SIDEBAR ── */}
          <FuncionarioSidebar
            navigation={navigation}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">
            {/* ══ PACIENTES ══ */}
            {activeTab === "pacientes" && (
              <FuncionarioPacientesTab
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loadingPacientes={loadingPacientes}
                pacientes={pacientes}
                isMedico={isMedico}
                openExameModal={openExameModal}
                openInternacaoModal={openInternacaoModal}
                setSelectedPaciente={setSelectedPaciente}
                setActiveTab={setActiveTab}
                isEnfermagemOuFarmacia={isEnfermagemOuFarmacia}
                openVacinaModal={openVacinaModal}
                openAdministrarMedicamentoModal={
                  openAdministrarMedicamentoModal
                }
              />
            )}

            {/* ══ MEDICAMENTOS ══ */}
            {activeTab === "medicamentos" && (
              <FuncionarioMedicamentosTab
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loadingMedicamentos={loadingMedicamentos}
                medicamentosDaUbs={medicamentosDaUbs}
                handleEditMed={handleEditMed}
                openAdministrarMed={openAdministrarMed}
                showAdministradorMedicamentoModal={
                  showAdministradorMedicamentoModal
                }
                selectedAdminPaciente={selectedAdminPaciente}
                resetAdministracaoForm={resetAdministracaoForm}
                medSearchTerm={medSearchTerm}
                setMedSearchTerm={setMedSearchTerm}
                filteredMedicamentos={filteredMedicamentos}
                editingMed={editingMed}
                resetMedForm={resetMedForm}
                medData={medData}
                setMedData={setMedData}
                handleMedSubmit={handleMedSubmit}
                isUpdatingMed={updateMedicamentoMutation.isLoading}
                selectedMed={selectedMed}
                administracaoData={administracaoData}
                setAdministracaoData={setAdministracaoData}
                handleAdministrarSubmit={handleAdministrarSubmit}
                isAdministrandoMed={administrarMedicamentoMutation.isLoading}
              />
            )}

            {/* ══ MODAIS DE MEDICAÇÃO ══ */}
            <FuncionarioMedicationModals
              showAdministradorMedicamentoModal={
                showAdministradorMedicamentoModal
              }
              selectedAdminPaciente={selectedAdminPaciente}
              resetAdministracaoForm={resetAdministracaoForm}
              medSearchTerm={medSearchTerm}
              setMedSearchTerm={setMedSearchTerm}
              loadingMedicamentos={loadingMedicamentos}
              filteredMedicamentos={filteredMedicamentos}
              openAdministrarMed={openAdministrarMed}
              editingMed={editingMed}
              resetMedForm={resetMedForm}
              medData={medData}
              setMedData={setMedData}
              handleMedSubmit={handleMedSubmit}
              isUpdatingMed={updateMedicamentoMutation.isLoading}
              selectedMed={selectedMed}
              administracaoData={administracaoData}
              setAdministracaoData={setAdministracaoData}
              handleAdministrarSubmit={handleAdministrarSubmit}
              isAdministrandoMed={administrarMedicamentoMutation.isLoading}
            />

            {/* ══ HISTÓRICO ══ */}
            {activeTab === "historico" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid #D9E4F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                      Histórico Médico
                    </h2>
                    <p className="text-sm text-[#8FA8C4] mt-0.5">
                      Busque o paciente por CPF para visualizar todo o histórico
                      médico em ordem cronológica.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBuscaHistoricoModal(true)}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all"
                    style={{ background: "#1A3F72" }}
                  >
                    Buscar por CPF
                  </button>
                </div>

                {historicoBuscaResultado?.paciente && (
                  <div className="mb-5 rounded-xl border border-[#D9E4F0] bg-[#F7FAFE] p-4">
                    <p className="text-xs uppercase tracking-[0.08em] text-[#8FA8C4]">
                      Paciente localizado
                    </p>
                    <h3 className="text-lg font-semibold text-[#0F2242] mt-1">
                      {historicoBuscaResultado.paciente.nome}
                    </h3>
                    <p className="text-sm text-[#5C7A9B]">
                      CPF: {historicoBuscaResultado.paciente.cpf} • CNS:{" "}
                      {historicoBuscaResultado.paciente.cns || "—"}
                    </p>
                  </div>
                )}

                {historicoBuscaResultado?.registros?.length ? (
                  <div className="space-y-3">
                    {historicoBuscaResultado.registros.map((registro: any) => (
                      <article
                        key={`${registro.tipo}-${registro.id}`}
                        className="rounded-xl border border-[#E4EDF7] bg-[#FAFCFF] p-4"
                        style={{ borderLeft: "4px solid #1A3F72" }}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="rounded-full bg-[#EBF2FB] px-2.5 py-0.5 text-[11px] font-semibold text-[#1A3F72]">
                                {registro.categoria}
                              </span>
                              <span className="text-xs text-[#8FA8C4]">
                                {format(
                                  new Date(registro.dataRegistro),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR },
                                )}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-[#0F2242]">
                              {registro.titulo}
                            </h3>
                            <p className="text-sm text-[#3A5B82] mt-1">
                              {registro.resumo}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => abrirDetalheHistorico(registro)}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition-all"
                            style={{ background: "#145C35" }}
                          >
                            Visualizar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#C8D9ED] bg-[#F7FAFE] p-8 text-center">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
                    <p className="text-sm text-[#5C7A9B]">
                      Clique em “Buscar por CPF” para carregar todo o histórico
                      do paciente em uma linha do tempo.
                    </p>
                  </div>
                )}
              </div>
            )}

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
            {/* ══ CONSULTAR RECEITA ══ */}
            {activeTab === "consultar_receita" && (
              <FuncionarioConsultarReceitaTab
                receitaEncontrada={receitaEncontrada}
                handleBuscarReceita={handleBuscarReceita}
                registroReceitaBusca={registroReceitaBusca}
                setRegistroReceitaBusca={setRegistroReceitaBusca}
                buscarReceitaLoading={buscarReceitaMutation.isLoading}
                carregandoReceita={carregandoReceita}
                handleLimparReceita={handleLimparReceita}
                setShowDetalhesDispensacaoModal={
                  setShowDetalhesDispensacaoModal
                }
                handleValidarDispensacao={handleValidarDispensacao}
                isDispensando={dispensarReceitaMutation.isLoading}
                isValidando={carregandoValidacaoDispensacao}
              />
            )}
            {activeTab === "receitas" && <ReceitasAtestado />}

            {/* ══ CONSULTAS ══ */}
            {activeTab === "consultas" && (
              <FuncionarioConsultasTab
                loadingConsultas={loadingConsultas}
                consultas={consultas}
                formatConsultaDate={formatConsultaDate}
                getConsultaDisease={getConsultaDisease}
                setSelectedConsulta={setSelectedConsulta}
                setShowConsultaDetailsModal={setShowConsultaDetailsModal}
                setModalHistorico={setModalHistorico}
              />
            )}

            {activeTab === "exames" && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid #D9E4F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
                      Exames realizados
                    </h2>
                    <p className="text-sm text-[#8FA8C4] mt-0.5">
                      Liste os exames concluídos e realize o download do laudo.
                    </p>
                  </div>
                  <div className="relative md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-[#8FA8C4]" />
                    </div>
                    <input
                      type="text"
                      value={exameSearchTerm}
                      onChange={(e) => setExameSearchTerm(e.target.value)}
                      placeholder="Buscar por nome do paciente, laboratório ou tipo"
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
                    />
                  </div>
                </div>

                {loadingExames ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
                    <p className="mt-3 text-sm text-[#8FA8C4]">Carregando...</p>
                  </div>
                ) : filteredExames.length > 0 ? (
                  <div
                    className="overflow-hidden rounded-xl border"
                    style={{ borderColor: "#E4EDF7" }}
                  >
                    <div className="grid grid-cols-[1.8fr_1.4fr_1fr_1.2fr_auto] gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] bg-[#F8FAFD]">
                      <span>Paciente</span>
                      <span>Laboratório</span>
                      <span>Tipo de exame</span>
                      <span>Data da realização</span>
                      <span className="text-right">Ações</span>
                    </div>
                    <div
                      className="divide-y"
                      style={{ borderColor: "#E4EDF7" }}
                    >
                      {filteredExames.map((item: any) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[1.8fr_1.4fr_1fr_1.2fr_auto] gap-3 items-center px-4 py-3 bg-white"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#0F2242]">
                              {item.paciente?.nome || "Paciente não informado"}
                            </p>
                            <p className="text-xs text-[#8FA8C4]">
                              CPF: {item.paciente?.cpf || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[#3A5B82]">
                              {item.laboratorio?.nome || "Não informado"}
                            </p>
                            <p className="text-xs text-[#8FA8C4]">
                              {item.laboratorio?.telefone || "Sem contato"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[#3A5B82]">
                              {item.tipo || "Exame"}
                            </p>
                            <p className="text-xs text-[#8FA8C4]">
                              Status: {item.status || "realizado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[#3A5B82]">
                              {item.dataRealizado
                                ? format(
                                    new Date(item.dataRealizado),
                                    "dd/MM/yyyy HH:mm",
                                    {
                                      locale: ptBR,
                                    },
                                  )
                                : item.dataAgendada
                                  ? format(
                                      new Date(item.dataAgendada),
                                      "dd/MM/yyyy HH:mm",
                                      {
                                        locale: ptBR,
                                      },
                                    )
                                  : "Data não informada"}
                            </p>
                          </div>
                          <div className="flex justify-end">
                            {item.arquivoPdf ? (
                              <a
                                href={`http://localhost:3001/api/exames/download/${item.arquivoPdf}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                                style={{ background: "#1A3F72" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#0F2A52")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = "#1A3F72")
                                }
                              >
                                <Download className="h-3.5 w-3.5" />
                                Baixar laudo
                              </a>
                            ) : (
                              <span
                                className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold"
                                style={{
                                  background: "#F4F8FC",
                                  color: "#8FA8C4",
                                }}
                              >
                                Laudo indisponível
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
                    <p className="text-sm text-[#8FA8C4]">
                      Nenhum exame realizado encontrado.
                    </p>
                  </div>
                )}
              </div>
            )}

            {showConsultaDetailsModal && selectedConsulta && (
              <div
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
                style={{
                  background: "rgba(10,25,47,0.55)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <div
                  className="bg-white rounded-2xl w-full max-w-2xl overflow-y-auto"
                  style={{
                    maxHeight: "90vh",
                    border: "1px solid #D9E4F0",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                  }}
                >
                  <div
                    className="flex justify-between items-start p-6"
                    style={{ borderBottom: "1px solid #EEF2F7" }}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                        Detalhes da consulta
                      </p>
                      <h2 className="text-lg font-bold text-[#0F2242] mt-1">
                        {selectedConsulta.paciente?.nome ||
                          "Paciente não informado"}
                      </h2>
                      <p className="text-sm text-[#8FA8C4] mt-1">
                        {selectedConsulta.especialidade ||
                          "Especialidade não informada"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowConsultaDetailsModal(false);
                        setSelectedConsulta(null);
                      }}
                      className="text-[#8FA8C4] hover:text-[#5C7A9B] text-2xl font-bold leading-none transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-6 space-y-4 text-sm text-[#1A2E4A]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="rounded-xl p-4"
                        style={{ background: "#F8FAFD" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                          Status
                        </p>
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(selectedConsulta.status)}`}
                        >
                          {selectedConsulta.status}
                        </span>
                      </div>
                      <div
                        className="rounded-xl p-4"
                        style={{ background: "#F8FAFD" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                          Data do agendamento
                        </p>
                        <p className="font-semibold">
                          {formatConsultaDate(selectedConsulta.dataAgendada)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="rounded-xl p-4"
                        style={{ background: "#F8FAFD" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                          Local
                        </p>
                        <p className="font-semibold">
                          {selectedConsulta.ubs?.nome || "Não informado"}
                        </p>
                        <p className="text-[#5C7A9B] text-xs mt-1">
                          {selectedConsulta.ubs?.endereco ||
                            "Endereço não informado"}
                        </p>
                      </div>
                      <div
                        className="rounded-xl p-4"
                        style={{ background: "#F8FAFD" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                          Contato do paciente
                        </p>
                        <p className="font-semibold">
                          {selectedConsulta.paciente?.telefone ||
                            "Não informado"}
                        </p>
                        <p className="text-[#5C7A9B] text-xs mt-1">
                          {selectedConsulta.paciente?.email || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-4"
                      style={{ background: "#F8FAFD" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                        Motivo da consulta
                      </p>
                      <p>
                        {selectedConsulta.motivo || "Nenhum motivo informado"}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4"
                      style={{ background: "#F8FAFD" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                        Observações
                      </p>
                      <p>
                        {selectedConsulta.observacoes ||
                          "Nenhuma observação registrada"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="rounded-xl p-4"
                        style={{ background: "#F8FAFD" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                          Doença
                        </p>
                        <p className="font-semibold">
                          {getConsultaDisease(selectedConsulta)}
                        </p>
                      </div>
                      <div
                        className="rounded-xl p-4"
                        style={{ background: "#F8FAFD" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                          Diagnóstico
                        </p>
                        <p className="font-semibold">
                          {selectedConsulta.historicoMedico?.diagnostico ||
                            "Não registrado"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-4"
                      style={{ background: "#F8FAFD" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                        Laudo
                      </p>
                      <p>
                        {selectedConsulta.historicoMedico?.laudo ||
                          "Laudo ainda não registrado"}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4"
                      style={{ background: "#F8FAFD" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                        Medicação
                      </p>
                      <p>
                        {selectedConsulta.historicoMedico?.medicacao ||
                          "Nenhuma medicação registrada"}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex justify-end gap-3">
                    {(selectedConsulta.status === "agendada" ||
                      selectedConsulta.status === "agendado") && (
                      <button
                        onClick={() => {
                          setShowConsultaDetailsModal(false);
                          setModalHistorico({
                            aberto: true,
                            consulta: selectedConsulta,
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                        style={{ background: "#145C35" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#0E4226")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#145C35")
                        }
                      >
                        Registrar histórico
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowConsultaDetailsModal(false);
                        setSelectedConsulta(null);
                      }}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
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
                      Fechar
                    </button>
                  </div>
                </div>
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
      {showBuscaHistoricoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            style={{ border: "1px solid #D9E4F0" }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#0F2242]">
                  Buscar histórico por CPF
                </h3>
                <p className="text-sm text-[#5C7A9B] mt-1">
                  Informe o CPF do paciente e o sistema reunirá consultas,
                  exames, encaminhamentos, vacinas e medicações em uma lista por
                  data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBuscaHistoricoModal(false)}
                className="rounded-lg p-2 text-[#5C7A9B] hover:bg-[#F0F4F8]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleBuscarHistoricoPorCpf} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                CPF do paciente
                <input
                  type="text"
                  value={cpfHistoricoBusca}
                  onChange={(e) => setCpfHistoricoBusca(e.target.value)}
                  placeholder="000.000.000-00"
                  className="mt-1 w-full rounded-lg border border-[#C8D9ED] bg-[#F4F8FC] px-3 py-2 text-sm text-[#1A2E4A] outline-none"
                />
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBuscaHistoricoModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#5C7A9B] border border-[#C8D9ED] bg-transparent"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={buscarHistoricoPorCpfMutation.isLoading}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#1A3F72] disabled:opacity-50"
                >
                  {buscarHistoricoPorCpfMutation.isLoading
                    ? "Buscando..."
                    : "Buscar histórico"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {registroHistoricoDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            style={{ border: "1px solid #D9E4F0" }}
          >
            <div className="border-b border-[#EEF2F7] bg-gradient-to-r from-[#0F2242] via-[#173A67] to-[#24508D] p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#DDE8F7]">
                    Visualização detalhada
                  </p>
                  <h3 className="text-2xl font-bold leading-tight text-white">
                    {registroHistoricoDetalhe.titulo}
                  </h3>
                  <p className="text-sm text-[#E6EEF8]">
                    {registroHistoricoDetalhe.categoria} •{" "}
                    {format(
                      new Date(registroHistoricoDetalhe.dataRegistro),
                      "dd/MM/yyyy HH:mm",
                      { locale: ptBR },
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRegistroHistoricoDetalhe(null)}
                  className="rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#EAF2FB]">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {registroHistoricoDetalhe.categoria}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {historicoBuscaResultado?.paciente?.nome || "Paciente"}
                </span>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {registroHistoricoDetalhe.tipo === "historico" && (
                  <>
                    {[
                      [
                        "Diagnóstico",
                        registroHistoricoDetalhe.detalhes?.diagnostico,
                      ],
                      ["Laudo", registroHistoricoDetalhe.detalhes?.laudo],
                      ["Doença", registroHistoricoDetalhe.detalhes?.doenca],
                      [
                        "Medicação",
                        registroHistoricoDetalhe.detalhes?.medicacao,
                      ],
                      [
                        "Observações",
                        registroHistoricoDetalhe.detalhes?.observacoes,
                      ],
                      [
                        "Médico responsável",
                        registroHistoricoDetalhe.detalhes?.funcionario?.nome,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "consulta" && (
                  <>
                    {[
                      ["Motivo", registroHistoricoDetalhe.detalhes?.motivo],
                      [
                        "Especialidade",
                        registroHistoricoDetalhe.detalhes?.especialidade,
                      ],
                      ["Status", registroHistoricoDetalhe.detalhes?.status],
                      [
                        "Observações",
                        registroHistoricoDetalhe.detalhes?.observacoes,
                      ],
                      [
                        "Data agendada",
                        format(
                          new Date(
                            registroHistoricoDetalhe.detalhes?.dataAgendada ||
                              registroHistoricoDetalhe.dataRegistro,
                          ),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR },
                        ),
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "exame" && (
                  <>
                    {[
                      [
                        "Tipo do exame",
                        registroHistoricoDetalhe.detalhes?.tipo,
                      ],
                      ["Status", registroHistoricoDetalhe.detalhes?.status],
                      [
                        "Resultado",
                        registroHistoricoDetalhe.detalhes?.resultado,
                      ],
                      [
                        "Laboratório",
                        registroHistoricoDetalhe.detalhes?.laboratorio?.nome,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "solicitacao_exame" && (
                  <>
                    {[
                      ["Tipo", registroHistoricoDetalhe.detalhes?.tipoExame],
                      [
                        "Observações",
                        registroHistoricoDetalhe.detalhes?.observacoes,
                      ],
                      [
                        "Laboratório",
                        registroHistoricoDetalhe.detalhes?.laboratorio?.nome,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "encaminhamento" && (
                  <>
                    {[
                      ["Tipo", registroHistoricoDetalhe.detalhes?.tipo],
                      ["Motivo", registroHistoricoDetalhe.detalhes?.motivo],
                      ["Detalhes", registroHistoricoDetalhe.detalhes?.detalhes],
                      [
                        "Laudo médico",
                        registroHistoricoDetalhe.detalhes?.laudoMedico,
                      ],
                      [
                        "Hospital",
                        registroHistoricoDetalhe.detalhes?.hospital?.nome,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "vacina" && (
                  <>
                    {[
                      ["Nome", registroHistoricoDetalhe.detalhes?.nome],
                      ["Lote", registroHistoricoDetalhe.detalhes?.lote],
                      [
                        "Data da aplicação",
                        format(
                          new Date(
                            registroHistoricoDetalhe.detalhes?.dataApl ||
                              registroHistoricoDetalhe.dataRegistro,
                          ),
                          "dd/MM/yyyy",
                          { locale: ptBR },
                        ),
                      ],
                      [
                        "Próxima dose",
                        registroHistoricoDetalhe.detalhes?.proximaDose
                          ? format(
                              new Date(
                                registroHistoricoDetalhe.detalhes.proximaDose,
                              ),
                              "dd/MM/yyyy",
                              { locale: ptBR },
                            )
                          : "—",
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "medicacao" && (
                  <>
                    {[
                      [
                        "Medicamento",
                        registroHistoricoDetalhe.detalhes?.medicamento?.nome,
                      ],
                      [
                        "Quantidade",
                        registroHistoricoDetalhe.detalhes?.quantidade,
                      ],
                      [
                        "Data da retirada",
                        format(
                          new Date(
                            registroHistoricoDetalhe.detalhes?.dataRetirada ||
                              registroHistoricoDetalhe.dataRegistro,
                          ),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR },
                        ),
                      ],
                      [
                        "Observações",
                        registroHistoricoDetalhe.detalhes?.observacoes,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-[#EEF2F7] bg-[#F8FAFD] p-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setRegistroHistoricoDetalhe(null)}
                  className="rounded-xl border border-[#C8D9ED] bg-white px-4 py-2 text-sm font-semibold text-[#5C7A9B] transition hover:bg-[#F0F4F8]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal de Dispensação de Receita */}
      {showDispensacaoModal && receitaEncontrada && (
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
          >
            {/* Header */}
            <div
              className="border-b px-6 py-4"
              style={{ borderColor: "#E4EDF7", background: "#F8FAFD" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2242]">
                    Dispensar Medicamentos da Receita
                  </h3>
                  <p className="text-xs text-[#8FA8C4] mt-1">
                    Paciente: {receitaEncontrada.paciente?.nome || "N/A"} •
                    Registro: {receitaEncontrada.registroAssinatura || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDispensacaoModal(false);
                    setMedicamentosSelecionados({});
                  }}
                  className="rounded-lg p-2 text-[#8FA8C4] hover:bg-[#E4EDF7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto space-y-4">
              {erroDispensacao && (
                <div
                  className="rounded-lg border-l-4 p-4"
                  style={{
                    borderColor: "#DC2626",
                    background: "#FEE2E2",
                  }}
                >
                  <p className="text-sm font-semibold text-[#991B1B]">
                    {erroDispensacao.message ||
                      "Erro ao dispensar medicamentos"}
                  </p>
                </div>
              )}

              {/* Informações da Farmácia (Responsável) */}
              <div
                className="rounded-lg p-4"
                style={{
                  background: "#F0F6FF",
                  border: "1px solid #D9E4F0",
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-2">
                  Responsável pela Dispensação
                </p>
                <p className="text-sm font-semibold text-[#0F2242]">
                  {user?.nome || "Funcionário não identificado"}
                </p>
                <p className="text-xs text-[#8FA8C4]">
                  {user?.funcao || "Função"}
                </p>
              </div>

              {/* Resumo de Status */}
              {receitaEncontrada.itens &&
                receitaEncontrada.itens.length > 0 && (
                  <div
                    className="rounded-lg p-4 border"
                    style={{
                      background: "#F0F6FF",
                      borderColor: "#D9E4F0",
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-2">
                      Status da Dispensação
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-[#8FA8C4]">
                          Total de Medicamentos
                        </p>
                        <p className="text-lg font-bold text-[#0F2242]">
                          {receitaEncontrada.itens.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8FA8C4]">Pendentes</p>
                        <p className="text-lg font-bold text-[#F97316]">
                          {
                            receitaEncontrada.itens.filter(
                              (m: any) => m.status === "pendente",
                            ).length
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8FA8C4]">Dispensados</p>
                        <p className="text-lg font-bold text-[#00A651]">
                          {
                            receitaEncontrada.itens.filter(
                              (m: any) => m.status === "dispensado",
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Lista de Medicamentos para Dispensar */}
              <div>
                <h4 className="text-sm font-bold text-[#0F2242] mb-3">
                  Medicamentos Pendentes para Dispensar
                </h4>

                {receitaEncontrada.itens &&
                receitaEncontrada.itens.length > 0 ? (
                  <>
                    {receitaEncontrada.itens.filter(
                      (m: any) => m.status === "dispensado",
                    ).length === receitaEncontrada.itens.length ? (
                      <div
                        className="rounded-lg border-l-4 p-4"
                        style={{
                          borderColor: "#00A651",
                          background: "#F0FDF4",
                        }}
                      >
                        <p className="text-sm font-semibold text-[#166534]">
                          ✓ Receita completamente dispensada! Todos os
                          medicamentos foram dispensados e esta receita não pode
                          mais receber dispensações.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {receitaEncontrada.itens
                          .filter((item: any) => item.status === "pendente")
                          .map((item: any) => {
                            const isSelected =
                              medicamentosSelecionados[item.id]?.selecionado ||
                              false;
                            const data = medicamentosSelecionados[item.id] || {
                              selecionado: false,
                              medicamentoFornecido: item.medicamento,
                              quantidadeDispensada: item.quantidade,
                              observacoes: "",
                            };

                            const canDispense = item.status === "pendente";

                            return (
                              <div
                                key={item.id}
                                className="rounded-lg border p-4 transition-all"
                                style={{
                                  background: isSelected
                                    ? "#F0F6FF"
                                    : "#F8FAFD",
                                  borderColor: isSelected
                                    ? "#B3D9F2"
                                    : "#E4EDF7",
                                }}
                              >
                                {/* Checkbox e Status */}
                                <div className="flex items-start gap-3 mb-3">
                                  <input
                                    type="checkbox"
                                    id={`med-${item.id}`}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (canDispense) {
                                        setMedicamentosSelecionados({
                                          ...medicamentosSelecionados,
                                          [item.id]: {
                                            ...data,
                                            selecionado: e.target.checked,
                                          },
                                        });
                                      }
                                    }}
                                    disabled={!canDispense}
                                    className="mt-1 h-4 w-4 cursor-pointer"
                                  />
                                  <div className="flex-1">
                                    <label
                                      htmlFor={`med-${item.id}`}
                                      className="text-sm font-semibold text-[#0F2242] cursor-pointer flex items-center gap-2"
                                    >
                                      {item.medicamento}
                                      {!canDispense && (
                                        <span
                                          className="px-2 py-0.5 rounded text-xs font-semibold"
                                          style={{
                                            background: "#D1F3E9",
                                            color: "#145C35",
                                          }}
                                        >
                                          Dispensado
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                </div>

                                {/* Campos editáveis quando selecionado */}
                                {isSelected && canDispense && (
                                  <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7 border-t pt-3"
                                    style={{ borderColor: "#E4EDF7" }}
                                  >
                                    <div>
                                      <label className="block text-xs font-semibold text-[#8FA8C4] mb-1">
                                        Medicamento Fornecido
                                      </label>
                                      <input
                                        type="text"
                                        value={data.medicamentoFornecido}
                                        onChange={(e) =>
                                          setMedicamentosSelecionados({
                                            ...medicamentosSelecionados,
                                            [item.id]: {
                                              ...data,
                                              medicamentoFornecido:
                                                e.target.value,
                                            },
                                          })
                                        }
                                        placeholder={item.medicamento}
                                        className="w-full px-2 py-1.5 rounded text-xs outline-none transition-all"
                                        style={{
                                          border: "1px solid #C8D9ED",
                                          background: "#FFFFFF",
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-[#8FA8C4] mb-1">
                                        Quantidade a Dispensar
                                      </label>
                                      <input
                                        type="number"
                                        value={data.quantidadeDispensada}
                                        onChange={(e) =>
                                          setMedicamentosSelecionados({
                                            ...medicamentosSelecionados,
                                            [item.id]: {
                                              ...data,
                                              quantidadeDispensada:
                                                parseInt(e.target.value) ||
                                                item.quantidade,
                                            },
                                          })
                                        }
                                        min="1"
                                        max={item.quantidade}
                                        className="w-full px-2 py-1.5 rounded text-xs outline-none transition-all"
                                        style={{
                                          border: "1px solid #C8D9ED",
                                          background: "#FFFFFF",
                                        }}
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-xs font-semibold text-[#8FA8C4] mb-1">
                                        Observações
                                      </label>
                                      <textarea
                                        value={data.observacoes}
                                        onChange={(e) =>
                                          setMedicamentosSelecionados({
                                            ...medicamentosSelecionados,
                                            [item.id]: {
                                              ...data,
                                              observacoes: e.target.value,
                                            },
                                          })
                                        }
                                        placeholder="Ex: Medicamento genérico, substituição, etc."
                                        className="w-full px-2 py-1.5 rounded text-xs outline-none transition-all resize-none"
                                        style={{
                                          border: "1px solid #C8D9ED",
                                          background: "#FFFFFF",
                                        }}
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Informações resumidas */}
                                <div className="grid grid-cols-3 gap-2 pl-7 text-xs">
                                  <div>
                                    <span className="text-[#8FA8C4]">
                                      Dosagem:
                                    </span>
                                    <p className="font-semibold text-[#0F2242]">
                                      {item.dosagem || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-[#8FA8C4]">
                                      Quantidade:
                                    </span>
                                    <p className="font-semibold text-[#0F2242]">
                                      {item.quantidade}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-[#8FA8C4]">
                                      Posologia:
                                    </span>
                                    <p className="font-semibold text-[#0F2242]">
                                      {item.posologia || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-[#8FA8C4]">
                      Nenhum medicamento encontrado para esta receita.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="border-t flex justify-end gap-3 px-6 py-4"
              style={{ borderColor: "#E4EDF7", background: "#F8FAFD" }}
            >
              <button
                onClick={() => {
                  setShowDispensacaoModal(false);
                  setMedicamentosSelecionados({});
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
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
                Fechar
              </button>

              {receitaEncontrada.itens &&
              receitaEncontrada.itens.filter(
                (m: any) => m.status === "dispensado",
              ).length === receitaEncontrada.itens.length ? (
                <button
                  onClick={() => {
                    setShowDispensacaoModal(false);
                    setShowDetalhesDispensacaoModal(true);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{ background: "#1A3F72" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#0F2242")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#1A3F72")
                  }
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Ver Detalhes das Dispensações
                  </div>
                </button>
              ) : receitaEncontrada.itens &&
                receitaEncontrada.itens.filter(
                  (m: any) => m.status === "pendente",
                ).length > 0 ? (
                <button
                  onClick={handleDispensarMedicamentos}
                  disabled={
                    dispensarMedicamentosMutation.isLoading ||
                    Object.values(medicamentosSelecionados).every(
                      (m) => !m.selecionado,
                    )
                  }
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#00A651" }}
                  onMouseEnter={(e) =>
                    !dispensarMedicamentosMutation.isLoading &&
                    (e.currentTarget.style.background = "#007A3F")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#00A651")
                  }
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {dispensarMedicamentosMutation.isLoading
                      ? "Dispensando..."
                      : "Confirmar Dispensação"}
                  </div>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes de Dispensações */}
      {showDetalhesDispensacaoModal && receitaEncontrada && (
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
          >
            {/* Header */}
            <div
              className="border-b px-6 py-4"
              style={{ borderColor: "#E4EDF7", background: "#F8FAFD" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2242]">
                    Detalhes das Dispensações
                  </h3>
                  <p className="text-xs text-[#8FA8C4] mt-1">
                    Paciente: {receitaEncontrada.paciente?.nome || "N/A"} •
                    Registro: {receitaEncontrada.registroAssinatura || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetalhesDispensacaoModal(false)}
                  className="rounded-lg p-2 text-[#8FA8C4] hover:bg-[#E4EDF7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto space-y-4">
              {receitaEncontrada.dispensacoes &&
              receitaEncontrada.dispensacoes.length > 0 ? (
                <div className="space-y-3">
                  {receitaEncontrada.dispensacoes.map(
                    (dispensacao: any, index: number) => {
                      const medicamento = receitaEncontrada.itens?.find(
                        (item: any) =>
                          item.id === dispensacao.receitaMedicamentoId,
                      );

                      return (
                        <div
                          key={dispensacao.id}
                          className="rounded-lg border p-4"
                          style={{
                            background: "#F8FAFD",
                            borderColor: "#E4EDF7",
                          }}
                        >
                          {/* Número da Dispensação */}
                          <div
                            className="flex items-center justify-between mb-3 pb-3 border-b"
                            style={{ borderColor: "#E4EDF7" }}
                          >
                            <p className="text-sm font-bold text-[#0F2242]">
                              Dispensação #{index + 1}
                            </p>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-semibold"
                              style={{
                                background: "#D1F3E9",
                                color: "#145C35",
                              }}
                            >
                              ✓ Dispensado
                            </span>
                          </div>

                          {/* Dados da Dispensação */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Medicamento
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {medicamento?.medicamento ||
                                  dispensacao.medicamentoFornecido ||
                                  "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Medicamento Fornecido
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {dispensacao.medicamentoFornecido ||
                                  medicamento?.medicamento ||
                                  "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Quantidade Dispensada
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {dispensacao.quantidadeDispensada} un.
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Responsável
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {dispensacao.ubsResponsavel ||
                                  dispensacao.farmaciaResponsavel ||
                                  "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Data e Hora
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {new Date(
                                  dispensacao.dataDispensacao,
                                ).toLocaleString("pt-BR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Local
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {dispensacao.ubs?.nome || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Observações */}
                          {dispensacao.observacoesDispensacao && (
                            <div
                              className="mt-3 pt-3 border-t"
                              style={{ borderColor: "#E4EDF7" }}
                            >
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Observações
                              </p>
                              <p className="text-sm text-[#5C7A9B]">
                                {dispensacao.observacoesDispensacao}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-[#8FA8C4]">
                    Nenhuma dispensação registrada para esta receita.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="border-t flex justify-end gap-3 px-6 py-4"
              style={{ borderColor: "#E4EDF7", background: "#F8FAFD" }}
            >
              <button
                onClick={() => setShowDetalhesDispensacaoModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
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
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncionarioDashboard;
