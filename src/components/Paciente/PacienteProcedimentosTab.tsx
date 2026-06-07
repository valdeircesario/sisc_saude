import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, Eye } from "lucide-react";

interface PacienteProcedimentosTabProps {
  procedimentosHospitalares: any[];
  openDetalhesModal: (item: any) => void;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  StatusBadge: React.FC<{ status: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteProcedimentosTab: React.FC<
  PacienteProcedimentosTabProps
> = ({
  procedimentosHospitalares,
  openDetalhesModal,
  SectionHeader,
  StatusBadge,
  EmptyState,
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <SectionHeader icon={Activity} title="Procedimentos Hospitalares" />
        {procedimentosHospitalares && procedimentosHospitalares.length > 0 ? (
          <div className="space-y-3">
            {procedimentosHospitalares.map((p: any) => (
              <div
                key={p.id}
                className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{p.tipo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(p.dataRealizacao), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}{" "}
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
  );
};
