import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Box,
  Package,
  CheckCircle,
  LogOut,
  Search,
  AlertCircle,
  CheckCheck,
  AlertTriangle,
  History,
  Home,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import useDispensacao from "../../hooks/useDispensacao";
import DispensacoesLista from "../../components/DispensacoesLista";
import FarmaciaDashboardHome from "../../components/FarmaciaDashboardHome";
import FarmaciaInformacoes from "../../components/FarmaciaInformacoes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DispensacaoPayload {
  id?: string;
  dataDispensacao?: string;
  createdAt?: string;
  statusDispensacao?: string;
  quantidadeDispensada?: string;
  farmaciaResponsavel?: string | null;
  medicamentoFornecido?: string | null;
  observacoesDispensacao?: string | null;
  farmacia?: { nome: string } | null;
}

interface ReceitaPayload {
  id: string;
  registroAssinatura?: string | null;
  medicamento: string;
  dosagem: string;
  quantidade: string;
  descricao?: string;
  observacoes?: string | null;
  status: string;
  paciente?: { nome: string } | null;
  funcionario?: { nome: string } | null;
  ubs?: { nome: string } | null;
  dispensacoes?: DispensacaoPayload[] | null;
}

interface DispensacaoFormState {
  medicamentoFornecido: string;
  observacoesDispensacao: string;
  statusDispensacao: "completa" | "parcial";
  farmaciaResponsavel: string;
  quantidadeDispensada: string;
}

