import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import useDispensacao from "../../hooks/useDispensacao";

// Import de componentes
import { FarmaciaHeader } from "../../components/Farmacia/FarmaciaHeader";
import { FarmaciaSidebar } from "../../components/Farmacia/FarmaciaSidebar";
import { FarmaciaConsultaTab } from "../../components/Farmacia/FarmaciaConsultaTab";
import {
  FarmaciaDispensacaoModal,
  DispensacaoFormState,
} from "../../components/Farmacia/FarmaciaDispensacaoModal";
import {
  ReceitaPayload,
  DispensacaoPayload,
} from "../../components/Farmacia/FarmaciaResultCard";

// Import de componentes existentes
import DispensacoesLista from "../../components/DispensacoesLista";
import FarmaciaDashboardHome from "../../components/FarmaciaDashboardHome";
import FarmaciaInformacoes from "../../components/FarmaciaInformacoes";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = "dashboard" | "consultar" | "historico" | "informacoes";

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

  const handleDispensacaoFormChange = (
    field: keyof DispensacaoFormState,
    value: string,
  ) => {
    setDispensacaoForm({
      ...dispensacaoForm,
      [field]: value,
    });
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
          d.id === editingDispensacaoId
            ? {
                ...respData,
                quantidadeDispensada: String(respData.quantidadeDispensada),
              }
            : d,
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
          dispensacoes: [
            ...(receita.dispensacoes || []),
            {
              ...respData,
              quantidadeDispensada: String(respData.quantidadeDispensada),
            },
          ],
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-gray-100 font-sans"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <FarmaciaHeader userName={user?.nome || "Farmácia"} onLogout={logout} />

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-8 py-8 flex gap-6">
        {/* ── Sidebar ── */}
        <FarmaciaSidebar activeTab={activeTab} onTabChange={setActiveTab} />

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
              <FarmaciaConsultaTab
                registroInput={registroInput}
                onRegistroChange={setRegistroInput}
                onBuscar={buscarReceita}
                onLimpar={resetBusca}
                receita={receita}
                contagem={contagem}
                ultimaDispensacao={ultimaDispensacao}
                validacaoDispensacao={validacaoDispensacao}
                onDispensarClick={() => openDispensacaoModal(false)}
                formatarDataDispensacao={
                  dispensacao.formatarDataDispensacao
                    ? dispensacao.formatarDataDispensacao
                    : undefined
                }
              />
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
        <FarmaciaDispensacaoModal
          receita={receita}
          isEditing={isEditingDispensacao}
          formData={dispensacaoForm}
          onFormChange={handleDispensacaoFormChange}
          onSubmit={handleDispensacaoSubmit}
          onCancel={() => {
            setShowDispensacaoModal(false);
            setIsEditingDispensacao(false);
            setEditingDispensacaoId(null);
          }}
          isLoading={loadingDispensacao}
          contagem={contagem}
          validacaoDispensacao={validacaoDispensacao}
          maxDispensacoes={dispensacao.MAX_DISPENSACOES}
          userName={user?.nome || "Farmácia"}
        />
      )}
    </div>
  );
};

export default FarmaciaDashboard;
