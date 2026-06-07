
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History } from "lucide-react";

interface PacienteHistoricoHospitalarTabProps {
  historicoHospitalar: any;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
  EmptyState: React.FC<{ icon: any; message: string }>;
}

export const PacienteHistoricoHospitalarTab: React.FC<
  PacienteHistoricoHospitalarTabProps
> = ({ historicoHospitalar, SectionHeader, EmptyState }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <SectionHeader icon={History} title="Histórico Hospitalar" />
        {historicoHospitalar && (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Solicitações", val: historicoHospitalar.resumo?.totalSolicitacoes, color: "sky" },
                { label: "Internações", val: historicoHospitalar.resumo?.totalInternacoes, color: "emerald" },
                { label: "Procedimentos", val: historicoHospitalar.resumo?.totalProcedimentos, color: "violet" },
                { label: "Medicações", val: historicoHospitalar.resumo?.totalMedicacoes, color: "amber" },
                { label: "Agendamentos", val: historicoHospitalar.resumo?.totalAgendamentos, color: "rose" },
              ].map(({ label, val, color }) => (
                <div key={label} className={`rounded-xl bg-${color}-50 border border--100 p-3 text-center`}>
                  <p className={`text-2xl font-bold text--600`}>{val || 0}</p>
                  <p className={`text-xs font-medium text--500 mt-0.5`}>{label}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            {historicoHospitalar.historico && historicoHospitalar.historico.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Linha do Tempo
                </p>
                {historicoHospitalar.historico.map((item: any) => (
                  <div key={`${item.tipo}-${item.id}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
                        <div className="h-2 w-2 rounded-full bg-teal-500" />
                      </div>
                      <div className="mt-1 w-px flex-1 bg-gray-100" />
                    </div>
                    <div className="flex-1 rounded-xl border border-gray-100 bg-slate-50 p-3 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold text-gray-800 capitalize">
                          {item.tipo === "solicitacao" && "Solicitação de Internação"}
                          {item.tipo === "internacao" && "Internação"}
                          {item.tipo === "procedimento" && "Procedimento"}
                          {item.tipo === "medicacao" && "Medicação"}
                          {item.tipo === "agendamento" && "Agendamento"}
                        </p>
                        <span className="text-xs text-gray-400">
                          {format(new Date(item.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.tipo === "solicitacao" && `${item.hospital?.nome} — ${item.motivo}`}
                        {item.tipo === "internacao" && `${item.hospital?.nome} — ${item.motivo}`}
                        {item.tipo === "procedimento" && `${item.hospital?.nome} — ${item.descricao}`}
                        {item.tipo === "medicacao" && `${item.nomeMedicacao} — ${item.dosagem || "Dosagem não informada"}`}
                        {item.tipo === "agendamento" && `${item.hospital?.nome} — ${item.tipo}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={History} message="Nenhum histórico hospitalar encontrado" />
            )}
          </>
        )}
      </div>
    </div>
  );
};
