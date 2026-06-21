import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  User,
  Building2,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dispensacao {
  id: string;
  dataDispensacao: string;
  statusDispensacao: "completa" | "parcial";
  medicamentoFornecido: string | null;
  atendente?: string | null;
  farmaciaResponsavel: string | null;
  observacoesDispensacao: string | null;
  farmacia: string | null;
  quantidadeDispensada: string;
}

interface DispensacaoAgrupada {
  receitaId: string;
  registroAssinatura: string | null;
  paciente: string;
  medico: string;
  ubs: string;
  dataPrimeiraDispensacao: string;
  totalDispensacoes: number;
  dispensacoes: Dispensacao[];
}

interface DispensacoesListaResponse {
  total: number;
  dispensacoes: DispensacaoAgrupada[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatarData = (data: string) =>
  new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusClasses = {
  completa: "bg-emerald-100 text-emerald-800 border-emerald-300",
  parcial: "bg-amber-100 text-amber-800 border-amber-300",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ColProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}
const Col: React.FC<ColProps> = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1 text-[0.63rem] font-semibold uppercase tracking-widest text-gray-400 mb-1">
      {icon}
      {label}
    </div>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

interface DetailItemProps {
  disp: Dispensacao;
  index: number;
}
const DetailItem: React.FC<DetailItemProps> = ({ disp, index }) => (
  <div className="p-3 bg-gray-50 rounded-xl border-l-4 border-red-40 mb-2 last:mb-0">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-semibold text-gray-800">
        Dispensação {index + 1}
      </span>
      <span
        className={`px-2.5 py-0.5 rounded-full text-[0.67rem] font-semibold uppercase border ${
          statusClasses[disp.statusDispensacao]
        }`}
      >
        {disp.statusDispensacao === "completa" ? "✓ Completa" : "⚠ Parcial"}
      </span>
    </div>
    <div className="text-xs text-gray-500 space-y-0.5 leading-relaxed">
      <div>
        <strong>Data:</strong> {formatarData(disp.dataDispensacao)}
      </div>
      {disp.medicamentoFornecido && (
        <div>
          <strong>Medicamento:</strong> {disp.medicamentoFornecido}
        </div>
      )}
      {disp.quantidadeDispensada && (
        <div>
          <strong>Quantidade:</strong> {disp.quantidadeDispensada}
        </div>
      )}
      {disp.atendente ? (
        <div>
          <strong>Atendente:</strong> {disp.atendente}
        </div>
      ) : disp.farmaciaResponsavel ? (
        <div>
          <strong>Atendente:</strong> {disp.farmaciaResponsavel}
        </div>
      ) : null}
      {disp.observacoesDispensacao && (
        <div>
          <strong>Observações:</strong> {disp.observacoesDispensacao}
        </div>
      )}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DispensacoesLista: React.FC = () => {
  const [dispensacoes, setDispensacoes] = useState<DispensacaoAgrupada[]>([]);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDispensacoes();
  }, []);

  const carregarDispensacoes = async () => {
    try {
      setCarregando(true);
      const response = await api.get<DispensacoesListaResponse>(
        "/farmacia/dispensacoes/listar/todas",
      );
      setDispensacoes(response.data.dispensacoes);
    } catch (error) {
      console.error("Erro ao carregar dispensações:", error);
      toast.error("Erro ao carregar dispensações");
    } finally {
      setCarregando(false);
    }
  };

  const toggleExpandir = (receitaId: string) => {
    const novoExpandidos = new Set(expandidos);
    if (novoExpandidos.has(receitaId)) {
      novoExpandidos.delete(receitaId);
    } else {
      novoExpandidos.add(receitaId);
    }
    setExpandidos(novoExpandidos);
  };

  // ── Loading state ────────────────────────────────────────────────────────────

  if (carregando) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Carregando dispensações...
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────

  if (dispensacoes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
        <Package size={32} className="mx-auto text-gray-400" />
        <p className="mt-3 text-sm text-gray-500">
          Nenhuma dispensação registrada
        </p>
      </div>
    );
  }

  // ── List ─────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.04]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-between">
          <h2
            className="text-base font-semibold text-white"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Histórico de Dispensações
          </h2>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {dispensacoes.length} receitas
          </span>
        </div>

        {/* Rows */}
        {dispensacoes.map((item) => {
          const isExpanded = expandidos.has(item.receitaId);

          return (
            <div
              key={item.receitaId}
              className="px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              {/* Row main grid */}
              <div
                className="grid grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-4 items-center mb-2 cursor-pointer"
                onClick={() => toggleExpandir(item.receitaId)}
              >
                <Col
                  icon={<User size={12} />}
                  label="Paciente"
                  value={item.paciente}
                />
                <Col
                  icon={<User size={12} />}
                  label="Médico"
                  value={item.medico}
                />
                <Col
                  icon={<Building2 size={12} />}
                  label="UBS"
                  value={item.ubs}
                />
                <Col
                  icon={<Calendar size={12} />}
                  label="Data"
                  value={formatarData(item.dataPrimeiraDispensacao)}
                />

                <div className="bg-indigo-50 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg text-center min-w-[90px]">
                  {item.totalDispensacoes}{" "}
                  {item.totalDispensacoes === 1
                    ? "dispensação"
                    : "dispensações"}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandir(item.receitaId);
                  }}
                  title="Expandir detalhes"
                  className="p-1 text-red-40 hover:scale-110 transition-transform"
                >
                  {isExpanded ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 animate-[slideDown_0.3s_ease-out]">
                  {item.dispensacoes.map((disp, index) => (
                    <DetailItem key={disp.id} disp={disp} index={index} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DispensacoesLista;
