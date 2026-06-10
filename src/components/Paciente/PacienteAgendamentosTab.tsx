import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Eye, Check } from "lucide-react";

interface PacienteAgendamentosTabProps {
  agendamentosHospitalares: any[];
  openDetalhesModal: (item: any) => void;
  openConfirmarModal: (item: any, tipo: "internacao" | "agendamento") => void;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  StatusBadge: React.FC<{ status: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteAgendamentosTab: React.FC<
  PacienteAgendamentosTabProps
> = ({
  agendamentosHospitalares,
  openDetalhesModal,
  openConfirmarModal,
  SectionHeader,
  StatusBadge,
  EmptyState,
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <SectionHeader icon={Calendar} title="Agendamentos Hospitalares" />
        {agendamentosHospitalares && agendamentosHospitalares.length > 0 ? (
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
                      {format(new Date(a.dataAgendamento), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}{" "}
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
                      onClick={() => openConfirmarModal(a, "agendamento")}
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
  );
};
