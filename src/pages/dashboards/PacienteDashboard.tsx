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
import { PacienteMedicacoesTab } from "../../components/Paciente/PacienteMedicacoesTab";
import { PacienteAgendamentosTab } from "../../components/Paciente/PacienteAgendamentosTab";
import { PacienteHistoricoHospitalarTab } from "../../components/Paciente/PacienteHistoricoHospitalarTab";
import { PacienteSolicitarConsultaModal } from "../../components/Paciente/PacienteSolicitarConsultaModal";
import { PacienteEditarPerfilModal } from "../../components/Paciente/PacienteEditarPerfilModal";
import { PacienteDetalhesModal } from "../../components/Paciente/PacienteDetalhesModal";
import { PacienteConfirmarAgendamentoModal } from "../../components/Paciente/PacienteConfirmarAgendamentoModal";
import { PacienteCancelarConsultaModal } from "../../components/Paciente/PacienteCancelarConsultaModal";
import { EmptyState } from "../../components/UI/EmptyState";
import { StatusBadge } from "../../components/UI/StatusBadge";
import { SectionHeader } from "../../components/UI/SectionHeader";

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
      onError: (e: any) => {
        toast.error(e.response?.data?.message || "Erro ao inscrever");
      },
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
            <PacienteMedicacoesTab
              medicacoesSource={medicacoesSource}
              setMedicacoesSource={setMedicacoesSource}
              medicacoesPacienteLoading={medicacoesPacienteLoading}
              medicacoesPaciente={medicacoesPaciente || []}
              medicacoesAdministradasLoading={medicacoesAdministradasLoading}
              medicacoesAdministradas={medicacoesAdministradas || []}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}

          {/* ── AGENDAMENTOS ────────────────────────────────── */}
          {activeTab === "agendamentos" && (
            <PacienteAgendamentosTab
              agendamentosHospitalares={agendamentosHospitalares || []}
              openDetalhesModal={openDetalhesModal}
              openConfirmarModal={openConfirmarModal}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
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

      {/* Modal Cancelar Consulta */}
      <PacienteCancelarConsultaModal
        showCancelarModal={showCancelarModal}
        setShowCancelarModal={setShowCancelarModal}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        motivoCancelamento={motivoCancelamento}
        setMotivoCancelamento={setMotivoCancelamento}
        handleCancelarConsulta={handleCancelarConsulta}
        isLoading={cancelarConsultaMutation.isLoading}
      />
    </div>
  );
};

export default PacienteDashboard;
