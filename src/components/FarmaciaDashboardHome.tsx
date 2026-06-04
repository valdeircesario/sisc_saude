import React, { useState, useEffect } from "react";
import {
  Package,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Pill,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  receitasDisponiveis: number;
  dispensacoesRegistradas: number;
  pacientesAtendidos: number;
  dispensacoesCompletas: number;
  dispensacoesParciais: number;
  ultimaDispensacao: {
    data: string;
    paciente: string;
    medicamento: string;
    status: "completa" | "parcial";
    atendente: string;
    quantidadeDispensada: number;
  } | null;
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

// ─── Stat Card Component ──────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  textColor,
  subtitle,
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04] hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-gray-400 mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {subtitle && (
          <p className="text-[0.75rem] text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div
        className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}
      >
        {React.cloneElement(icon as React.ReactElement, {
          size: 24,
          className: textColor,
        })}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FarmaciaDashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setCarregando(true);
      const response = await api.get<DashboardStats>(
        "/farmacia/dashboard/estatisticas",
      );
      setStats(response.data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Erro ao carregar dados do dashboard
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Grid de Estatísticas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Receitas Disponíveis"
          value={stats.receitasDisponiveis}
          icon={<Pill className="text-red-400" />}
          bgColor="bg-red-100"
          textColor="text-red-400"
          subtitle="Aguardando dispensação"
        />

        <StatCard
          title="Dispensações Registradas"
          value={stats.dispensacoesRegistradas}
          icon={<Package className="text-emerald-600" />}
          bgColor="bg-emerald-100"
          textColor="text-emerald-600"
          subtitle="Total de dispensações"
        />

        <StatCard
          title="Pacientes Atendidos"
          value={stats.pacientesAtendidos}
          icon={<Users className="text-red-600" />}
          bgColor="bg-blue-100"
          textColor="text-blue-600"
          subtitle="Pacientes únicos"
        />

        <StatCard
          title="Dispensações Completas"
          value={stats.dispensacoesCompletas}
          icon={<CheckCircle2 className="text-green-600" />}
          bgColor="bg-green-100"
          textColor="text-green-600"
          subtitle="Medicamentos entregues na íntegra"
        />

        <StatCard
          title="Dispensações Parciais"
          value={stats.dispensacoesParciais}
          icon={<AlertCircle className="text-amber-600" />}
          bgColor="bg-amber-100"
          textColor="text-amber-600"
          subtitle="Medicamentos parcialmente entregues"
        />

        <StatCard
          title="Taxa de Conclusão"
          value={
            stats.dispensacoesRegistradas > 0
              ? (
                  (stats.dispensacoesCompletas /
                    stats.dispensacoesRegistradas) *
                  100
                ).toFixed(1) + "%"
              : "0%"
          }
          icon={<TrendingUp className="text-purple-600" />}
          bgColor="bg-purple-100"
          textColor="text-purple-600"
          subtitle="Dispensações completas"
        />
      </div>

      {/* ── Última Dispensação ── */}
      {stats.ultimaDispensacao && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <h3
              className="text-xl font-semibold text-indigo-950"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Última Dispensação Registrada
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Paciente
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.ultimaDispensacao.paciente}
              </p>
            </div>

            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Medicamento
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.ultimaDispensacao.medicamento}
              </p>
            </div>
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Quantidade Dispensada
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.ultimaDispensacao.quantidadeDispensada}
              </p>
            </div>

            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Data e Hora
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {formatarData(stats.ultimaDispensacao.data)}
              </p>
            </div>

            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Atendente
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.ultimaDispensacao.atendente}
              </p>
            </div>

            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Status
              </p>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  stats.ultimaDispensacao.status === "completa"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : "bg-amber-100 text-amber-700 border border-amber-300"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    stats.ultimaDispensacao.status === "completa"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                {stats.ultimaDispensacao.status === "completa"
                  ? "Completa"
                  : "Parcial"}
              </span>
            </div>
          </div>
        </div>
      )}

      {!stats.ultimaDispensacao && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04] text-center">
          <Package size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            Nenhuma dispensação registrada ainda
          </p>
        </div>
      )}
    </div>
  );
};

export default FarmaciaDashboardHome;
