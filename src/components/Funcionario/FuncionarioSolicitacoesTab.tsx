import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2 } from "lucide-react";

interface SolicitacoesTabProps {
  solicitacoesFiltroPaciente: string;
  setSolicitacoesFiltroPaciente: (val: string) => void;
  solicitacoesFiltroTipo: string;
  setSolicitacoesFiltroTipo: (val: string) => void;
  pacientesSolicitacoes: any[];
  filteredSolicitacoes: any[];
  getStatusColor: (status: string) => string;
  getPrioridadeColor: (prioridade: string) => string;
}

const FuncionarioSolicitacoesTab: React.FC<SolicitacoesTabProps> = ({
  solicitacoesFiltroPaciente,
  setSolicitacoesFiltroPaciente,
  solicitacoesFiltroTipo,
  setSolicitacoesFiltroTipo,
  pacientesSolicitacoes,
  filteredSolicitacoes,
  getStatusColor,
  getPrioridadeColor,
}) => {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
            Minhas Solicitações
          </h2>
          <p className="text-sm text-[#8FA8C4] mt-0.5">
            Exames e internações solicitados por você.
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-5">
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
            Filtrar por paciente
          </label>
          <input
            value={solicitacoesFiltroPaciente}
            onChange={(e) => setSolicitacoesFiltroPaciente(e.target.value)}
            list="pacientes-solicitacoes"
            placeholder="Digite o nome do paciente"
            className="w-full px-3 py-2 text-sm text-[#1A2E4A] rounded-lg outline-none transition-all"
            style={{
              border: "1px solid #C8D9ED",
              background: "#F4F8FC",
            }}
          />
          <datalist id="pacientes-solicitacoes">
            {pacientesSolicitacoes.map((paciente: any) => (
              <option key={paciente.id} value={paciente.nome} />
            ))}
          </datalist>
        </div>
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
            Filtrar por tipo
          </label>
          <select
            value={solicitacoesFiltroTipo}
            onChange={(e) => setSolicitacoesFiltroTipo(e.target.value)}
            className="w-full px-3 py-2 text-sm text-[#1A2E4A] rounded-lg outline-none transition-all"
            style={{
              border: "1px solid #C8D9ED",
              background: "#F4F8FC",
            }}
          >
            <option value="todos">Todos os tipos</option>
            <option value="internacao">Internação</option>
            <option value="exame">Exame</option>
          </select>
        </div>
      </div>
      {filteredSolicitacoes && filteredSolicitacoes.length > 0 ? (
        <div className="space-y-3">
          {filteredSolicitacoes.map((solicitacao: any) => (
            <div
              key={`${solicitacao.solicitacaoTipo}-${solicitacao.id}`}
              className="rounded-xl p-4"
              style={{
                border: "1px solid #E4EDF7",
                borderLeft: `3px solid ${solicitacao.solicitacaoTipo === "internacao" ? "#8B1F1F" : "#1A3F72"}`,
                background: "#FAFCFF",
              }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                <div>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={
                      solicitacao.solicitacaoTipo === "internacao"
                        ? {
                            background: "#FEF0F0",
                            color: "#8B1F1F",
                            border: "1px solid #F0C0C0",
                          }
                        : {
                            background: "#EBF2FB",
                            color: "#1A3F72",
                            border: "1px solid #C0D6EE",
                          }
                    }
                  >
                    {solicitacao.solicitacaoTipo === "internacao"
                      ? "Solicitação de Internação"
                      : "Solicitação de Exame"}
                  </span>
                  <h3 className="text-base font-bold text-[#0F2242] mt-2">
                    {solicitacao.paciente?.nome || "Paciente não informado"}
                  </h3>
                  <p className="text-xs text-[#5C7A9B] mt-0.5">
                    {solicitacao.solicitacaoTipo === "internacao"
                      ? `Internação solicitada para ${solicitacao.tipo}`
                      : `Exame solicitado: ${solicitacao.tipoExame}`}
                  </p>
                  <p className="text-xs text-[#8FA8C4]">
                    Solicitado em:{" "}
                    {format(new Date(solicitacao.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(solicitacao.status)}`}
                  >
                    {solicitacao.status}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${solicitacao.solicitacaoTipo === "internacao" ? getPrioridadeColor(solicitacao.prioridade) : "text-[#1A3F72] bg-[#EBF2FB]"}`}
                  >
                    {solicitacao.solicitacaoTipo === "internacao"
                      ? solicitacao.prioridade
                      : "Exame"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                    Tipo
                  </p>
                  <p className="text-[#3A5B82] capitalize">
                    {solicitacao.solicitacaoTipo === "internacao"
                      ? "Internação"
                      : "Exame"}
                  </p>
                </div>
                <div>
                  <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                    Local
                  </p>
                  <p className="text-[#3A5B82]">
                    {solicitacao.solicitacaoTipo === "internacao"
                      ? solicitacao.hospital?.nome
                      : solicitacao.laboratorio?.nome}
                  </p>
                </div>
                {solicitacao.solicitacaoTipo === "internacao" && (
                  <>
                    <div>
                      <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                        Motivo
                      </p>
                      <p className="text-[#3A5B82]">{solicitacao.motivo}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                        Detalhes
                      </p>
                      <p className="text-[#3A5B82]">{solicitacao.detalhes}</p>
                    </div>
                  </>
                )}
                {solicitacao.solicitacaoTipo === "exame" && (
                  <div className="md:col-span-2">
                    <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                      Observações
                    </p>
                    <p className="text-[#3A5B82]">
                      {solicitacao.observacoes || "Nenhuma observação"}
                    </p>
                  </div>
                )}
                {solicitacao.solicitacaoTipo === "internacao" &&
                  solicitacao.dataAgendada && (
                    <div>
                      <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                        Data Agendada
                      </p>
                      <p className="text-[#3A5B82]">
                        {format(new Date(solicitacao.dataAgendada), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                        {solicitacao.horaAgendada &&
                          ` às ${solicitacao.horaAgendada}`}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
          <p className="text-sm text-[#8FA8C4]">Nenhuma solicitação encontrada.</p>
        </div>
      )}
    </div>
  );
};

export default FuncionarioSolicitacoesTab;