type ActiveTab = "dashboard" | "consultar" | "historico" | "informacoes";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}
const Field: React.FC<FieldProps> = ({ id, label, children }) => (
  <div className="mb-5">
    <label
      htmlFor={id}
      className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide"
    >
      {label}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white";

interface InfoItemProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}
const InfoItem: React.FC<InfoItemProps> = ({ label, value, fullWidth }) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <span className="block text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}
const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
      active
        ? "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-md shadow-indigo-200"
        : "text-gray-500 hover:bg-red-50 hover:text-red-600"
    }`}
  >
    {icon}
    {label}
  </button>
);

interface RadioOptionProps {
  value: "completa" | "parcial";
  current: "completa" | "parcial";
  onChange: (v: "completa" | "parcial") => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}
const RadioOption: React.FC<RadioOptionProps> = ({
  value,
  current,
  onChange,
  icon,
  title,
  subtitle,
}) => {
  const isSelected = current === value;
  const selectedClass =
    value === "completa"
      ? "border-red-500 bg-red-50"
      : "border-amber-400 bg-amber-50";
  const dotClass =
    value === "completa"
      ? "border-red-500 bg-red-500"
      : "border-amber-400 bg-amber-400";

  return (
    <label
      className={`flex-1 flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
        isSelected ? selectedClass : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <input
        type="radio"
        name="status"
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected ? dotClass : "border-gray-300"
        }`}
      >
        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <strong className="block text-xs font-semibold text-gray-700">
          {title}
        </strong>
        <small className="text-[0.68rem] text-gray-400">{subtitle}</small>
      </div>
      {icon}
    </label>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const FarmaciaDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const dispensacao = useDispensacao();

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [registroInput, setRegistroInput] = useState("");
  const [receita, setReceita] = useState<ReceitaPayload | null>(null);
  const [dispensacaoForm, setDispensacaoForm] = useState<DispensacaoFormState>({
    medicamentoFornecido: "",
    observacoesDispensacao: "",
    statusDispensacao: "completa",
    farmaciaResponsavel: "",
    quantidadeDispensada: "",
  });
  const [showDispensacaoModal, setShowDispensacaoModal] = useState(false);
  const [isEditingDispensacao, setIsEditingDispensacao] = useState(false);
  const [loadingDispensacao, setLoadingDispensacao] = useState(false);
  const [editingDispensacaoId, setEditingDispensacaoId] = useState<
    string | null
  >(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openDispensacaoModal = (edit: boolean, dispensacaoId?: string) => {
    if (!receita) return;

    let formData: DispensacaoFormState = {
      medicamentoFornecido: receita.medicamento,
      observacoesDispensacao: "",
      statusDispensacao: "completa",
      farmaciaResponsavel: "",
      quantidadeDispensada: receita.quantidade,
    };

    if (edit && dispensacaoId) {
      const dispParaEditar = receita.dispensacoes?.find(
        (d) => d.id === dispensacaoId,
      );
      if (dispParaEditar) {
        formData = {
          medicamentoFornecido:
            dispParaEditar.medicamentoFornecido || receita.medicamento,
          observacoesDispensacao: dispParaEditar.observacoesDispensacao || "",
          statusDispensacao:
            (dispParaEditar.statusDispensacao as "completa" | "parcial") ||
            "completa",
          farmaciaResponsavel:
            dispParaEditar.farmaciaResponsavel || user?.nome || "",
          quantidadeDispensada: "",
        };
        setEditingDispensacaoId(dispensacaoId);
      }
    }

    setDispensacaoForm(formData);
    setIsEditingDispensacao(edit);
    setShowDispensacaoModal(true);
  };

  const resetBusca = () => {
    setRegistroInput("");
    setReceita(null);
    setIsEditingDispensacao(false);
    setShowDispensacaoModal(false);
    setEditingDispensacaoId(null);
  };

  const buscarReceita = async () => {
    if (!registroInput) {
      toast.error("Informe o registro da assinatura");
      return;
    }
    try {
      const resp = await api.get(
        `/farmacia/receita/${encodeURIComponent(registroInput)}`,
      );
      setReceita(resp.data);
    } catch (err) {
      setReceita(null);
      toast.error(
        err instanceof Error ? err.message : "Erro ao buscar receita",
      );
    }
  };

  const handleDispensacaoSubmit = async () => {
    if (!receita) return;

    // Validações obrigatórias
    if (!dispensacaoForm.observacoesDispensacao.trim()) {
      toast.error("Observações são obrigatórias");
      return;
    }

    if (!dispensacaoForm.farmaciaResponsavel.trim()) {
      toast.error("Atendente responsável é obrigatório");
      return;
    }

    setLoadingDispensacao(true);
    try {
      const payload = {
        farmaciaResponsavel: dispensacaoForm.farmaciaResponsavel,
        medicamentoFornecido: dispensacaoForm.medicamentoFornecido,
        observacoesDispensacao: dispensacaoForm.observacoesDispensacao,
        statusDispensacao: dispensacaoForm.statusDispensacao,
        quantidadeDispensada: Number(dispensacaoForm.quantidadeDispensada) || 1,
      };

      let respData: typeof payload & { id?: string; createdAt?: string };
      if (isEditingDispensacao && editingDispensacaoId) {
        respData = (
          await api.put(
            `/farmacia/dispensacoes/${editingDispensacaoId}`,
            payload,
          )
        ).data;
        const dispensacoesAtualizadas = receita.dispensacoes?.map((d) =>
          d.id === editingDispensacaoId ? respData : d,
        );
        setReceita({ ...receita, dispensacoes: dispensacoesAtualizadas });
        toast.success("Dispensação atualizada com sucesso");
      } else {
        respData = (
          await api.post("/farmacia/dispensar", {
            receitaId: receita.id,
            ...payload,
          })
        ).data;
        setReceita({
          ...receita,
          dispensacoes: [...(receita.dispensacoes || []), respData],
        });
        toast.success("Dispensação registrada com sucesso");
      }

      setShowDispensacaoModal(false);
      setEditingDispensacaoId(null);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      if (
        err !== null &&
        "response" in (err as object) &&
        typeof axiosError.response?.data?.message === "string"
      ) {
        toast.error(axiosError.response.data.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao registrar dispensação");
      }
    } finally {
      setLoadingDispensacao(false);
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────────

  const getUltimaDispensacao = (dispensacoes?: DispensacaoPayload[] | null) =>
    dispensacoes?.length ? dispensacoes[dispensacoes.length - 1] : null;

  const ultimaDispensacao = getUltimaDispensacao(receita?.dispensacoes);
  const validacaoDispensacao =
    receita && receita.dispensacoes
      ? dispensacao.podeDispensar(receita.dispensacoes)
      : { pode: false, motivo: null };
  const contagem =
    receita && receita.dispensacoes
      ? dispensacao.contarDispensacoes(receita.dispensacoes)
      : { total: 0, completas: 0, parciais: 0 };

  const PAGE_META: Record<ActiveTab, { title: string; description: string }> = {
    dashboard: {
      title: "Painel de Controle",
      description: "Visualize estatísticas e informações gerais da farmácia.",
    },
    consultar: {
      title: "Consulta de Receitas",
      description: "Busque prescrições e histórico de atendimento.",
    },
    historico: {
      title: "Histórico de Dispensações",
      description:
        "Visualize o histórico completo de todas as dispensações realizadas.",
    },
    informacoes: {
      title: "Central de Informações",
      description: "Informações e guias sobre como usar o sistema.",
    },
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-gray-100 font-sans"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h1
                className="text-base font-bold text-red-950"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Painel Farmácia
              </h1>
              <p className="text-[0.7rem] text-gray-400 font-light">
                Bem-vindo, {user?.nome}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium transition-all hover:border-red-300 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-8 py-8 flex gap-6">
        {/* ── Sidebar ── */}
        <aside className="w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04] sticky top-20">
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-2.5">
              Navegação
            </p>
            <NavButton
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
              icon={<Home size={16} />}
              label="Painel de Controle"
            />
            <NavButton
              active={activeTab === "consultar"}
              onClick={() => setActiveTab("consultar")}
              icon={<Search size={16} />}
              label="Consultar Receita"
            />
            <NavButton
              active={activeTab === "historico"}
              onClick={() => setActiveTab("historico")}
              icon={<History size={16} />}
              label="Histórico"
            />
            <NavButton
              active={activeTab === "informacoes"}
              onClick={() => setActiveTab("informacoes")}
              icon={<Info size={16} />}
              label="Informações"
            />
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h2
              className="text-3xl text-red-950 mb-1"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {PAGE_META[activeTab].title}
            </h2>
            <p className="text-sm text-gray-400 font-light">
              {PAGE_META[activeTab].description}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm border border-black/[0.04]">
            {/* ── Tab: Dashboard ── */}
            {activeTab === "dashboard" && <FarmaciaDashboardHome />}

            {/* ── Tab: Consultar ── */}
            {activeTab === "consultar" && (
              <div>
                <label
                  htmlFor="registro"
                  className="block text-xs font-semibold text-gray-700 mb-2.5"
                >
                  Número do registro de assinatura
                </label>

                {/* Search row */}
                <div className="flex gap-2.5">
                  <input
                    id="registro"
                    type="text"
                    className={`${inputClass} flex-1`}
                    value={registroInput}
                    onChange={(e) => setRegistroInput(e.target.value)}
                    placeholder="Ex: REC-2024-00123"
                    onKeyDown={(e) => e.key === "Enter" && buscarReceita()}
                  />
                  <button
                    type="button"
                    onClick={buscarReceita}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-red-200 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200 whitespace-nowrap"
                  >
                    <Search size={15} />
                    Buscar
                  </button>
                  <button
                    type="button"
                    onClick={resetBusca}
                    className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium transition-all hover:bg-gray-200 hover:text-gray-700 whitespace-nowrap"
                  >
                    Limpar
                  </button>
                </div>

                {/* Result card */}
                {receita && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-600 px-6 py-4">
                      <div>
                        <h3
                          className="text-base font-semibold text-white"
                          style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                          Receita encontrada
                        </h3>

                        <p className="mt-1 text-xs text-indigo-100">
                          Registro: {receita.registroAssinatura || receita.id}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                          receita.status === "ativo"
                            ? "border border-white/30 bg-white/20 text-white"
                            : "bg-black/20 text-white"
                        }`}
                      >
                        {receita.status}
                      </span>
                    </div>

                    <div className="space-y-6 p-6">
                      {/* Paciente */}
                      <section>
                        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Dados do paciente
                        </h4>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <InfoItem
                            label="Paciente"
                            value={receita.paciente?.nome || "—"}
                          />

                          <InfoItem
                            label="UBS"
                            value={receita.ubs?.nome || "—"}
                          />

                          <InfoItem
                            label="Médico responsável"
                            value={receita.funcionario?.nome || "—"}
                          />
                        </div>
                      </section>

                      <div className="border-t border-slate-200" />

                      {/* Prescrição */}
                      <section>
                        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Prescrição médica
                        </h4>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <InfoItem
                              label="Medicamento prescrito"
                              value={receita.medicamento}
                              fullWidth
                            />
                          </div>

                          <InfoItem label="Dosagem" value={receita.dosagem} />

                          <InfoItem
                            label="Comprimidos"
                            value={receita.quantidade}
                          />
                        </div>
                      </section>

                      {receita.observacoes && (
                        <>
                          <div className="border-t border-slate-200" />

                          <section>
                            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Observações
                            </h4>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-sm text-slate-700">
                                {receita.observacoes}
                              </p>
                            </div>
                          </section>
                        </>
                      )}

                      {!!receita.dispensacoes?.length && (
                        <>
                          <div className="border-t border-slate-200" />

                          <section>
                            <div className="mb-3 flex items-center justify-between">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Histórico de dispensações
                              </h4>

                              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                                {receita.dispensacoes.length} registro(s)
                              </span>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                              {receita.dispensacoes.map((disp, index) => (
                                <div
                                  key={disp.id || index}
                                  className="flex gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0"
                                >
                                  <div
                                    className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                                      disp.statusDispensacao === "parcial"
                                        ? "bg-amber-400"
                                        : "bg-emerald-500"
                                    }`}
                                  />

                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-700">
                                      {disp.statusDispensacao === "parcial"
                                        ? `Dispensação parcial ${index + 1}`
                                        : `Dispensação completa ${index + 1}`}

                                      {disp.medicamentoFornecido &&
                                        ` • ${disp.medicamentoFornecido}`}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {new Date(
                                        disp.dataDispensacao ||
                                          disp.createdAt ||
                                          Date.now(),
                                      ).toLocaleString("pt-BR")}
                                    </p>

                                    {(disp.farmaciaResponsavel ||
                                      disp.observacoesDispensacao) && (
                                      <p className="mt-1 text-xs text-slate-400">
                                        {disp.farmaciaResponsavel}

                                        {disp.farmaciaResponsavel &&
                                          disp.observacoesDispensacao &&
                                          " • "}

                                        {disp.observacoesDispensacao}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        </>
                      )}

                      {(contagem.total > 0 || ultimaDispensacao) && (
                        <>
                          <div className="border-t border-slate-200" />

                          <section>
                            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Resumo da dispensação
                            </h4>

                            <div className="flex flex-wrap gap-3">
                              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2">
                                <Box size={14} />
                                <span className="text-xs font-medium">
                                  {contagem.total} dispensações
                                </span>
                              </div>

                              {contagem.completas > 0 && (
                                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2">
                                  <CheckCheck size={14} />
                                  <span className="text-xs font-medium text-emerald-700">
                                    {contagem.completas} completas
                                  </span>
                                </div>
                              )}

                              {contagem.parciais > 0 && (
                                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
                                  <AlertCircle size={14} />
                                  <span className="text-xs font-medium text-amber-700">
                                    {contagem.parciais} parciais
                                  </span>
                                </div>
                              )}
                            </div>

                            {ultimaDispensacao && (
                              <p className="mt-4 text-xs italic text-slate-500">
                                Última dispensação:{" "}
                                {dispensacao.formatarDataDispensacao
                                  ? dispensacao.formatarDataDispensacao(
                                      ultimaDispensacao,
                                    )
                                  : new Date(
                                      ultimaDispensacao.dataDispensacao ||
                                        ultimaDispensacao.createdAt ||
                                        Date.now(),
                                    ).toLocaleString("pt-BR")}
                              </p>
                            )}
                          </section>
                        </>
                      )}

                      {validacaoDispensacao.pode && (
                        <>
                          <div className="border-t border-slate-200" />

                          <div className="flex justify-end">
                            <button
                              onClick={() => openDispensacaoModal(false)}
                              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700"
                            >
                              <Package size={16} />
                              Dispensar receita
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Informações ── */}
            {activeTab === "informacoes" && <FarmaciaInformacoes />}

            {/* ── Tab: Histórico ── */}
            {activeTab === "historico" && <DispensacoesLista />}
          </div>
        </main>
      </div>

      {/* ── Modal de Dispensação ── */}
      {showDispensacaoModal && receita && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2
              className="text-2xl text-red-950 mb-1"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {isEditingDispensacao
                ? "Atualizar dispensação"
                : "Registrar dispensação"}
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Paciente: {receita.paciente?.nome}
            </p>

            {contagem.total > 0 && (
              <div className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-red-600 bg-indigo-50 px-3 py-1 rounded-full mb-5">
                <Box size={12} />
                {contagem.total} / {dispensacao.MAX_DISPENSACOES} dispensações
              </div>
            )}

            {!validacaoDispensacao.pode && !isEditingDispensacao && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">
                <AlertCircle size={15} />
                {validacaoDispensacao.motivo}
              </div>
            )}

            <Field id="med-modal" label="Medicamento fornecido">
              <input
                id="med-modal"
                type="text"
                className={inputClass}
                value={dispensacaoForm.medicamentoFornecido}
                onChange={(e) =>
                  setDispensacaoForm({
                    ...dispensacaoForm,
                    medicamentoFornecido: e.target.value,
                  })
                }
                placeholder="Nome do medicamento fornecido"
              />
            </Field>

            <Field id="qtd-modal" label="Quantidade Medicação">
              <input
                id="qtd-modal"
                type="number"
                min={1}
                max={receita.quantidade}
                className={inputClass}
                value={dispensacaoForm.quantidadeDispensada}
                onChange={(e) => {
                  const valor = Number(e.target.value);
                  const maximo = receita.quantidade;

                  if (
                    e.target.value === "" ||
                    (valor >= 1 && valor <= maximo)
                  ) {
                    setDispensacaoForm({
                      ...dispensacaoForm,
                      quantidadeDispensada: e.target.value,
                    });
                  }
                }}
                onBlur={(e) => {
                  const valor = Number(e.target.value);
                  const maximo = receita.quantidade;

                  if (valor > maximo) {
                    setDispensacaoForm({
                      ...dispensacaoForm,
                      quantidadeDispensada: String(maximo),
                    });
                  }
                }}
                placeholder={`Máx: ${receita.quantidade}`}
              />
              {Number(dispensacaoForm.quantidadeDispensada) >
                Number(receita.quantidade) && (
                <p className="text-xs text-red-500 mt-1">
                  Valor não pode ser maior que {receita.quantidade}
                </p>
              )}
            </Field>

            <Field id="obs-modal" label="Observações *">
              <textarea
                id="obs-modal"
                className={`${inputClass} resize-y min-h-[80px]`}
                value={dispensacaoForm.observacoesDispensacao}
                onChange={(e) =>
                  setDispensacaoForm({
                    ...dispensacaoForm,
                    observacoesDispensacao: e.target.value,
                  })
                }
                placeholder="Ex: Medicamento indisponível, paciente retorna amanhã"
                rows={3}
                required
              />
            </Field>

            <div className="mb-5">
              <label
                htmlFor="status-modal"
                className="block text-xs font-semibold text-gray-700 mb-2 tracking-wide"
              >
                Status da dispensação
              </label>
              <div className="flex gap-2.5">
                <RadioOption
                  value="completa"
                  current={dispensacaoForm.statusDispensacao}
                  onChange={(v) =>
                    setDispensacaoForm({
                      ...dispensacaoForm,
                      statusDispensacao: v,
                    })
                  }
                  icon={
                    <CheckCheck
                      size={15}
                      className={
                        dispensacaoForm.statusDispensacao === "completa"
                          ? "text-indigo-500"
                          : "text-gray-300"
                      }
                    />
                  }
                  title="Completa"
                  subtitle="Fornecido na íntegra"
                />
                <RadioOption
                  value="parcial"
                  current={dispensacaoForm.statusDispensacao}
                  onChange={(v) =>
                    setDispensacaoForm({
                      ...dispensacaoForm,
                      statusDispensacao: v,
                    })
                  }
                  icon={
                    <AlertTriangle
                      size={15}
                      className={
                        dispensacaoForm.statusDispensacao === "parcial"
                          ? "text-amber-400"
                          : "text-gray-300"
                      }
                    />
                  }
                  title="Parcial"
                  subtitle="Paciente volta depois"
                />
              </div>
            </div>

            <Field id="atend-modal" label="Atendente responsável *">
              <input
                id="atend-modal"
                type="text"
                className={inputClass}
                value={dispensacaoForm.farmaciaResponsavel}
                onChange={(e) =>
                  setDispensacaoForm({
                    ...dispensacaoForm,
                    farmaciaResponsavel: e.target.value,
                  })
                }
                placeholder="Digite seu nome"
                required
              />
            </Field>

            <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="block text-xs font-semibold text-red-900 mb-1.5 tracking-wide">
                Farmácia responsável
              </p>
              <div className="text-sm font-medium text-red-700 flex items-center gap-2">
                <Package size={14} className="text-red-500" />
                {user?.nome || "Farmácia"}
              </div>
              <p className="text-[0.7rem] text-red-600 mt-1 italic">
                Informação fixa do usuário logado
              </p>
            </div>

            <div className="flex gap-2.5 mt-6 pt-5 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowDispensacaoModal(false);
                  setIsEditingDispensacao(false);
                  setEditingDispensacaoId(null);
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium transition-all hover:bg-gray-50 hover:border-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDispensacaoSubmit}
                disabled={
                  loadingDispensacao ||
                  (!validacaoDispensacao.pode && !isEditingDispensacao) ||
                  !dispensacaoForm.observacoesDispensacao.trim() ||
                  !dispensacaoForm.farmaciaResponsavel.trim()
                }
                className="flex-1 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-red-200 transition-all hover:shadow-lg hover:shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingDispensacao ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} />
                    {isEditingDispensacao
                      ? "Atualizar"
                      : "Confirmar dispensação"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmaciaDashboard;
