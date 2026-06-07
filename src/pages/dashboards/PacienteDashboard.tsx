import React, { useState, useMemo } from "react";
import {
  User,
  Heart,
  Shield,
  FileText,
  LogOut,
  Calendar,
  Building2,
  Pill,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Check,
  X,
  Users,
  MapPin,
  Phone,
  Mail,
  Activity,
  History,
  Edit,
  Save,
  Printer,
  Download,
  Menu,
  Search,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  generateHistoricoMedicoPDF,
  generateVacinasPDF,
} from "../../utils/pdfGenerator";
import LoadingSpinner from "../../components/LoadingSpinner";

type InternacaoRef = {
  id?: string;
  hospital?: { nome?: string; endereco?: string };
};
type ProcedimentoRef = {
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "cancelada":
      return "bg-amber-50 text-amber-900 ring-1 ring-amber-200";
    case "pendente":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "avaliando":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "agendado":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    case "realizado":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "cancelado":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "confirmada":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "solicitada":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
  }
};
const getStatusIcon = (status: string) => {
  switch (status) {
    case "realizado":
    case "realizada":
      return <CheckCircle className="h-3.5 w-3.5" />;
    case "agendado":
    case "agendada":
      return <Clock className="h-3.5 w-3.5" />;
    case "solicitada":
      return <AlertCircle className="h-3.5 w-3.5" />;
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
};
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

import { PacienteHeader } from "../../components/Paciente/PacienteHeader";
import { PacienteSidebar } from "../../components/Paciente/PacienteSidebar";
import { PacienteHomeTab } from "../../components/Paciente/PacienteHomeTab";
import { PacientePerfilTab } from "../../components/Paciente/PacientePerfilTab";
import { PacienteConsultasTab } from "../../components/Paciente/PacienteConsultasTab";
import { PacienteHistoricoTab } from "../../components/Paciente/PacienteHistoricoTab";
import { PacienteVacinasTab } from "../../components/Paciente/PacienteVacinasTab";
import { PacienteExamesTab } from "../../components/Paciente/PacienteExamesTab";
import { PacienteInternacoesTab } from "../../components/Paciente/PacienteInternacoesTab";
import { PacienteProcedimentosTab } from "../../components/Paciente/PacienteProcedimentosTab";
import { PacienteHistoricoHospitalarTab } from "../../components/Paciente/PacienteHistoricoHospitalarTab";
import { PacienteSolicitarConsultaModal } from "../../components/Paciente/PacienteSolicitarConsultaModal";
import { PacienteEditarPerfilModal } from "../../components/Paciente/PacienteEditarPerfilModal";
import { PacienteDetalhesModal } from "../../components/Paciente/PacienteDetalhesModal";
import { PacienteConfirmarAgendamentoModal } from "../../components/Paciente/PacienteConfirmarAgendamentoModal";

const PacienteDashboard: React.FC = () => {
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

  // ── Queries (idênticas ao original) ─────────────────────────
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

  // filtro de busca para nome do exame
  const [exameSearch, setExameSearch] = useState("");
  const [examesSource, setExamesSource] = useState<
    "realizados" | "solicitados"
  >("realizados");

  // Solicitações de exame (tabela solicitacao_exames) para acompanhar status
  const { data: solicitacoesExame } = useQuery(
    "paciente-solicitacoes-exame",
    () => api.get("/paciente/solicitacoes-exame").then((r) => r.data),
    { enabled: activeTab === "exames" },
  );

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

  const filteredSolicitacoesInternacao = useMemo(
    () =>
      internacoesFilter === "internacoes" ? [] : solicitacoesInternacao || [],
    [internacoesFilter, solicitacoesInternacao],
  );

  const filteredInternacoes = useMemo(
    () => (internacoesFilter === "solicitacoes" ? [] : internacoes || []),
    [internacoesFilter, internacoes],
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
      console.debug("medicacoes-administradas response", res.status, res.data);
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

  // ── Mutations (confirmar agendamento) ───────────────────────
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
      onError: (e: any) =>
        toast.error(e.response?.data?.message || "Erro ao confirmar"),
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
      onError: (e: any) =>
        toast.error(e.response?.data?.message || "Erro ao confirmar"),
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
      onError: (e: any) =>
        toast.error(e.response?.data?.message || "Erro ao atualizar"),
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
      onError: (e: any) =>
        toast.error(e.response?.data?.message || "Erro ao solicitar"),
    },
  );
  const confirmarConsultaMutation = useMutation(
    (id: string) => api.put(`/paciente/consultas/${id}/confirmar`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-consultas");
        toast.success("Consulta confirmada!");
      },
      onError: (e: any) =>
        toast.error(e.response?.data?.message || "Erro ao confirmar"),
    },
  );
  // ── Estados novos ────────────────────────────────────────────
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("");

  // ── Lógica de filtragem e ordenação de consultas ─────────────
  const consultasFiltradas = useMemo(() => {
    if (!consultas) return [];

    let resultado = [...consultas];

    // Filtrar por especialidade
    if (filtroEspecialidade) {
      resultado = resultado.filter((c: any) =>
        c.especialidade
          ?.toLowerCase()
          .includes(filtroEspecialidade.toLowerCase()),
      );
    }

    // Ordenar por data (mais recentes primeiro, colocando datas nulas por último)
    resultado.sort((a: any, b: any) => {
      const dataA = a.dataAgendada ? new Date(a.dataAgendada).getTime() : 0;
      const dataB = b.dataAgendada ? new Date(b.dataAgendada).getTime() : 0;
      return dataB - dataA;
    });

    return resultado;
  }, [consultas, filtroEspecialidade]);

  // ── Extrair especialidades únicas para o filtro ───────────────
  const especialidadesUnicas = useMemo(() => {
    if (!consultas) return [];
    const set = new Set<string>();
    consultas.forEach((c: any) => {
      if (c.especialidade) set.add(c.especialidade);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [consultas]);

  // ── Mutation de cancelar (adicionar junto às outras mutations) ─
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
      onError: (e: any) =>
        toast.error(e.response?.data?.message || "Erro ao inscrever"),
    },
  );

  // ── Handlers (idênticos ao original) ────────────────────────
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
  const calcularIdade = (nascimento?: string) => {
    if (!nascimento) return "";
    const born = new Date(nascimento);
    const today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
    return age.toString();
  };
  const handleInscreverCampanha = (
    campanhaId: string,
    campanhaTitulo?: string,
  ) => {
    if (!perfil) {
      toast.error("Perfil não carregado.");
      return;
    }
    if (
      !window.confirm(
        `Confirmar inscrição em "${campanhaTitulo ?? "campanha selecionada"}"?`,
      )
    ) {
      toast.info("Inscrição cancelada.");
      return;
    }
    inscreverCampanhaMutation.mutate({
      campanhaId,
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

  // ── Navegação ────────────────────────────────────────────────
  const navigation = [
    { name: "Início", key: "home", icon: Activity },
    { name: "Meu Perfil", key: "perfil", icon: User },
    { name: "Consultas", key: "consultas", icon: Stethoscope },
    { name: "Vacinas", key: "vacinas", icon: Shield },
    { name: "Exames", key: "exames", icon: FileText },
    { name: "Internações", key: "internacoes", icon: Building2 },
    { name: "Procedimentos", key: "procedimentos", icon: Activity },
    { name: "Medicações", key: "medicacoes", icon: Pill },
    { name: "Agendamentos", key: "agendamentos", icon: Calendar },
    { name: "Histórico Médico", key: "historico", icon: Heart },
    {
      name: "Receitas / Atestados",
      key: "historico-hospitalar",
      icon: History,
    },
  ];

  // ── Reutilizável: cabeçalho de seção ────────────────────────
  const SectionHeader = ({
    icon: Icon,
    title,
    color = "teal",
  }: {
    icon: any;
    title: string;
    color?: string;
  }) => (
    <div className="mb-6 flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${color}-50`}
      >
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );

  // ── Card vazio reutilizável ──────────────────────────────────
  const EmptyState = ({
    icon: Icon,
    message,
  }: {
    icon: any;
    message: string;
  }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
        <Icon className="h-8 w-8 text-slate-300" />
      </div>
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );

  // ── Badge de status ──────────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(status)}`}
    >
      {getStatusIcon(status)}
      <span className="capitalize">{status}</span>
    </span>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#F0F4F8", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(10, 74, 74, 0.35)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: "240px",
          background: "#ffffff",
          borderRight: "0.5px solid #E2E8F0",
        }}
      >
        {/* Logo da sidebar */}
        <div
          className="flex items-center gap-2.5"
          style={{
            height: "64px",
            padding: "0 20px",
            borderBottom: "0.5px solid #E2E8F0",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #0A6B6B, #0E9090)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "15px",
              fontWeight: 500,
              color: "#0A4A4A",
              letterSpacing: "0.01em",
            }}
          >
            SISC Saúde
          </span>
        </div>

        {/* Avatar do paciente */}
        <div
          className="flex items-center gap-4"
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div
            className="relative flex items-center justify-center flex-shrink-0"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0A6B6B 0%, #14B8A6 100%)",
              boxShadow: "0 8px 20px rgba(10, 107, 107, 0.20)",
            }}
          >
            {user?.nome ? (
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                {user.nome
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            ) : (
              <User className="h-6 w-6 text-white" />
            )}

            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#22C55E",
                border: "2px solid white",
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate"
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              {user?.nome || "Usuário"}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#0A6B6B",
                  background: "#E6FFFB",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  border: "1px solid #B2F5EA",
                }}
              >
                PACIENTE
              </span>
            </div>
          </div>
        </div>

        {/* Itens de navegação */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{
            padding: "12px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className="group w-full flex items-center gap-2.5 transition-all duration-150"
                style={{
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: active ? 500 : 400,
                  fontFamily: "'DM Sans', sans-serif",
                  background: active ? "#0A6B6B" : "transparent",
                  color: active ? "#ffffff" : "#4A6B6B",
                }}
              >
                <Icon
                  className="h-4 w-4 flex-shrink-0"
                  style={{ opacity: active ? 1 : 0.65 }}
                />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Botão sair */}
        <div style={{ borderTop: "0.5px solid #E2E8F0", padding: "10px" }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 transition-all duration-150"
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 400,
              fontFamily: "'DM Sans', sans-serif",
              background: "transparent",
              color: "#7A9B9B",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFF0F0";
              e.currentTarget.style.color = "#C0392B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#7A9B9B";
            }}
          >
            <LogOut className="h-4 w-4" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-900">
                {navigation.find((n) => n.key === activeTab)?.name ??
                  "Portal do Paciente"}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              Online
            </span>
          </div>
        </header>

        {/* Conteúdo scrollável */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {/* ── HOME ──────────────────────────────────────── */}
          {activeTab === "home" && (
            <PacienteHomeTab
              user={user}
              campanhas={campanhas || []}
              setShowConsultaModal={setShowConsultaModal}
              setActiveTab={setActiveTab}
              handleInscreverCampanha={handleInscreverCampanha}
              EmptyState={EmptyState}
            />
          )}

          {/* ── PERFIL ──────────────────────────────────────── */}
          {activeTab === "perfil" && perfil && (
            <PacientePerfilTab
              perfil={perfil}
              openEditarPerfilModal={openEditarPerfilModal}
              SectionHeader={SectionHeader}
            />
          )}

          {/* ── CONSULTAS ───────────────────────────────────── */}
          {activeTab === "consultas" && (
            <>
              <PacienteConsultasTab
                consultas={consultas || []}
                consultasFiltradas={consultasFiltradas || []}
                filtroEspecialidade={filtroEspecialidade}
                setFiltroEspecialidade={setFiltroEspecialidade}
                especialidadesUnicas={especialidadesUnicas}
                setShowConsultaModal={setShowConsultaModal}
                openDetalhesModal={openDetalhesModal}
                SectionHeader={SectionHeader}
                StatusBadge={StatusBadge}
                EmptyState={EmptyState}
              />

              {/* ── MODAL DE CANCELAMENTO ─────────────────────────────── */}
              {showCancelarModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden">
                    {/* Cabeçalho */}
                    <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                            <X className="h-4.5 w-4.5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">
                              Cancelar Consulta
                            </h3>
                            <p className="text-xs text-rose-200 mt-0.5">
                              Esta ação não poderá ser desfeita
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowCancelarModal(false);
                            setSelectedItem(null);
                            setMotivoCancelamento("");
                          }}
                          className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Resumo da consulta */}
                      <div className="rounded-xl bg-slate-50 border border-gray-100 p-4 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                          Consulta selecionada
                        </p>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <p className="text-sm font-bold text-gray-800">
                            {selectedItem.especialidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <p className="text-xs text-gray-500">
                            {selectedItem.ubs?.nome}
                          </p>
                        </div>
                        {selectedItem.dataAgendada && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-500">
                              {format(
                                new Date(selectedItem.dataAgendada),
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Campo de motivo */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-rose-400" />
                          Motivo do Cancelamento
                          <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          value={motivoCancelamento}
                          onChange={(e) =>
                            setMotivoCancelamento(e.target.value)
                          }
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all resize-none"
                          rows={3}
                          placeholder="Descreva o motivo do cancelamento..."
                          required
                        />
                        <p className="text-xs text-gray-400">
                          O motivo será registrado no histórico da consulta.
                        </p>
                      </div>

                      {/* Botões */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (!motivoCancelamento.trim()) {
                              toast.warning(
                                "Informe o motivo do cancelamento.",
                              );
                              return;
                            }
                            cancelarConsultaMutation.mutate({
                              id: selectedItem.id,
                              motivo: motivoCancelamento.trim(),
                            });
                          }}
                          disabled={
                            cancelarConsultaMutation.isLoading ||
                            !motivoCancelamento.trim()
                          }
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-rose-100 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                        >
                          {cancelarConsultaMutation.isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <X className="h-3.5 w-3.5" />
                              Confirmar Cancelamento
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowCancelarModal(false);
                            setSelectedItem(null);
                            setMotivoCancelamento("");
                          }}
                          className="flex flex-1 items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-slate-200 transition-colors"
                        >
                          Voltar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── HISTÓRICO MÉDICO ────────────────────────────── */}
          {activeTab === "historico" && (
            <PacienteHistoricoTab
              historicoMedico={historicoMedico || []}
              perfil={perfil}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}

          {/* ── VACINAS ─────────────────────────────────────── */}
          {activeTab === "vacinas" && (
            <PacienteVacinasTab
              vacinas={vacinas || []}
              perfil={perfil}
              generateVacinasPDF={generateVacinasPDF}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}

          {/* ── EXAMES ──────────────────────────────────────── */}
          {activeTab === "exames" && (
            <PacienteExamesTab
              examesSource={examesSource}
              setExamesSource={setExamesSource}
              filteredExamesRealizados={filteredExamesRealizados}
              filteredExamesSolicitados={filteredExamesSolicitados}
              exameSearch={exameSearch}
              setExameSearch={setExameSearch}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
          )}

          {/* ── INTERNAÇÕES ─────────────────────────────────── */}
          {activeTab === "internacoes" && (
            <PacienteInternacoesTab
              internacoesFilter={internacoesFilter}
              setInternacoesFilter={setInternacoesFilter}
              perfil={perfil}
              filteredSolicitacoesInternacao={filteredSolicitacoesInternacao}
              filteredInternacoes={filteredInternacoes}
              openDetalhesModal={openDetalhesModal}
              openConfirmarModal={openConfirmarModal}
              getPrioridadeColor={getPrioridadeColor}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
          )}

          {/* ── PROCEDIMENTOS ───────────────────────────────── */}
          {activeTab === "procedimentos" && (
            <PacienteProcedimentosTab
              procedimentosHospitalares={procedimentosHospitalares || []}
              openDetalhesModal={openDetalhesModal}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
          )}

          {/* ── MEDICAÇÕES ──────────────────────────────────── */}
          {activeTab === "medicacoes" && (
            <div className="max-w-7xl xl:max-w-7xl mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <SectionHeader icon={Pill} title="Medicações" />
                  <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
                    {[
                      { value: "paciente", label: "Paciente" },
                      { value: "administradas", label: "Internação" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setMedicacoesSource(
                            option.value as "paciente" | "administradas",
                          )
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          medicacoesSource === option.value
                            ? "bg-teal-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {option.label}
                        <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-2 text-[11px] font-bold text-slate-600 shadow-sm">
                          {option.value === "paciente"
                            ? (medicacoesPaciente?.length ?? 0)
                            : (medicacoesAdministradas?.length ?? 0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {medicacoesSource === "paciente" ? (
                  <>
                    {medicacoesPacienteLoading ? (
                      <div className="flex flex-col items-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600 mb-3" />
                        <p className="text-sm text-gray-400">
                          Carregando medicações do paciente...
                        </p>
                      </div>
                    ) : medicacoesPaciente && medicacoesPaciente.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100 text-sm bg-white">
                          <thead className="bg-slate-50">
                            <tr>
                              {[
                                "Medicamento",
                                "Quantidade",
                                "Retirada",
                                "Fornecido por",
                                "UBS",
                                "Funcionário",
                                "Observações",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {medicacoesPaciente.map((m: any) => (
                              <tr
                                key={m.id}
                                className="hover:bg-slate-50 transition-colors"
                              >
                                <td className="px-4 py-3 font-semibold text-gray-800">
                                  {m.medicamento?.nome || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.quantidade}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {format(
                                    new Date(m.dataRetirada),
                                    "dd/MM/yyyy",
                                    {
                                      locale: ptBR,
                                    },
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.fornecidoPor || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.ubs?.nome || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.funcionario?.nome || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.observacoes || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState
                        icon={Pill}
                        message="Nenhuma medicação de paciente encontrada"
                      />
                    )}
                  </>
                ) : (
                  <>
                    {medicacoesAdministradasLoading ? (
                      <div className="flex flex-col items-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600 mb-3" />
                        <p className="text-sm text-gray-400">
                          Carregando medicações administradas...
                        </p>
                      </div>
                    ) : medicacoesAdministradas &&
                      medicacoesAdministradas.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100 text-sm bg-white">
                          <thead className="bg-slate-50">
                            <tr>
                              {[
                                "Medicação",
                                "Data/Hora",
                                "Dosagem",
                                "Via",
                                "Administrado por",
                                "Hospital",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {medicacoesAdministradas.map((m) => (
                              <tr
                                key={m.id}
                                className="hover:bg-slate-50 transition-colors"
                              >
                                <td className="px-4 py-3 font-semibold text-gray-800">
                                  {m.nomeMedicacao}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {format(
                                    new Date(m.dataHoraAdministracao),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: ptBR },
                                  )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.dosagem || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.viaAdministracao || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.administradorNomeOuCrm || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {m.internacao?.hospital?.nome || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState
                        icon={Pill}
                        message="Nenhuma medicação administrada encontrada"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── AGENDAMENTOS ────────────────────────────────── */}
          {activeTab === "agendamentos" && (
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <SectionHeader
                  icon={Calendar}
                  title="Agendamentos Hospitalares"
                />
                {agendamentosHospitalares &&
                agendamentosHospitalares.length > 0 ? (
                  <div className="space-y-3">
                    {agendamentosHospitalares.map((a: any) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {a.hospital.nome}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {format(
                                new Date(a.dataAgendamento),
                                "dd/MM/yyyy",
                                { locale: ptBR },
                              )}{" "}
                              às {a.horaAgendamento}
                            </p>
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="rounded-lg bg-white border border-gray-100 p-2.5">
                            <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                              Tipo
                            </p>
                            <p className="text-gray-700">{a.tipo}</p>
                          </div>
                          {a.medico && (
                            <div className="rounded-lg bg-white border border-gray-100 p-2.5">
                              <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Médico
                              </p>
                              <p className="text-gray-700">{a.medico.nome}</p>
                            </div>
                          )}
                          {a.solicitacaoInternacao && (
                            <div className="rounded-lg bg-white border border-gray-100 p-2.5 col-span-2">
                              <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Relacionado à
                              </p>
                              <p className="text-gray-700">
                                {a.solicitacaoInternacao.tipo} ·{" "}
                                {a.solicitacaoInternacao.motivo}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetalhesModal(a)}
                            className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> Detalhes
                          </button>
                          {a.status === "agendado" && (
                            <button
                              onClick={() =>
                                openConfirmarModal(a, "agendamento")
                              }
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" /> Confirmar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    message="Nenhum agendamento hospitalar encontrado"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── HISTÓRICO HOSPITALAR ────────────────────────── */}
          {activeTab === "historico-hospitalar" && (
            <PacienteHistoricoHospitalarTab
              historicoHospitalar={historicoHospitalar}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}
        </main>
      </div>

      {/* ── MODAIS ──────────────────────────────────────────── */}

      {/* Modal Solicitar Consulta */}
      <PacienteSolicitarConsultaModal
        showConsultaModal={showConsultaModal}
        setShowConsultaModal={setShowConsultaModal}
        consultaData={consultaData}
        setConsultaData={setConsultaData}
        ubsList={ubsList || []}
        handleConsultaSubmit={handleConsultaSubmit}
        isLoading={solicitarConsultaMutation.isLoading}
      />

      {/* Modal Editar Perfil */}
      <PacienteEditarPerfilModal
        showEditarPerfilModal={showEditarPerfilModal}
        setShowEditarPerfilModal={setShowEditarPerfilModal}
        perfilData={perfilData}
        setPerfilData={setPerfilData}
        handleAtualizarPerfil={handleAtualizarPerfil}
        isLoading={atualizarPerfilMutation.isLoading}
      />

      {/* Modal Detalhes */}
      <PacienteDetalhesModal
        showDetalhesModal={showDetalhesModal}
        setShowDetalhesModal={setShowDetalhesModal}
        selectedItem={selectedItem}
        StatusBadge={StatusBadge}
        confirmarConsultaMutation={confirmarConsultaMutation}
        setMotivoCancelamento={setMotivoCancelamento}
        setShowCancelarModal={setShowCancelarModal}
      />

      {/* Modal Confirmar Agendamento */}
      <PacienteConfirmarAgendamentoModal
        showConfirmarModal={showConfirmarModal}
        setShowConfirmarModal={setShowConfirmarModal}
        selectedItem={selectedItem}
        confirmacaoObservacoes={confirmacaoObservacoes}
        setConfirmacaoObservacoes={setConfirmacaoObservacoes}
        handleConfirmarAgendamento={handleConfirmarAgendamento}
        isLoading={confirmarAgendamentoMutation.isLoading || confirmarAgendamentoHospitalarMutation.isLoading}
      />
    </div>
  );
};

export default PacienteDashboard;
