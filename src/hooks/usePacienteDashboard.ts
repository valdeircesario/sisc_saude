import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";
import { toast } from "react-toastify";
import {
  User,
  Heart,
  Shield,
  FileText,
  Calendar,
  Building2,
  Pill,
  Stethoscope,
  Activity,
  History,
  Megaphone,
} from "lucide-react";

export type InternacaoRef = {
  id?: string;
  hospital?: { nome?: string; endereco?: string };
};

export type ProcedimentoRef = {
  id?: string;
  tipo?: string;
  descricao?: string;
  hospital?: { nome?: string };
};

export interface MedicacaoAdministrada {
  id: string;
  pacienteId?: string;
  nomeMedicacao: string;
  dataHoraAdministracao: string;
  dosagem?: string;
  viaAdministracao?: string;
  administradorNomeOuCrm?: string | null;
  internacao?: InternacaoRef | null;
  procedimentoHospitalar?: ProcedimentoRef | null;
  observacoes?: string | null;
}

export const usePacienteDashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [showEditarPerfilModal, setShowEditarPerfilModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [internacoesFilter, setInternacoesFilter] = useState<
    "all" | "solicitacoes" | "internacoes"
  >("all");
  const [medicacoesSource, setMedicacoesSource] = useState<
    "paciente" | "administradas"
  >("paciente");
  const [confirmacaoObservacoes, setConfirmacaoObservacoes] = useState("");
  const [perfilData, setPerfilData] = useState({
    endereco: "",
    telefone: "",
    email: "",
  });
  const [consultaData, setConsultaData] = useState({
    ubsId: "",
    motivo: "",
    especialidade: "",
  });

  const [exameSearch, setExameSearch] = useState("");
  const [examesSource, setExamesSource] = useState<
    "realizados" | "solicitados"
  >("realizados");
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("");

  const [showConfirmarInscricaoModal, setShowConfirmarInscricaoModal] = useState(false);
  const [campanhaParaInscricao, setCampanhaParaInscricao] = useState<any>(null);

  // Estados para Gerenciamento de Retorno (Paciente)
  const [showGerenciarRetornoModal, setShowGerenciarRetornoModal] = useState(false);
  const [formRetorno, setFormRetorno] = useState({
    dataRetorno: "",
    observacao: ""
  });

  // ── Queries ─────────────────────────
  const { data: perfil } = useQuery("paciente-perfil", () =>
    api.get("/paciente/perfil").then((r) => r.data),
  );

  const { data: campanhas } = useQuery(
    "campanhas-ativas",
    () => api.get("/campanhas/ativas").then((r) => r.data),
    { enabled: activeTab === "home" },
  );

  const { data: historicoMedico } = useQuery(
    "paciente-historico-medico",
    () => api.get("/paciente/historico-medico").then((r) => r.data),
    { enabled: activeTab === "historico" },
  );

  const { data: vacinas } = useQuery(
    "paciente-vacinas",
    () => api.get("/paciente/vacinas").then((r) => r.data),
    { enabled: activeTab === "vacinas" },
  );

  const { data: exames } = useQuery(
    "paciente-exames",
    () => api.get("/paciente/exames").then((r) => r.data),
    { enabled: activeTab === "exames" },
  );

  const { data: solicitacoesExame } = useQuery(
    "paciente-solicitacoes-exame",
    () => api.get("/paciente/solicitacoes-exame").then((r) => r.data),
    { enabled: activeTab === "exames" },
  );

  const { data: consultas } = useQuery(
    "paciente-consultas",
    () => api.get("/paciente/consultas").then((r) => r.data),
    { enabled: activeTab === "consultas" },
  );

  const { data: ubsList } = useQuery(
    "ubs-list",
    () => api.get("/paciente/ubs").then((r) => r.data),
    { enabled: showConsultaModal },
  );

  const { data: solicitacoesInternacao } = useQuery(
    "paciente-solicitacoes-internacao",
    () => api.get("/paciente/solicitacoes-internacao").then((r) => r.data),
    { enabled: activeTab === "internacoes" },
  );

  const { data: internacoes } = useQuery(
    "paciente-internacoes",
    () => api.get("/paciente/internacoes").then((r) => r.data),
    { enabled: activeTab === "internacoes" },
  );

  const { data: procedimentosHospitalares } = useQuery(
    "paciente-procedimentos-hospitalares",
    () => api.get("/paciente/procedimentos-hospitalares").then((r) => r.data),
    { enabled: activeTab === "procedimentos" },
  );

  const {
    data: medicacoesAdministradas,
    isLoading: medicacoesAdministradasLoading,
  } = useQuery<MedicacaoAdministrada[]>(
    ["paciente-medicacoes-administradas", perfil?.id],
    async () => {
      const res = await api.get("/paciente/medicacoes-administradas");
      return res.data as MedicacaoAdministrada[];
    },
    {
      enabled: activeTab === "medicacoes" && !!perfil,
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            "Erro ao carregar medicações administradas",
        );
      },
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  );

  const { data: medicacoesPaciente, isLoading: medicacoesPacienteLoading } =
    useQuery(
      ["paciente-medicacoes-paciente", perfil?.id],
      async () => {
        const res = await api.get("/paciente/medicacoes-paciente");
        return res.data;
      },
      {
        enabled: activeTab === "medicacoes" && !!perfil,
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ||
              "Erro ao carregar medicações do paciente",
          );
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    );

  const { data: agendamentosHospitalares } = useQuery(
    "paciente-agendamentos-hospitalares",
    () => api.get("/paciente/agendamentos-hospitalares").then((r) => r.data),
    { enabled: activeTab === "agendamentos" },
  );

  const { data: historicoHospitalar } = useQuery(
    "paciente-historico-hospitalar",
    () => api.get("/paciente/historico-hospitalar").then((r) => r.data),
    { enabled: activeTab === "historico-hospitalar" },
  );

  const { data: receitasEAtestados } = useQuery(
    "paciente-receitas-atestados",
    () => api.get("/paciente/receitas-atestados").then((r) => r.data),
    { enabled: activeTab === "receitas-atestados" },
  );

  // ── Memos ───────────────────────────
  const mergedExames = useMemo(() => {
    const examesMap = new Map<string, any>();

    const normalizedExames = (exames || []).map((ex: any) => {
      const chave = `${(ex.tipo || "").toLowerCase()}-${ex.laboratorioId || ex.laboratorio?.id || ""}`;
      examesMap.set(chave, true);

      return {
        id: `exame-${ex.id}`,
        title: ex.tipo,
        status: ex.status,
        labName: ex.laboratorio?.nome || "—",
        dataAgendada: ex.dataAgendada,
        dataRealizado: ex.dataRealizado,
        resultado: ex.resultado,
        arquivoPdf: ex.arquivoPdf,
        createdAt: ex.createdAt,
        observacoes: ex.observacoes,
        source: "exame",
      };
    });

    const normalizedSolicitacoes = (solicitacoesExame || [])
      .filter((s: any) => {
        const chave = `${(s.tipoExame || "").toLowerCase()}-${s.laboratorioId || s.laboratorio?.id || ""}`;
        return !examesMap.has(chave);
      })
      .map((s: any) => ({
        id: `sol-${s.id}`,
        title: s.tipoExame,
        status: s.status,
        labName: s.laboratorio?.nome || "—",
        createdAt: s.createdAt,
        observacoes: s.observacoes,
        source: "solicitacao",
      }));

    return [...normalizedExames, ...normalizedSolicitacoes].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [exames, solicitacoesExame]);

  const filteredExamesRealizados = useMemo(
    () =>
      (exames || []).filter((item: any) =>
        (item.tipo || "")
          .toLowerCase()
          .includes((exameSearch || "").toLowerCase()),
      ),
    [exames, exameSearch],
  );

  const filteredExamesSolicitados = useMemo(
    () =>
      (solicitacoesExame || []).filter((item: any) =>
        (item.tipoExame || "")
          .toLowerCase()
          .includes((exameSearch || "").toLowerCase()),
      ),
    [solicitacoesExame, exameSearch],
  );

  const filteredSolicitacoesInternacao = useMemo(
    () =>
      internacoesFilter === "internacoes" ? [] : solicitacoesInternacao || [],
    [internacoesFilter, solicitacoesInternacao],
  );

  const filteredInternacoes = useMemo(
    () => (internacoesFilter === "solicitacoes" ? [] : internacoes || []),
    [internacoesFilter, internacoes],
  );

  const consultasFiltradas = useMemo(() => {
    if (!consultas) return [];

    let resultado = [...consultas];

    if (filtroEspecialidade) {
      resultado = resultado.filter((c: any) =>
        c.especialidade
          ?.toLowerCase()
          .includes(filtroEspecialidade.toLowerCase()),
      );
    }

    resultado.sort((a: any, b: any) => {
      const dataA = a.dataAgendada ? new Date(a.dataAgendada).getTime() : 0;
      const dataB = b.dataAgendada ? new Date(b.dataAgendada).getTime() : 0;
      return dataB - dataA;
    });

    return resultado;
  }, [consultas, filtroEspecialidade]);

  const especialidadesUnicas = useMemo(() => {
    if (!consultas) return [];
    const set = new Set<string>();
    consultas.forEach((c: any) => {
      if (c.especialidade) set.add(c.especialidade);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [consultas]);

  // ── Mutations ────────────────────────
  const confirmarAgendamentoMutation = useMutation(
    ({ id, observacoes }: { id: string; observacoes?: string }) =>
      api.put(`/paciente/solicitacoes-internacao/${id}/confirmar-agendamento`, {
        observacoes,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-solicitacoes-internacao");
        toast.success("Agendamento confirmado!");
        setShowConfirmarModal(false);
        setSelectedItem(null);
        setConfirmacaoObservacoes("");
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || "Erro ao confirmar");
      },
    },
  );

  const confirmarAgendamentoHospitalarMutation = useMutation(
    ({ id, observacoes }: { id: string; observacoes?: string }) =>
      api.put(`/paciente/agendamentos-hospitalares/${id}/confirmar`, {
        observacoes,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-agendamentos-hospitalares");
        toast.success("Agendamento confirmado!");
        setShowConfirmarModal(false);
        setSelectedItem(null);
        setConfirmacaoObservacoes("");
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || "Erro ao confirmar");
      },
    },
  );

  const atualizarPerfilMutation = useMutation(
    (data: any) => api.put("/paciente/perfil", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-perfil");
        toast.success("Perfil atualizado!");
        setShowEditarPerfilModal(false);
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || "Erro ao atualizar");
      },
    },
  );

  const solicitarConsultaMutation = useMutation(
    (data: any) => api.post("/paciente/solicitar-consulta", data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-consultas");
        toast.success("Consulta solicitada!");
        setShowConsultaModal(false);
        setConsultaData({ ubsId: "", motivo: "", especialidade: "" });
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || "Erro ao solicitar");
      },
    },
  );

  const confirmarConsultaMutation = useMutation(
    (id: string) => api.put(`/paciente/consultas/${id}/confirmar`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-consultas");
        toast.success("Consulta confirmada!");
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || "Erro ao confirmar");
      },
    },
  );

  const cancelarConsultaMutation = useMutation(
    ({ id, motivo }: { id: string; motivo: string }) =>
      api.put(`/paciente/consultas/${id}/cancelar`, {
        motivo,
        dataCancelamento: new Date().toISOString(),
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-consultas");
        toast.success("Consulta cancelada com sucesso.");
        setShowCancelarModal(false);
        setSelectedItem(null);
        setMotivoCancelamento("");
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message || "Erro ao cancelar consulta.",
        );
      },
    },
  );

  const inscreverCampanhaMutation = useMutation(
    ({ campanhaId, data }: { campanhaId: string; data: any }) =>
      api.post(`/campanhas/${campanhaId}/inscrever`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("campanhas-ativas");
        toast.success("Inscrição realizada!");
      },
      onError: (e: any) => {
        toast.error(e.response?.data?.message || "Erro ao inscrever");
      },
    },
  );

  // ── Helpers ──────────────────────────
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "gravissimo":
        return "bg-red-100 text-red-800 ring-1 ring-red-300";
      case "urgente":
        return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
      case "grave":
        return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
      case "medio":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
      case "leve":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      default:
        return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
    }
  };

  const calcularIdade = (nascimento?: string) => {
    if (!nascimento) return "";
    const born = new Date(nascimento);
    const today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
    return age.toString();
  };

  // ── Handlers ─────────────────────────
  const openDetalhesModal = (item: any) => {
    setSelectedItem(item);
    setShowDetalhesModal(true);
  };

  const handleConsultaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    solicitarConsultaMutation.mutate(consultaData);
  };

  const openConfirmarModal = (
    item: any,
    tipo: "internacao" | "agendamento",
  ) => {
    setSelectedItem({ ...item, tipoConfirmacao: tipo });
    setShowConfirmarModal(true);
  };

  const openEditarPerfilModal = () => setShowEditarPerfilModal(true);

  const handleInscreverCampanha = (
    campanhaId: string,
    campanhaTitulo?: string,
  ) => {
    if (!perfil) {
      toast.error("Perfil não carregado.");
      return;
    }
    
    setCampanhaParaInscricao({ id: campanhaId, titulo: campanhaTitulo });
    setShowConfirmarInscricaoModal(true);
  };

  const handleConfirmarInscricao = () => {
    if (!campanhaParaInscricao || !perfil) return;

    inscreverCampanhaMutation.mutate({
      campanhaId: campanhaParaInscricao.id,
      data: {
        nome: perfil.nome || "",
        cpf: perfil.cpf || "",
        telefone: perfil.telefone || "",
        email: perfil.email || "",
        endereco: perfil.endereco || "",
        idade: calcularIdade(perfil.nascimento),
        condicoesSaude: (perfil as any).condicoesSaude || null,
        observacoes: "",
      },
    });
    
    setShowGerenciarRetornoModal(false);
    setCampanhaParaInscricao(null);
  };

  const handleSalvarEdicaoRetorno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem?.id) return;
    
    try {
      const idLimpo = selectedItem.id.replace("ret-", "");
      await api.put(`/paciente/retorno/${idLimpo}`, {
        observacao: formRetorno.observacao,
        status: "confirmado"
      });
      
      toast.success("Retorno confirmado com sucesso!");
      setShowGerenciarRetornoModal(false);
      queryClient.invalidateQueries("paciente-consultas");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao confirmar retorno.");
    }
  };

  const handleCancelarRetorno = async () => {
    if (!selectedItem?.id) return;
    
    try {
      const idLimpo = selectedItem.id.replace("ret-", "");
      await api.put(`/paciente/retorno/${idLimpo}`, {
        status: "cancelado",
        observacao: formRetorno.observacao
      });
      
      toast.success("O agendamento de retorno foi cancelado.");
      setShowGerenciarRetornoModal(false);
      queryClient.invalidateQueries("paciente-consultas");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cancelar retorno.");
    }
  };

  const handleConfirmarAgendamento = () => {
    if (selectedItem) {
      if (selectedItem.tipoConfirmacao === "internacao")
        confirmarAgendamentoMutation.mutate({
          id: selectedItem.id,
          observacoes: confirmacaoObservacoes,
        });
      else
        confirmarAgendamentoHospitalarMutation.mutate({
          id: selectedItem.id,
          observacoes: confirmacaoObservacoes,
        });
    }
  };

  const handleAtualizarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarPerfilMutation.mutate(perfilData);
  };

  const handleCancelarConsulta = () => {
    if (!motivoCancelamento.trim()) {
      toast.warning("Informe o motivo do cancelamento.");
      return;
    }
    cancelarConsultaMutation.mutate({
      id: selectedItem.id,
      motivo: motivoCancelamento.trim(),
    });
  };

  const navigation = [
    { name: "Início", key: "home", icon: Activity },
    { name: "Meu Perfil", key: "perfil", icon: User },
    { name: "Consultas", key: "consultas", icon: Stethoscope },
    { name: "Minhas Campanhas", key: "campanhas", icon: Megaphone },
    { name: "Vacinas", key: "vacinas", icon: Shield },
    { name: "Exames", key: "exames", icon: FileText },
    { name: "Internações", key: "internacoes", icon: Building2 },
    { name: "Medicações", key: "medicacoes", icon: Pill },
    { name: "Histórico Médico", key: "historico", icon: Heart },
    {
      name: "Histórico Hospitalar",
      key: "historico-hospitalar",
      icon: History,
    },
    {
      name: "Receitas / Atestados",
      key: "receitas-atestados",
      icon: FileText,
    },
  ];

  return {
    user,
    logout,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    showDetalhesModal,
    setShowDetalhesModal,
    showConsultaModal,
    setShowConsultaModal,
    showConfirmarModal,
    setShowConfirmarModal,
    showCancelarModal,
    setShowCancelarModal,
    showEditarPerfilModal,
    setShowEditarPerfilModal,
    showConfirmarInscricaoModal,
    setShowConfirmarInscricaoModal,
    campanhaParaInscricao,
    selectedItem,
    setSelectedItem,
    internacoesFilter,
    setInternacoesFilter,
    medicacoesSource,
    setMedicacoesSource,
    confirmacaoObservacoes,
    setConfirmacaoObservacoes,
    perfilData,
    setPerfilData,
    consultaData,
    setConsultaData,
    exameSearch,
    setExameSearch,
    examesSource,
    setExamesSource,
    motivoCancelamento,
    setMotivoCancelamento,
    filtroEspecialidade,
    setFiltroEspecialidade,
    
    // Data
    perfil,
    campanhas,
    historicoMedico,
    vacinas,
    exames,
    solicitacoesExame,
    mergedExames,
    filteredExamesRealizados,
    filteredExamesSolicitados,
    consultas,
    consultasFiltradas,
    especialidadesUnicas,
    ubsList,
    solicitacoesInternacao,
    internacoes,
    filteredSolicitacoesInternacao,
    filteredInternacoes,
    procedimentosHospitalares,
    medicacoesAdministradas,
    medicacoesAdministradasLoading,
    medicacoesPaciente,
    medicacoesPacienteLoading,
    agendamentosHospitalares,
    historicoHospitalar,
    receitasEAtestados,
    
    // Mutations loading states
    isConfirmandoAgendamento: confirmarAgendamentoMutation.isLoading || confirmarAgendamentoHospitalarMutation.isLoading,
    isAtualizandoPerfil: atualizarPerfilMutation.isLoading,
    isSolicitandoConsulta: solicitarConsultaMutation.isLoading,
    isCancelandoConsulta: cancelarConsultaMutation.isLoading,
    isInscrevendoCampanha: inscreverCampanhaMutation.isLoading,
    
    // Handlers
    openDetalhesModal,
    handleConsultaSubmit,
    openConfirmarModal,
    openEditarPerfilModal,
    handleInscreverCampanha,
    handleConfirmarInscricao,
    handleConfirmarAgendamento,
    handleAtualizarPerfil,
    handleCancelarConsulta,
    confirmarConsultaMutation,
    
    // Gerenciamento de Retorno
    showGerenciarRetornoModal,
    setShowGerenciarRetornoModal,
    formRetorno,
    setFormRetorno,
    handleSalvarEdicaoRetorno,
    handleCancelarRetorno,
    
    // Navigation
    navigation,
    
    // Helpers
    getPrioridadeColor,
    calcularIdade,
  };
};
