import React, { useState, useEffect } from "react";
import {
  Package,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Pill,
  Activity
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalMedicamentosDispensados: number;
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
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  textColor,
  subtitle,
  trend,
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} rounded-bl-full opacity-20 -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div>
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
          {title}
        </p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
          {trend && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp size={12} /> {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs font-medium text-slate-400 mt-2">{subtitle}</p>
        )}
      </div>
      <div
        className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner`}
      >
        {React.cloneElement(icon as React.ReactElement, {
          size: 28,
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
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-100 border-t-red-500 rounded-full animate-spin shadow-sm" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Carregando painel de controle...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">Dados indisponíveis</h3>
        <p className="text-sm text-slate-500 mt-1">Não foi possível carregar as estatísticas da sua farmácia no momento.</p>
        <button onClick={carregarEstatisticas} className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Activity size={20} className="text-red-500" /> Visão Geral do Seu Atendimento
        </h2>
      </div>

      {/* ── Grid de Estatísticas ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Receitas Dispensadas"
          value={stats.dispensacoesRegistradas}
          icon={<Package className="text-blue-600" />}
          bgColor="bg-blue-100/60"
          textColor="text-blue-600"
          subtitle="Total de registros no sistema"
        />

        <StatCard
          title="Medicamentos Entregues"
          value={stats.totalMedicamentosDispensados}
          icon={<Pill className="text-emerald-600" />}
          bgColor="bg-emerald-100/60"
          textColor="text-emerald-600"
          subtitle="Soma das quantidades dispensadas"
        />

        <StatCard
          title="Pacientes Atendidos"
          value={stats.pacientesAtendidos}
          icon={<Users className="text-purple-600" />}
          bgColor="bg-purple-100/60"
          textColor="text-purple-600"
          subtitle="Pacientes únicos que retiraram remédios"
        />

        <StatCard
          title="Dispensações Completas"
          value={stats.dispensacoesCompletas}
          icon={<CheckCircle2 className="text-teal-600" />}
          bgColor="bg-teal-100/60"
          textColor="text-teal-600"
          subtitle="Todas as medicações da receita foram entregues"
        />

        <StatCard
          title="Dispensações Parciais"
          value={stats.dispensacoesParciais}
          icon={<AlertCircle className="text-amber-600" />}
          bgColor="bg-amber-100/60"
          textColor="text-amber-600"
          subtitle="Faltaram itens ou quantidade na receita"
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
          icon={<TrendingUp className="text-rose-600" />}
          bgColor="bg-rose-100/60"
          textColor="text-rose-600"
          subtitle="Proporção de dispensações completas"
        />
      </div>

      {/* ── Última Dispensação ── */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Calendar size={20} className="text-red-500" /> Registro Mais Recente
        </h2>
      </div>

      {stats.ultimaDispensacao ? (
        <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12 relative z-10">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Users size={12} /> Paciente
              </p>
              <p className="text-lg font-bold text-slate-800">
                {stats.ultimaDispensacao.paciente}
              </p>
            </div>

            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Pill size={12} /> Medicamento
              </p>
              <p className="text-lg font-bold text-slate-800">
                {stats.ultimaDispensacao.medicamento}
              </p>
            </div>
            
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Package size={12} /> Quantidade Dispensada
              </p>
              <p className="text-lg font-bold text-slate-800">
                {stats.ultimaDispensacao.quantidadeDispensada}
              </p>
            </div>

            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar size={12} /> Data e Hora
              </p>
              <p className="text-lg font-bold text-slate-800">
                {formatarData(stats.ultimaDispensacao.data)}
              </p>
            </div>

            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Atendente Responsável
              </p>
              <p className="text-lg font-bold text-slate-800">
                {stats.ultimaDispensacao.atendente}
              </p>
            </div>

            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                <TrendingUp size={12} /> Status da Receita
              </p>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide mt-1 ${
                  stats.ultimaDispensacao.status === "completa"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    stats.ultimaDispensacao.status === "completa"
                      ? "bg-emerald-500 animate-pulse"
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
      ) : (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Package size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Ainda não há registros</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md">
            Sua farmácia ainda não realizou nenhuma dispensação no sistema. Quando realizar, os dados mais recentes aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
};

export default FarmaciaDashboardHome;
