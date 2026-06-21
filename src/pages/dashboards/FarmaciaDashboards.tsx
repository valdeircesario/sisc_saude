import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { api } from "../../services/api";
import useDispensacao from "../../hooks/useDispensacao";

// Import de componentes
import { FarmaciaHeader } from "../../components/Farmacia/FarmaciaHeader";
import { FarmaciaSidebar } from "../../components/Farmacia/FarmaciaSidebar";
import { FarmaciaConsultaTab } from "../../components/Farmacia/FarmaciaConsultaTab";
import { FarmaciaDispensacaoModalNovo, MedicamentoPendente } from "../../components/Farmacia/FarmaciaDispensacaoModalNovo";
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
  const [showDispensacaoModal, setShowDispensacaoModal] = useState(false);
  const [loadingDispensacao, setLoadingDispensacao] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openDispensacaoModal = () => {
    if (!receita) return;
    setShowDispensacaoModal(true);
  };

  const resetBusca = () => {
    setRegistroInput("");
    setReceita(null);
    setShowDispensacaoModal(false);
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

  const handleDispensarMedicamentos = async (
    medicamentos: MedicamentoPendente[],
    atendente: string,
  ) => {
    if (!receita) return;

    if (medicamentos.length === 0) {
      toast.error("Selecione ao menos um medicamento para dispensar");
      return;
    }

    if (!atendente.trim()) {
      toast.error("Informe o nome do atendente responsável pela dispensação");
      return;
    }

    setLoadingDispensacao(true);
    try {
      const payload = {
        receitaId: receita.id,
        atendente: atendente.trim(),
        medicamentos: medicamentos.map((med) => ({
          receitaMedicamentoId: med.receitaMedicamentoId,
          medicamentoFornecido: med.medicamentoFornecido,
          quantidadeDispensada: med.quantidadeDispensada,
          observacoes: med.observacoes,
        })),
      };

      const response = await api.post("/farmacia/dispensar-medicamentos", payload);
      
      // Atualizar o status dos medicamentos dispensados
      if (receita.itens) {
        const itensPendentesIds = new Set(
          medicamentos.map((m) => m.receitaMedicamentoId)
        );
        const itensAtualizados = receita.itens.map((item) =>
          itensPendentesIds.has(item.id)
            ? { ...item, status: "dispensado" }
            : item
        );
        setReceita({ ...receita, itens: itensAtualizados });
      }

      toast.success(`${medicamentos.length} medicamento(s) dispensado(s) com sucesso!`);
      setShowDispensacaoModal(false);
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
        toast.error("Erro ao dispensar medicamentos");
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
        <FarmaciaDispensacaoModalNovo
          receita={receita}
          onSubmit={handleDispensarMedicamentos}
          onCancel={() => setShowDispensacaoModal(false)}
          isLoading={loadingDispensacao}
          userName={user?.nome || "Farmácia"}
        />
      )}
    </div>
  );
};

export default FarmaciaDashboard;
