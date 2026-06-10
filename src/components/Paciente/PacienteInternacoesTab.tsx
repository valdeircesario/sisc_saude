import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, Eye, Check } from "lucide-react";

interface PacienteInternacoesTabProps {
  internacoesFilter: "all" | "solicitacoes" | "internacoes";
  setInternacoesFilter: (val: "all" | "solicitacoes" | "internacoes") => void;
  perfil: any;
  filteredSolicitacoesInternacao: any[];
  filteredInternacoes: any[];
  openDetalhesModal: (item: any) => void;
  openConfirmarModal: (item: any, tipo: "internacao" | "agendamento") => void;
  getPrioridadeColor: (prioridade: string) => string;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  StatusBadge: React.FC<{ status: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteInternacoesTab: React.FC<PacienteInternacoesTabProps> = ({
  internacoesFilter,
  setInternacoesFilter,
  perfil,
  filteredSolicitacoesInternacao,
  filteredInternacoes,
  openDetalhesModal,
  openConfirmarModal,
  getPrioridadeColor,
  SectionHeader,
  StatusBadge,
  EmptyState,
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <SectionHeader icon={Building2} title="Internações" />
          <p className="text-sm text-gray-500">
            Filtre entre solicitações de internação e internações já registradas
            para o paciente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="internacoesFilter"
            className="text-sm font-semibold text-gray-600"
          >
            Mostrar
          </label>
          <select
            id="internacoesFilter"
            value={internacoesFilter}
            onChange={(e) =>
              setInternacoesFilter(
                e.target.value as "all" | "solicitacoes" | "internacoes",
              )
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-sky-500 focus:outline-none"
          >
            <option value="all">Todas</option>
            <option value="solicitacoes">Solicitações</option>
            <option value="internacoes">Internações</option>
          </select>
        </div>
      </div>

      {perfil && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Paciente
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {perfil.nome}
              </p>
              <p className="text-sm text-slate-600">{perfil.email}</p>
            </div>
            <div className="grid gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Documento
              </p>
              <p className="text-sm text-slate-700">CPF: {perfil.cpf}</p>
              <p className="text-sm text-slate-700">CNS: {perfil.cns}</p>
            </div>
            <div className="grid gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Contato
              </p>
              <p className="text-sm text-slate-700">
                Telefone: {perfil.telefone}
              </p>
              <p className="text-sm text-slate-700">
                Endereço: {perfil.endereco}
              </p>
            </div>
          </div>
        </div>
      )}

      {internacoesFilter !== "internacoes" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={Building2} title="Solicitações de Internação" />
          {filteredSolicitacoesInternacao &&
          filteredSolicitacoesInternacao.length > 0 ? (
            <div className="space-y-3">
              {filteredSolicitacoesInternacao.map((s: any) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {s.hospital?.nome || "—"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(s.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <StatusBadge status={s.status} />
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPrioridadeColor(s.prioridade)}`}
                      >
                        {s.prioridade}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                    {[
                      ["Tipo", s.tipo],
                      ["Motivo", s.motivo],
                      ["Médico", s.funcionario?.nome || "—"],
                      ["UBS", s.ubs?.nome || "—"],
                    ].map(([l, v]) => (
                      <div
                        key={l}
                        className="rounded-lg bg-white border border-gray-100 p-2.5"
                      >
                        <p className="font-bold text-gray-400 uppercase tracking-wide mb-1">
                          {l}
                        </p>
                        <p className="text-gray-700 font-medium">
                          {v as string}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetalhesModal(s)}
                      className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              message="Nenhuma solicitação encontrada"
            />
          )}
        </div>
      )}

      {internacoesFilter !== "solicitacoes" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader icon={Building2} title="Internações Realizadas" />
          {filteredInternacoes && filteredInternacoes.length > 0 ? (
            <div className="space-y-3">
              {filteredInternacoes.map((i: any) => (
                <div
                  key={i.id}
                  className="rounded-xl border border-gray-100 bg-slate-50 p-4 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {i.hospital?.nome || "—"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Entrada:{" "}
                        {format(new Date(i.dataEntrada), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              message="Nenhuma internação encontrada"
            />
          )}
        </div>
      )}
    </div>
  );
};
