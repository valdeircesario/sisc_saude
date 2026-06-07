
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pill } from "lucide-react";

interface PacienteMedicacoesTabProps {
  medicacoesSource: "paciente" | "administradas";
  setMedicacoesSource: (val: "paciente" | "administradas") => void;
  medicacoesPacienteLoading: boolean;
  medicacoesPaciente: any[];
  medicacoesAdministradasLoading: boolean;
  medicacoesAdministradas: any[];
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteMedicacoesTab: React.FC<PacienteMedicacoesTabProps> = ({
  medicacoesSource,
  setMedicacoesSource,
  medicacoesPacienteLoading,
  medicacoesPaciente,
  medicacoesAdministradasLoading,
  medicacoesAdministradas,
  SectionHeader,
  EmptyState,
}) => {
  return (
    <div className="max-w-7xl xl:max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader icon={Pill} title="Medicações" />
          <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
            {[
              { value: "paciente", label: "Paciente" },
              { value: "administradas", label: "Internação" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setMedicacoesSource(
                    option.value as "paciente" | "administradas"
                  )
                }
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  medicacoesSource === option.value
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {option.label}
                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-2 text-[11px] font-bold text-slate-600 shadow-sm">
                  {option.value === "paciente"
                    ? medicacoesPaciente?.length ?? 0
                    : medicacoesAdministradas?.length ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {medicacoesSource === "paciente" ? (
          <>
            {medicacoesPacienteLoading ? (
              <div className="flex flex-col items-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600 mb-3" />
                <p className="text-sm text-gray-400">
                  Carregando medicações do paciente...
                </p>
              </div>
            ) : medicacoesPaciente && medicacoesPaciente.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-sm bg-white">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Medicamento",
                        "Quantidade",
                        "Retirada",
                        "Fornecido por",
                        "UBS",
                        "Funcionário",
                        "Observações",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {medicacoesPaciente.map((m: any) => (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {m.medicamento?.nome || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{m.quantidade}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {format(new Date(m.dataRetirada), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.fornecidoPor || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{m.ubs?.nome || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.funcionario?.nome || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.observacoes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={Pill} message="Nenhuma medicação de paciente encontrada" />
            )}
          </>
        ) : (
          <>
            {medicacoesAdministradasLoading ? (
              <div className="flex flex-col items-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600 mb-3" />
                <p className="text-sm text-gray-400">
                  Carregando medicações administradas...
                </p>
              </div>
            ) : medicacoesAdministradas && medicacoesAdministradas.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100 text-sm bg-white">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Medicação",
                        "Data/Hora",
                        "Dosagem",
                        "Via",
                        "Administrado por",
                        "Hospital",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {medicacoesAdministradas.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {m.nomeMedicacao}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {format(
                            new Date(m.dataHoraAdministracao),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR }
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{m.dosagem || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.viaAdministracao || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.administradorNomeOuCrm || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {m.internacao?.hospital?.nome || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={Pill} message="Nenhuma medicação administrada encontrada" />
            )}
          </>
        )}
      </div>
    </div>
  );
};
