import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Search, MapPin, Download } from "lucide-react";
import { downloadExamePDF } from "../../utils/downloadFile";

interface PacienteExamesTabProps {
  examesSource: "realizados" | "solicitados";
  setExamesSource: (val: "realizados" | "solicitados") => void;
  filteredExamesRealizados: any[];
  filteredExamesSolicitados: any[];
  exameSearch: string;
  setExameSearch: (val: string) => void;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  StatusBadge: React.FC<{ status: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteExamesTab: React.FC<PacienteExamesTabProps> = ({
  examesSource,
  setExamesSource,
  filteredExamesRealizados,
  filteredExamesSolicitados,
  exameSearch,
  setExameSearch,
  SectionHeader,
  StatusBadge,
  EmptyState,
}) => {
  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader icon={FileText} title="Meus Exames" color="emerald" />
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
            {[
              { value: "realizados", label: "Exames" },
              { value: "solicitados", label: "Solicitações" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setExamesSource(option.value as "realizados" | "solicitados")
                }
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  examesSource === option.value
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {option.label}
                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-2 text-[11px] font-bold text-slate-600 shadow-sm">
                  {option.value === "realizados"
                    ? filteredExamesRealizados.length
                    : filteredExamesSolicitados.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={exameSearch ?? ""}
              onChange={(e) => setExameSearch(e.target.value)}
              placeholder="Buscar por nome do exame..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {examesSource === "realizados" ? (
          filteredExamesRealizados.length > 0 ? (
            <div className="space-y-3">
              {filteredExamesRealizados.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {item.tipo || "Exame"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{" "}
                        {item.laboratorio?.nome || "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Exame agendado
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    {item.dataAgendada && (
                      <div className="rounded-lg bg-white border border-gray-100 p-2.5">
                        <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                          Agendado
                        </p>
                        <p className="text-gray-700">
                          {format(
                            new Date(item.dataAgendada),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                    )}
                    {item.dataRealizado && (
                      <div className="rounded-lg bg-white border border-gray-100 p-2.5">
                        <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                          Realizado
                        </p>
                        <p className="text-gray-700">
                          {format(new Date(item.dataRealizado), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {item.observacoes && (
                    <div className="rounded-lg bg-white border border-gray-100 p-3 text-xs mb-3">
                      <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Observações
                      </p>
                      <p className="text-gray-700">{item.observacoes}</p>
                    </div>
                  )}

                  {item.resultado && (
                    <div className="rounded-lg bg-white border border-gray-100 p-3 text-xs mb-3">
                      <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                        Resultado
                      </p>
                      <p className="text-gray-700">{item.resultado}</p>
                    </div>
                  )}

                  {item.arquivoPdf && (
                    <button
                      onClick={() => downloadExamePDF(item.arquivoPdf)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" /> Baixar Laudo
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} message="Nenhum exame encontrado" />
          )
        ) : filteredExamesSolicitados.length > 0 ? (
          <div className="space-y-3">
            {filteredExamesSolicitados.map((item: any) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {item.tipoExame}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />{" "}
                      {item.laboratorio?.nome || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Solicitação de exame
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="text-xs text-gray-600 mb-3">
                  Solicitado em:{" "}
                  {item.createdAt
                    ? format(new Date(item.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })
                    : "—"}
                </div>

                {item.observacoes && (
                  <div className="rounded-lg bg-white border border-gray-100 p-3 text-xs mb-3">
                    <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Observações
                    </p>
                    <p className="text-gray-700">{item.observacoes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            message="Nenhuma solicitação de exame encontrada"
          />
        )}
      </div>
    </div>
  );
};
