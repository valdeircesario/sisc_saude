import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, Printer, Calendar, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { generateHistoricoMedicoPDF } from "../../utils/pdfGenerator";

interface PacienteHistoricoTabProps {
  historicoMedico: any[];
  perfil: any;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteHistoricoTab: React.FC<PacienteHistoricoTabProps> = ({
  historicoMedico,
  perfil,
  SectionHeader,
  EmptyState,
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader
            icon={Heart}
            title="Histórico Médico"
            color="rose"
          />
          {historicoMedico && historicoMedico.length > 0 && (
            <button
              onClick={() =>
                generateHistoricoMedicoPDF(historicoMedico, perfil)
              }
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 transition-all"
            >
              <Printer className="h-4 w-4" /> Imprimir PDF
            </button>
          )}
        </div>

        {historicoMedico && historicoMedico.length > 0 ? (
          <div className="space-y-4">
            {historicoMedico.map((item: any) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-150"
              >
                <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-5 py-4 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold leading-snug">
                        {item.diagnostico}
                      </p>
                      <p className="text-xs text-teal-200 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(item.dataConsulta),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-white">
                        {item.funcionario?.nome || "—"}
                      </p>
                      <p className="text-xs text-teal-200">
                        {item.funcionario?.funcao || "—"}
                      </p>
                      <p className="text-xs text-teal-300">
                        {item.funcionario?.ubs?.nome || "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.doenca && (
                    <div className="rounded-lg border border-rose-100 bg-white p-3">
                      <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Doença
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.doenca}
                      </p>
                    </div>
                  )}
                  {item.medicacao && (
                    <div className="rounded-lg border border-emerald-100 bg-white p-3">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Medicação
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.medicacao}
                      </p>
                    </div>
                  )}
                  {item.laudo && (
                    <div className="rounded-lg border border-sky-100 bg-white p-3 sm:col-span-2">
                      <p className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Laudo Médico
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.laudo}
                      </p>
                    </div>
                  )}
                  {item.observacoes && (
                    <div className="rounded-lg border border-amber-100 bg-white p-3 sm:col-span-2">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Observações
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            message="Nenhum histórico médico encontrado"
          />
        )}
      </div>
    </div>
  );
};
