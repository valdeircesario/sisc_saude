import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Stethoscope, Calendar, Eye, Clock } from "lucide-react";

interface PacienteConsultasTabProps {
  consultas: any[];
  consultasFiltradas: any[];
  filtroEspecialidade: string;
  setFiltroEspecialidade: (val: string) => void;
  especialidadesUnicas: string[];
  setShowConsultaModal: (val: boolean) => void;
  openDetalhesModal: (consulta: any) => void;
  setSelectedItem: (item: any) => void;
  setShowGerenciarRetornoModal: (val: boolean) => void;
  setFormRetorno: (val: any) => void;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  StatusBadge: React.FC<{ status: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteConsultasTab: React.FC<PacienteConsultasTabProps> = ({
  consultas,
  consultasFiltradas,
  filtroEspecialidade,
  setFiltroEspecialidade,
  especialidadesUnicas,
  setShowConsultaModal,
  openDetalhesModal,
  setSelectedItem,
  setShowGerenciarRetornoModal,
  setFormRetorno,
  SectionHeader,
  StatusBadge,
  EmptyState,
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader icon={Stethoscope} title="Minhas Consultas" />
          <button
            onClick={() => setShowConsultaModal(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 transition-all duration-150"
          >
            <Calendar className="h-4 w-4" /> Solicitar
          </button>
        </div>

        {/* Filtro de especialidade */}
        {consultas && consultas.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <label
              htmlFor="filtro-especialidade"
              className="text-sm font-semibold text-gray-600"
            >
              Filtrar por especialidade:
            </label>
            <select
              id="filtro-especialidade"
              value={filtroEspecialidade}
              onChange={(e) => setFiltroEspecialidade(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Todas as especialidades</option>
              {especialidadesUnicas.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
            {filtroEspecialidade && (
              <button
                onClick={() => setFiltroEspecialidade("")}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 underline"
              >
                Limpar filtro
              </button>
            )}
          </div>
        )}

        {consultasFiltradas && consultasFiltradas.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Especialidade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Unidade de Saúde
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {consultasFiltradas.map((consulta: any) => (
                  <tr
                    key={consulta.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {consulta.especialidade}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {consulta.dataAgendada
                          ? format(
                              new Date(consulta.dataAgendada),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR }
                            )
                          : "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {consulta.ubs?.nome || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={consulta.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {consulta.id?.startsWith("ret-") && (consulta.status === "agendado" || consulta.status === "agendada") && (
                          <button
                            onClick={() => {
                              setFormRetorno({
                                dataRetorno: consulta.dataAgendada ? new Date(consulta.dataAgendada).toISOString().slice(0, 16) : "",
                                observacao: consulta.observacao || ""
                              });
                              setSelectedItem(consulta);
                              setShowGerenciarRetornoModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            Gerenciar
                          </button>
                        )}
                        <button
                          onClick={() => openDetalhesModal(consulta)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-100 transition-colors border border-teal-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Visualizar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : consultas && consultas.length > 0 ? (
          <div className="rounded-xl border border-gray-100 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-gray-600">
              Nenhuma consulta encontrada com a especialidade{" "}
              <span className="font-bold text-gray-800">
                "{filtroEspecialidade}"
              </span>
            </p>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            message="Nenhuma consulta encontrada"
          />
        )}
      </div>
    </div>
  );
};
