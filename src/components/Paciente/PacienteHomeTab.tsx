import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Shield, FileText, Users, MapPin } from "lucide-react";

interface PacienteHomeTabProps {
  user: any;
  campanhas: any[];
  setShowConsultaModal: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  handleInscreverCampanha: (id: string, titulo?: string) => void;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteHomeTab: React.FC<PacienteHomeTabProps> = ({
  user,
  campanhas,
  setShowConsultaModal,
  setActiveTab,
  handleInscreverCampanha,
  EmptyState,
}) => {
  return (
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
          <p className="text-sm text-white/70 mb-6">Como está sua saúde hoje?</p>
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
                <p className="text-xs font-semibold text-white">{label}</p>
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
                <p className={`text-sm font-bold text-${color}-900`}>{label}</p>
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
                      {format(new Date(campanha.dataIni), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
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
                        handleInscreverCampanha(campanha.id, campanha.titulo)
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
  );
};
