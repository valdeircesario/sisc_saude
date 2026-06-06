import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Shield, Printer } from "lucide-react";

interface PacienteVacinasTabProps {
  vacinas: any[];
  perfil: any;
  generateVacinasPDF: (vacinas: any[], perfil: any) => void;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteVacinasTab: React.FC<PacienteVacinasTabProps> = ({
  vacinas,
  perfil,
  generateVacinasPDF,
  SectionHeader,
  EmptyState,
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader
            icon={Shield}
            title="Cartão de Vacinas"
            color="violet"
          />
          {vacinas && vacinas.length > 0 && (
            <button
              onClick={() => generateVacinasPDF(vacinas, perfil)}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 transition-all"
            >
              <Printer className="h-4 w-4" /> Imprimir PDF
            </button>
          )}
        </div>
        {vacinas && vacinas.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100 text-sm bg-white">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Vacina",
                    "Aplicado por",
                    "Data",
                    "Lote",
                    "Próxima Dose",
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
                {vacinas.map((vacina: any) => (
                  <tr
                    key={vacina.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {vacina.nome}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {vacina.funcionario
                        ? `CRM: ${vacina.funcionario.crm || "N/A"}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(vacina.dataApl), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {vacina.lote}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {vacina.proximaDose
                        ? format(
                            new Date(vacina.proximaDose),
                            "dd/MM/yyyy",
                            { locale: ptBR }
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Shield} message="Nenhuma vacina registrada" />
        )}
      </div>
    </div>
  );
};
