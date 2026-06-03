
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
    { name: "Receitas / Atestados", key: "historico-hospitalar",icon: History,
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
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Boas-vindas */}
              <div className="rounded-2xl bg-gradient-to-br from-teal-800 via-teal-700 to-blue-700 p-6 text-white relative overflow-hidden">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/5"
                />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-200 mb-2">
                    Portal do Paciente
                  </p>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Olá, {user?.nome}! 👋
                  </h2>
                  <p className="text-sm text-white/70 mb-6">
                    Como está sua saúde hoje?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        icon: Calendar,
                        label: "Próxima Consulta",
                        sub: "Em breve",
                      },
                      {
                        icon: Shield,
                        label: "Vacinas em Dia",
                        sub: "Atualizado",
                      },
                      { icon: FileText, label: "Exames", sub: "Disponíveis" },
                    ].map(({ icon: Icon, label, sub }) => (
                      <div
                        key={label}
                        className="rounded-xl bg-white/10 border border-white/15 p-3 backdrop-blur-sm"
                      >
                        <Icon className="h-5 w-5 text-teal-200 mb-2" />
                        <p className="text-xs font-semibold text-white">
                          {label}
                        </p>
                        <p className="text-xs text-white/60 mt-0.5">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: Calendar,
                      label: "Solicitar Consulta",
                      sub: "Agendar atendimento",
                      color: "blue",
                      action: () => setShowConsultaModal(true),
                    },
                    {
                      icon: FileText,
                      label: "Ver Exames",
                      sub: "Resultados e laudos",
                      color: "emerald",
                      action: () => setActiveTab("exames"),
                    },
                    {
                      icon: Shield,
                      label: "Cartão de Vacinas",
                      sub: "Histórico de imunização",
                      color: "violet",
                      action: () => setActiveTab("vacinas"),
                    },
                  ].map(({ icon: Icon, label, sub, color, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className={`flex items-center gap-3 rounded-xl border border-${color}-100 bg-${color}-50 p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md`}
                    >
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-${color}-100`}
                      >
                        <Icon className={`h-4.5 w-4.5 text-${color}-600`} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold text-${color}-900`}>
                          {label}
                        </p>
                        <p className={`text-xs text-${color}-500`}>{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campanhas */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                    <Users className="h-4 w-4 text-teal-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">
                    Campanhas Ativas
                  </h3>
                </div>

                {campanhas && campanhas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campanhas.map((campanha: any) => (
                      <div
                        key={campanha.id}
                        className="flex flex-col rounded-xl border border-gray-100 bg-slate-50 overflow-hidden hover:border-teal-200 hover:shadow-md transition-all duration-150"
                      >
                        <div className="h-1 bg-gradient-to-r from-teal-500 to-blue-500" />
                        <div className="p-4 flex flex-col flex-1 gap-2.5">
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200 capitalize">
                              {campanha.tipo}
                            </span>
                            <span className="text-xs text-gray-400">
                              {format(
                                new Date(campanha.dataIni),
                                "dd/MM/yyyy",
                                { locale: ptBR },
                              )}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 leading-snug">
                            {campanha.titulo}
                          </h4>
                          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {campanha.descricao}
                          </p>
                          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" />{" "}
                                {campanha.ubs.nome}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {campanha.ubs.endereco}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleInscreverCampanha(
                                  campanha.id,
                                  campanha.titulo,
                                )
                              }
                              className="flex-shrink-0 ml-3 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
                            >
                              Inscrever-se
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    message="Nenhuma campanha ativa no momento"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── PERFIL ──────────────────────────────────────── */}
          {activeTab === "perfil" && perfil && (
            <div className="max-w-7xl mx-auto space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <SectionHeader icon={User} title="Meu Perfil" />
                  <button
                    onClick={openEditarPerfilModal}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <Edit className="h-4 w-4" /> Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: User,
                      label: "Nome Completo",
                      value: perfil.nome,
                      span: false,
                    },
                    {
                      icon: FileText,
                      label: "CPF",
                      value: perfil.cpf,
                      span: false,
                    },
                    {
                      icon: Shield,
                      label: "CNS",
                      value: perfil.cns,
                      span: false,
                    },
                    {
                      icon: Calendar,
                      label: "Data de Nascimento",
                      value: format(new Date(perfil.nascimento), "dd/MM/yyyy", {
                        locale: ptBR,
                      }),
                      span: false,
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      value: perfil.email,
                      span: false,
                    },
                    {
                      icon: Phone,
                      label: "Telefone",
                      value: perfil.telefone,
                      span: false,
                    },
                    {
                      icon: MapPin,
                      label: "Endereço",
                      value: perfil.endereco,
                      span: true,
                    },
                  ].map(({ icon: Icon, label, value, span }) => (
                    <div
                      key={label}
                      className={`rounded-xl border border-gray-100 bg-slate-50 p-4 ${span ? "sm:col-span-2 lg:col-span-3" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-3.5 w-3.5 text-teal-500" />
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          {label}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 break-words">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CONSULTAS ───────────────────────────────────── */}
          {activeTab === "consultas" && (
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <SectionHeader icon={Stethoscope} title="Minhas Consultas" />
                  <button
                    onClick={() => setShowConsultaModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <Calendar className="h-4 w-4" /> Solicitar
                  </button>
                </div>

                {/* Filtro de especialidade */}
                {consultas && consultas.length > 0 && (
                  <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <label
                      htmlFor="filtro-especialidade"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Filtrar por especialidade:
                    </label>
                    <select
                      id="filtro-especialidade"
                      value={filtroEspecialidade}
                      onChange={(e) => setFiltroEspecialidade(e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                    >
                      <option value="">Todas as especialidades</option>
                      {especialidadesUnicas.map((esp) => (
                        <option key={esp} value={esp}>
                          {esp}
                        </option>
                      ))}
                    </select>
                    {filtroEspecialidade && (
                      <button
                        onClick={() => setFiltroEspecialidade("")}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 underline"
                      >
                        Limpar filtro
                      </button>
                    )}
                  </div>
                )}

                {consultasFiltradas && consultasFiltradas.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Especialidade
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Unidade de Saúde
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {consultasFiltradas.map((consulta: any) => (
                          <tr
                            key={consulta.id}
                            className="hover:bg-slate-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-gray-900">
                                {consulta.especialidade}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">
                                {consulta.dataAgendada
                                  ? format(
                                      new Date(consulta.dataAgendada),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: ptBR },
                                    )
                                  : "—"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">
                                {consulta.ubs?.nome || "—"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={consulta.status} />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => openDetalhesModal(consulta)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-100 transition-colors border border-teal-100"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Visualizar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : consultas && consultas.length > 0 ? (
                  <div className="rounded-xl border border-gray-100 bg-slate-50 p-6 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      Nenhuma consulta encontrada com a especialidade{" "}
                      <span className="font-bold text-gray-800">
                        "{filtroEspecialidade}"
                      </span>
                    </p>
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    message="Nenhuma consulta encontrada"
                  />
                )}

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
              </div>
            </div>
          )}

          {/* ── HISTÓRICO MÉDICO ────────────────────────────── */}
          {activeTab === "historico" && (
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <SectionHeader
                    icon={Heart}
                    title="Histórico Médico"
                    color="rose"
                  />
                  {historicoMedico && historicoMedico.length > 0 && (
                    <button
                      onClick={() =>
                        generateHistoricoMedicoPDF(historicoMedico, perfil)
                      }
                      className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 transition-all"
                    >
                      <Printer className="h-4 w-4" /> Imprimir PDF
                    </button>
                  )}
                </div>

                {historicoMedico && historicoMedico.length > 0 ? (
                  <div className="space-y-4">
                    {historicoMedico.map((item: any) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-150"
                      >
                        <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-4 text-white">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-base font-bold leading-snug">
                                {item.diagnostico}
                              </p>
                              <p className="text-xs text-teal-200 mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(
                                  new Date(item.dataConsulta),
                                  "dd/MM/yyyy",
                                  { locale: ptBR },
                                )}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-bold text-white">
                                {item.funcionario.nome}
                              </p>
                              <p className="text-xs text-teal-200">
                                {item.funcionario.funcao}
                              </p>
                              <p className="text-xs text-teal-300">
                                {item.funcionario.ubs.nome}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {item.doenca && (
                            <div className="rounded-lg border border-rose-100 bg-white p-3">
                              <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Doença
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {item.doenca}
                              </p>
                            </div>
                          )}
                          {item.medicacao && (
                            <div className="rounded-lg border border-emerald-100 bg-white p-3">
                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Medicação
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {item.medicacao}
                              </p>
                            </div>
                          )}
                          {item.laudo && (
                            <div className="rounded-lg border border-sky-100 bg-white p-3 sm:col-span-2">
                              <p className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Laudo Médico
                              </p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {item.laudo}
                              </p>
                            </div>
                          )}
                          {item.observacoes && (
                            <div className="rounded-lg border border-amber-100 bg-white p-3 sm:col-span-2">
                              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Observações
                              </p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {item.observacoes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Heart}
                    message="Nenhum histórico médico encontrado"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── VACINAS ─────────────────────────────────────── */}
          {activeTab === "vacinas" && (
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <SectionHeader
                    icon={Shield}
                    title="Cartão de Vacinas"
                    color="violet"
                  />
                  {vacinas && vacinas.length > 0 && (
                    <button
                      onClick={() => generateVacinasPDF(vacinas, perfil)}
                      className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 transition-all"
                    >
                      <Printer className="h-4 w-4" /> Imprimir PDF
                    </button>
                  )}
                </div>
                {vacinas && vacinas.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100 text-sm bg-white">
                      <thead className="bg-slate-50">
                        <tr>
                          {[
                            "Vacina",
                            "Aplicado por",
                            "Data",
                            "Lote",
                            "Próxima Dose",
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
                        {vacinas.map((vacina: any) => (
                          <tr
                            key={vacina.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-gray-800">
                              {vacina.nome}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {vacina.funcionario
                                ? `CRM: ${vacina.funcionario.crm || "N/A"}`
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {format(new Date(vacina.dataApl), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {vacina.lote}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {vacina.proximaDose
                                ? format(
                                    new Date(vacina.proximaDose),
                                    "dd/MM/yyyy",
                                    { locale: ptBR },
                                  )
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={Shield}
                    message="Nenhuma vacina registrada"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── EXAMES ──────────────────────────────────────── */}
          {activeTab === "exames" && (
            <div className="max-w-6xl xl:max-w-7xl mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <SectionHeader
                    icon={FileText}
                    title="Meus Exames"
                    color="emerald"
                  />
                  <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
                    {[
                      { value: "realizados", label: "Exames" },
                      { value: "solicitados", label: "Solicitações" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setExamesSource(
                            option.value as "realizados" | "solicitados",
                          )
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          examesSource === option.value
                            ? "bg-emerald-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {option.label}
                        <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-2 text-[11px] font-bold text-slate-600 shadow-sm">
                          {option.value === "realizados"
                            ? filteredExamesRealizados.length
                            : filteredExamesSolicitados.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={exameSearch ?? ""}
                      onChange={(e) => setExameSearch(e.target.value)}
                      placeholder="Buscar por nome do exame..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {examesSource === "realizados" ? (
                  filteredExamesRealizados.length > 0 ? (
                    <div className="space-y-3">
                      {filteredExamesRealizados.map((item: any) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {item.tipo || "Exame"}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />{" "}
                                {item.laboratorio?.nome || "—"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Exame agendado
                              </p>
                            </div>
                            <StatusBadge status={item.status} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            {item.dataAgendada && (
                              <div className="rounded-lg bg-white border border-gray-100 p-2.5">
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                  Agendado
                                </p>
                                <p className="text-gray-700">
                                  {format(
                                    new Date(item.dataAgendada),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: ptBR },
                                  )}
                                </p>
                              </div>
                            )}
                            {item.dataRealizado && (
                              <div className="rounded-lg bg-white border border-gray-100 p-2.5">
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                  Realizado
                                </p>
                                <p className="text-gray-700">
                                  {format(
                                    new Date(item.dataRealizado),
                                    "dd/MM/yyyy",
                                    { locale: ptBR },
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          {item.observacoes && (
                            <div className="rounded-lg bg-white border border-gray-100 p-3 text-xs mb-3">
                              <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Observações
                              </p>
                              <p className="text-gray-700">
                                {item.observacoes}
                              </p>
                            </div>
                          )}

                          {item.resultado && (
                            <div className="rounded-lg bg-white border border-gray-100 p-3 text-xs mb-3">
                              <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Resultado
                              </p>
                              <p className="text-gray-700">{item.resultado}</p>
                            </div>
                          )}

                          {item.arquivoPdf && (
                            <a
                              href={`http://localhost:3001/api/exames/download/${item.arquivoPdf}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" /> Baixar Laudo
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={FileText}
                      message="Nenhum exame encontrado"
                    />
                  )
                ) : filteredExamesSolicitados.length > 0 ? (
                  <div className="space-y-3">
                    {filteredExamesSolicitados.map((item: any) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {item.tipoExame}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />{" "}
                              {item.laboratorio?.nome || "—"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Solicitação de exame
                            </p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>

                        <div className="text-xs text-gray-600 mb-3">
                          Solicitado em:{" "}
                          {item.createdAt
                            ? format(new Date(item.createdAt), "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "—"}
                        </div>

                        {item.observacoes && (
                          <div className="rounded-lg bg-white border border-gray-100 p-3 text-xs mb-3">
                            <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                              Observações
                            </p>
                            <p className="text-gray-700">{item.observacoes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    message="Nenhuma solicitação de exame encontrada"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── INTERNAÇÕES ─────────────────────────────────── */}
          {activeTab === "internacoes" && (
            <div className="max-w-7xl mx-auto space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <SectionHeader icon={Building2} title="Internações" />
                  <p className="text-sm text-gray-500">
                    Filtre entre solicitações de internação e internações já
                    registradas para o paciente.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="internacoesFilter"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Mostrar
                  </label>
                  <select
                    id="internacoesFilter"
                    value={internacoesFilter}
                    onChange={(e) =>
                      setInternacoesFilter(
                        e.target.value as
                          | "all"
                          | "solicitacoes"
                          | "internacoes",
                      )
                    }
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-sky-500 focus:outline-none"
                  >
                    <option value="all">Todas</option>
                    <option value="solicitacoes">Solicitações</option>
                    <option value="internacoes">Internações</option>
                  </select>
                </div>
              </div>

              {perfil && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Paciente
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {perfil.nome}
                      </p>
                      <p className="text-sm text-slate-600">{perfil.email}</p>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Documento
                      </p>
                      <p className="text-sm text-slate-700">
                        CPF: {perfil.cpf}
                      </p>
                      <p className="text-sm text-slate-700">
                        CNS: {perfil.cns}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Contato
                      </p>
                      <p className="text-sm text-slate-700">
                        Telefone: {perfil.telefone}
                      </p>
                      <p className="text-sm text-slate-700">
                        Endereço: {perfil.endereco}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {internacoesFilter !== "internacoes" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <SectionHeader
                    icon={Building2}
                    title="Solicitações de Internação"
                  />
                  {filteredSolicitacoesInternacao &&
                  filteredSolicitacoesInternacao.length > 0 ? (
                    <div className="space-y-3">
                      {filteredSolicitacoesInternacao.map((s: any) => (
                        <div
                          key={s.id}
                          className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {s.hospital?.nome || "—"}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {format(
                                  new Date(s.createdAt),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: ptBR },
                                )}
                              </p>
                            </div>
                            <div className="flex gap-1.5 flex-wrap justify-end">
                              <StatusBadge status={s.status} />
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPrioridadeColor(s.prioridade)}`}
                              >
                                {s.prioridade}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                            {[
                              ["Tipo", s.tipo],
                              ["Motivo", s.motivo],
                              ["Médico", s.funcionario?.nome || "—"],
                              ["UBS", s.ubs?.nome || "—"],
                            ].map(([l, v]) => (
                              <div
                                key={l}
                                className="rounded-lg bg-white border border-gray-100 p-2.5"
                              >
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                  {l}
                                </p>
                                <p className="text-gray-700 font-medium">{v}</p>
                              </div>
                            ))}
                          </div>
                          {s.dataAgendada && (
                            <div className="rounded-lg bg-sky-50 border border-sky-100 p-3 text-xs mb-3">
                              <p className="font-bold text-sky-600 mb-1">
                                Agendado para
                              </p>
                              <p className="text-sky-700">
                                {format(
                                  new Date(s.dataAgendada),
                                  "dd/MM/yyyy",
                                  {
                                    locale: ptBR,
                                  },
                                )}
                                {s.horaAgendada && ` às ${s.horaAgendada}`}
                              </p>
                              {s.local && (
                                <p className="text-sky-700 mt-0.5">
                                  Local: {s.local}
                                </p>
                              )}
                              {s.recomendacoes && (
                                <p className="text-sky-700 mt-0.5">
                                  {s.recomendacoes}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDetalhesModal(s)}
                              className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" /> Ver Detalhes
                            </button>
                            {s.status === "agendado" && (
                              <button
                                onClick={() =>
                                  openConfirmarModal(s, "internacao")
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
                      icon={Building2}
                      message="Nenhuma solicitação encontrada"
                    />
                  )}
                </div>
              )}

              {internacoesFilter !== "solicitacoes" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <SectionHeader
                    icon={Building2}
                    title="Internações Realizadas"
                  />
                  {filteredInternacoes && filteredInternacoes.length > 0 ? (
                    <div className="space-y-3">
                      {filteredInternacoes.map((i: any) => (
                        <div
                          key={i.id}
                          className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {i.hospital?.nome || "—"}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Entrada:{" "}
                                {format(new Date(i.dataEntrada), "dd/MM/yyyy", {
                                  locale: ptBR,
                                })}
                                {i.dataSaida &&
                                  ` · Saída: ${format(new Date(i.dataSaida), "dd/MM/yyyy", { locale: ptBR })}`}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${i.dataSaida ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"}`}
                            >
                              {i.dataSaida ? "Finalizada" : "Em andamento"}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                            <div className="rounded-lg bg-white border border-gray-100 p-2.5">
                              <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                Motivo
                              </p>
                              <p className="text-gray-700">{i.motivo}</p>
                            </div>
                            {(i.medicoResponsavel ||
                              i.medicoResponsavelNome) && (
                              <div className="rounded-lg bg-white border border-gray-100 p-2.5">
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                  Médico Responsável
                                </p>
                                <p className="text-gray-700">
                                  {i.medicoResponsavel?.nome ||
                                    i.medicoResponsavelNome}
                                </p>
                              </div>
                            )}
                            {i.diagnostico && (
                              <div className="rounded-lg bg-white border border-gray-100 p-2.5 sm:col-span-2">
                                <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                                  Diagnóstico
                                </p>
                                <p className="text-gray-700">{i.diagnostico}</p>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => openDetalhesModal(i)}
                            className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> Ver Detalhes
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Building2}
                      message="Nenhuma internação encontrada"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PROCEDIMENTOS ───────────────────────────────── */}
          {activeTab === "procedimentos" && (
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <SectionHeader
                  icon={Activity}
                  title="Procedimentos Hospitalares"
                />
                {procedimentosHospitalares &&
                procedimentosHospitalares.length > 0 ? (
                  <div className="space-y-3">
                    {procedimentosHospitalares.map((p: any) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {p.tipo}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {format(
                                new Date(p.dataRealizacao),
                                "dd/MM/yyyy",
                                { locale: ptBR },
                              )}{" "}
                              · {p.hospital.nome}
                            </p>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="rounded-lg bg-white border border-gray-100 p-3 text-xs mb-3">
                          <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                            Descrição
                          </p>
                          <p className="text-gray-700">{p.descricao}</p>
                        </div>
                        {p.medicoRealizou && (
                          <p className="text-xs text-gray-500 mb-3">
                            {p.medicoRealizou.nome} · {p.medicoRealizou.funcao}
                          </p>
                        )}
                        <button
                          onClick={() => openDetalhesModal(p)}
                          className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> Ver Detalhes
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Activity}
                    message="Nenhum procedimento encontrado"
                  />
                )}
              </div>
            </div>
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
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <SectionHeader icon={History} title="Histórico Hospitalar" />
                {historicoHospitalar && (
                  <>
                    {/* Resumo */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                      {[
                        {
                          label: "Solicitações",
                          val: historicoHospitalar.resumo?.totalSolicitacoes,
                          color: "sky",
                        },
                        {
                          label: "Internações",
                          val: historicoHospitalar.resumo?.totalInternacoes,
                          color: "emerald",
                        },
                        {
                          label: "Procedimentos",
                          val: historicoHospitalar.resumo?.totalProcedimentos,
                          color: "violet",
                        },
                        {
                          label: "Medicações",
                          val: historicoHospitalar.resumo?.totalMedicacoes,
                          color: "amber",
                        },
                        {
                          label: "Agendamentos",
                          val: historicoHospitalar.resumo?.totalAgendamentos,
                          color: "rose",
                        },
                      ].map(({ label, val, color }) => (
                        <div
                          key={label}
                          className={`rounded-xl bg-${color}-50 border border-${color}-100 p-3 text-center`}
                        >
                          <p className={`text-2xl font-bold text-${color}-600`}>
                            {val || 0}
                          </p>
                          <p
                            className={`text-xs font-medium text-${color}-500 mt-0.5`}
                          >
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Timeline */}
                    {historicoHospitalar.historico &&
                    historicoHospitalar.historico.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                          Linha do Tempo
                        </p>
                        {historicoHospitalar.historico.map((item: any) => (
                          <div
                            key={`${item.tipo}-${item.id}`}
                            className="flex gap-3"
                          >
                            <div className="flex flex-col items-center">
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
                                <div className="h-2 w-2 rounded-full bg-teal-500" />
                              </div>
                              <div className="mt-1 w-px flex-1 bg-gray-100" />
                            </div>
                            <div className="flex-1 rounded-xl border border-gray-100 bg-slate-50 p-3 mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-gray-800 capitalize">
                                  {item.tipo === "solicitacao" &&
                                    "Solicitação de Internação"}
                                  {item.tipo === "internacao" && "Internação"}
                                  {item.tipo === "procedimento" &&
                                    "Procedimento"}
                                  {item.tipo === "medicacao" && "Medicação"}
                                  {item.tipo === "agendamento" && "Agendamento"}
                                </p>
                                <span className="text-xs text-gray-400">
                                  {format(
                                    new Date(item.data),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: ptBR },
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {item.tipo === "solicitacao" &&
                                  `${item.hospital?.nome} — ${item.motivo}`}
                                {item.tipo === "internacao" &&
                                  `${item.hospital?.nome} — ${item.motivo}`}
                                {item.tipo === "procedimento" &&
                                  `${item.hospital?.nome} — ${item.descricao}`}
                                {item.tipo === "medicacao" &&
                                  `${item.nomeMedicacao} — ${item.dosagem || "Dosagem não informada"}`}
                                {item.tipo === "agendamento" &&
                                  `${item.hospital?.nome} — ${item.tipo}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={History}
                        message="Nenhum histórico hospitalar encontrado"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODAIS ──────────────────────────────────────────── */}

      {/* Modal Solicitar Consulta */}
      {showConsultaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden">
            {/* Cabeçalho com gradiente */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                    <Calendar className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Solicitar Consulta
                    </h3>
                    <p className="text-xs text-teal-200 mt-0.5">
                      Preencha os dados para agendamento
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConsultaModal(false)}
                  className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Corpo do formulário */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleConsultaSubmit} className="space-y-5">
                {/* UBS */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-teal-500" />
                    Unidade de Saúde (UBS)
                  </label>
                  <select
                    value={consultaData.ubsId}
                    onChange={(e) =>
                      setConsultaData({
                        ...consultaData,
                        ubsId: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                    required
                  >
                    <option value="">Selecione uma UBS</option>
                    {ubsList?.map((ubs: any) => (
                      <option key={ubs.id} value={ubs.id}>
                        {ubs.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Especialidade — grid de pills clicáveis */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    <Stethoscope className="h-3 w-3 text-teal-500" />
                    Especialidade
                  </label>

                  {/* Pills de seleção rápida */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: "Clínico Geral", icon: "🩺" },
                      { label: "Cardiologia", icon: "❤️" },
                      { label: "Pediatria", icon: "👶" },
                      { label: "Ginecologia", icon: "🌸" },
                      { label: "Ortopedia", icon: "🦴" },
                      { label: "Dermatologia", icon: "🔬" },
                      { label: "Neurologia", icon: "🧠" },
                      { label: "Oftalmologia", icon: "👁️" },
                      { label: "Odontologia", icon: "🦷" },
                      { label: "Psicologia", icon: "💬" },
                      { label: "Endocrinologia", icon: "⚗️" },
                      { label: "Outra", icon: "➕" },
                    ].map(({ label, icon }) => {
                      const selected = consultaData.especialidade === label;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            setConsultaData({
                              ...consultaData,
                              especialidade: label === "Outra" ? "" : label,
                            })
                          }
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-left transition-all duration-150 hover:-translate-y-0.5 ${
                            selected
                              ? "border-teal-400 bg-teal-50 text-teal-700 shadow-sm shadow-teal-100"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-700"
                          }`}
                        >
                          <span className="text-sm">{icon}</span>
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Campo livre para "Outra" ou confirmação do selecionado */}
                  <div className="relative">
                    <input
                      type="text"
                      value={consultaData.especialidade}
                      onChange={(e) =>
                        setConsultaData({
                          ...consultaData,
                          especialidade: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                      placeholder="Ou digite outra especialidade..."
                      required
                    />
                    {consultaData.especialidade && (
                      <button
                        type="button"
                        onClick={() =>
                          setConsultaData({
                            ...consultaData,
                            especialidade: "",
                          })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Motivo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-teal-500" />
                    Motivo da Consulta
                  </label>
                  <textarea
                    value={consultaData.motivo}
                    onChange={(e) =>
                      setConsultaData({
                        ...consultaData,
                        motivo: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Descreva brevemente o motivo da consulta, sintomas ou queixa principal..."
                    required
                  />
                  <p className="text-xs text-gray-400">
                    Seja específico para facilitar o atendimento
                  </p>
                </div>

                {/* Resumo da seleção */}
                {(consultaData.ubsId || consultaData.especialidade) && (
                  <div className="rounded-xl bg-teal-50 border border-teal-100 p-3">
                    <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">
                      Resumo
                    </p>
                    <div className="space-y-1">
                      {consultaData.ubsId && (
                        <p className="text-xs text-teal-600 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="font-medium">
                            {
                              ubsList?.find(
                                (u: any) => u.id === consultaData.ubsId,
                              )?.nome
                            }
                          </span>
                        </p>
                      )}
                      {consultaData.especialidade && (
                        <p className="text-xs text-teal-600 flex items-center gap-1.5">
                          <Stethoscope className="h-3 w-3 flex-shrink-0" />
                          <span className="font-medium">
                            {consultaData.especialidade}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={solicitarConsultaMutation.isLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-teal-200 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {solicitarConsultaMutation.isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        Solicitar Consulta
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConsultaModal(false)}
                    className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Perfil */}
      {showEditarPerfilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                  <Edit className="h-4 w-4 text-teal-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Editar Perfil
                </h3>
              </div>
              <button
                onClick={() => setShowEditarPerfilModal(false)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAtualizarPerfil} className="space-y-4">
              {[
                { label: "Endereço", key: "endereco", type: "text" },
                { label: "Telefone", key: "telefone", type: "tel" },
                { label: "Email", key: "email", type: "email" },
              ].map(({ label, key, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={(perfilData as any)[key]}
                    onChange={(e) =>
                      setPerfilData({ ...perfilData, [key]: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={atualizarPerfilMutation.isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />{" "}
                  {atualizarPerfilMutation.isLoading ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditarPerfilModal(false)}
                  className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetalhesModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
            {/* Cabeçalho do modal */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50">
                  {selectedItem.especialidade ? (
                    <Stethoscope className="h-5 w-5 text-teal-600" />
                  ) : (
                    <Building2 className="h-5 w-5 text-teal-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedItem.especialidade ||
                      selectedItem.titulo ||
                      "Detalhes"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedItem.ubs?.nome ||
                      selectedItem.hospital?.nome ||
                      "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Status badge */}
            <div className="mb-6">
              <StatusBadge status={selectedItem.status} />
            </div>

            {/* Grid de informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {selectedItem.dataAgendada && (
                <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Data Agendada
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(
                      new Date(selectedItem.dataAgendada),
                      "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                      { locale: ptBR },
                    )}
                  </p>
                </div>
              )}

              {selectedItem.ubs && (
                <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Unidade de Saúde
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedItem.ubs.nome}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selectedItem.ubs.endereco}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {selectedItem.ubs.telefone}
                  </p>
                </div>
              )}

              {selectedItem.especialidade && (
                <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Especialidade
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedItem.especialidade}
                  </p>
                </div>
              )}

              {selectedItem.motivo && (
                <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Motivo
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedItem.motivo}
                  </p>
                </div>
              )}

              {selectedItem.funcionario && (
                <div className="rounded-xl bg-slate-50 border border-gray-100 p-4 sm:col-span-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Profissional de Saúde
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedItem.funcionario.nome}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedItem.funcionario.funcao}
                  </p>
                  {selectedItem.funcionario.crm && (
                    <p className="text-xs text-gray-600">
                      CRM: {selectedItem.funcionario.crm}
                    </p>
                  )}
                </div>
              )}

              {selectedItem.observacoes && (
                <div className="rounded-xl bg-slate-50 border border-gray-100 p-4 sm:col-span-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Observações
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedItem.observacoes}
                  </p>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            {selectedItem.status === "agendada" && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    confirmarConsultaMutation.mutate(selectedItem.id);
                    setShowDetalhesModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmar Consulta
                </button>
                <button
                  onClick={() => {
                    setMotivoCancelamento("");
                    setShowDetalhesModal(false);
                    setShowCancelarModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancelar Consulta
                </button>
              </div>
            )}

            {/* Botão fechar */}
            {selectedItem.status !== "agendada" && (
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDetalhesModal(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Confirmar Agendamento */}
      {showConfirmarModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Confirmar Agendamento
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmarModal(false)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-3 mb-4 text-sm">
              <p className="font-bold text-gray-800">
                {selectedItem.hospital?.nome || "Hospital"}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {selectedItem.dataAgendada &&
                  format(new Date(selectedItem.dataAgendada), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                {selectedItem.dataAgendamento &&
                  format(new Date(selectedItem.dataAgendamento), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                {(selectedItem.horaAgendada || selectedItem.horaAgendamento) &&
                  ` às ${selectedItem.horaAgendada || selectedItem.horaAgendamento}`}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label
                htmlFor="confirmacaoObservacoes"
                className="text-xs font-bold uppercase tracking-widest text-gray-500"
              >
                Observações (opcional)
              </label>
              <textarea
                id="confirmacaoObservacoes"
                value={confirmacaoObservacoes}
                onChange={(e) => setConfirmacaoObservacoes(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none"
                rows={3}
                placeholder="Alguma observação sobre a confirmação..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmarAgendamento}
                disabled={
                  confirmarAgendamentoMutation.isLoading ||
                  confirmarAgendamentoHospitalarMutation.isLoading
                }
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {confirmarAgendamentoMutation.isLoading ||
                confirmarAgendamentoHospitalarMutation.isLoading
                  ? "Confirmando..."
                  : "Confirmar"}
              </button>
              <button
                onClick={() => setShowConfirmarModal(false)}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacienteDashboard;
