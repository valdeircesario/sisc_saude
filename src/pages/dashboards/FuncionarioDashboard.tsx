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
import FuncionarioHistoricoTab from "../../components/Funcionario/FuncionarioHistoricoTab";
import FuncionarioHistoricoModals from "../../components/Funcionario/FuncionarioHistoricoModals";
import FuncionarioSolicitacoesTab from "../../components/Funcionario/FuncionarioSolicitacoesTab";
import FuncionarioExamesTab from "../../components/Funcionario/FuncionarioExamesTab";
import FuncionarioPatientActionModals from "../../components/Funcionario/FuncionarioPatientActionModals";
import FuncionarioDispensacaoModals from "../../components/Funcionario/FuncionarioDispensacaoModals";
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
              />
            )}

            {/* ══ HISTÓRICO ══ */}
            {activeTab === "historico" && (
              <FuncionarioHistoricoTab
                historicoBuscaResultado={historicoBuscaResultado}
                setShowBuscaHistoricoModal={setShowBuscaHistoricoModal}
                abrirDetalheHistorico={abrirDetalheHistorico}
                selectedPaciente={selectedPaciente}
                setActiveTab={setActiveTab}
                historicoPaciente={historicoPaciente}
              />
            )}

            {/* ══ SOLICITAÇÕES ══ */}
            {activeTab === "solicitacoes" && (
              <FuncionarioSolicitacoesTab
                solicitacoesFiltroPaciente={solicitacoesFiltroPaciente}
                setSolicitacoesFiltroPaciente={setSolicitacoesFiltroPaciente}
                solicitacoesFiltroTipo={solicitacoesFiltroTipo}
                setSolicitacoesFiltroTipo={setSolicitacoesFiltroTipo}
                pacientesSolicitacoes={pacientesSolicitacoes}
                filteredSolicitacoes={filteredSolicitacoes}
                getStatusColor={getStatusColor}
                getPrioridadeColor={getPrioridadeColor}
              />
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

            {/* ══ EXAMES ══ */}
            {activeTab === "exames" && (
              <FuncionarioExamesTab
                exameSearchTerm={exameSearchTerm}
                setExameSearchTerm={setExameSearchTerm}
                loadingExames={loadingExames}
                filteredExames={filteredExames}
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

            {/* ══ MODAIS DE CONSULTA ══ */}
            <FuncionarioConsultaModals
              showConsultaDetailsModal={showConsultaDetailsModal}
              setShowConsultaDetailsModal={setShowConsultaDetailsModal}
              selectedConsulta={selectedConsulta}
              setSelectedConsulta={setSelectedConsulta}
              getStatusColor={getStatusColor}
              formatConsultaDate={formatConsultaDate}
              getConsultaDisease={getConsultaDisease}
              setModalHistorico={setModalHistorico}
              modalHistorico={modalHistorico}
              handleRegistrarHistorico={handleRegistrarHistorico}
              formHistorico={formHistorico}
              setFormHistorico={setFormHistorico}
              isRegistrandoHistorico={loadingHistorico}
            />

            {/* ══ MODAIS DE HISTÓRICO ══ */}
            <FuncionarioHistoricoModals
              showBuscaHistoricoModal={showBuscaHistoricoModal}
              setShowBuscaHistoricoModal={setShowBuscaHistoricoModal}
              handleBuscarHistoricoPorCpf={handleBuscarHistoricoPorCpf}
              cpfHistoricoBusca={cpfHistoricoBusca}
              setCpfHistoricoBusca={setCpfHistoricoBusca}
              isBuscandoHistorico={buscarHistoricoPorCpfMutation.isLoading}
              registroHistoricoDetalhe={registroHistoricoDetalhe}
              setRegistroHistoricoDetalhe={setRegistroHistoricoDetalhe}
              pacienteNome={historicoBuscaResultado?.paciente?.nome}
            />

            {/* ══ MODAIS DE AÇÃO DO PACIENTE ══ */}
            <FuncionarioPatientActionModals
              selectedPaciente={selectedPaciente}
              showHistoricoModal={showHistoricoModal}
              setShowHistoricoModal={setShowHistoricoModal}
              handleHistoricoSubmit={handleHistoricoSubmit}
              historicoData={historicoData}
              setHistoricoData={setHistoricoData}
              isRegistrandoHistorico={createHistoricoMutation.isLoading}
              showVacinaModal={showVacinaModal}
              setShowVacinaModal={setShowVacinaModal}
              handleVacinaSubmit={handleVacinaSubmit}
              vacinaData={vacinaData}
              setVacinaData={setVacinaData}
              isRegistrandoVacina={createVacinaMutation.isLoading}
              showExameModal={showExameModal}
              setShowExameModal={setShowExameModal}
              handleExameSubmit={handleExameSubmit}
              exameData={exameData}
              setExameData={setExameData}
              isSolicitandoExame={solicitarExameMutation.isLoading}
              laboratorios={laboratorios}
              showInternacaoModal={showInternacaoModal}
              setShowInternacaoModal={setShowInternacaoModal}
              handleInternacaoSubmit={handleInternacaoSubmit}
              internacaoData={internacaoData}
              setInternacaoData={setInternacaoData}
              isSolicitandoInternacao={solicitarInternacaoMutation.isLoading}
              hospitais={hospitais}
              loadingHospitais={loadingHospitais}
              hospitaisError={hospitaisError}
            />

            {/* ══ MODAIS DE DISPENSAÇÃO ══ */}
            <FuncionarioDispensacaoModals
              showDispensacaoModal={showDispensacaoModal}
              setShowDispensacaoModal={setShowDispensacaoModal}
              receitaEncontrada={receitaEncontrada}
              user={user}
              erroDispensacao={erroDispensacao}
              medicamentosSelecionados={medicamentosSelecionados}
              setMedicamentosSelecionados={setMedicamentosSelecionados}
              handleDispensarMedicamentos={handleDispensarMedicamentos}
              isDispensandoMedicamentos={
                dispensarMedicamentosMutation.isLoading
              }
              showDetalhesDispensacaoModal={showDetalhesDispensacaoModal}
              setShowDetalhesDispensacaoModal={setShowDetalhesDispensacaoModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioDashboard;
