import React from "react";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoricoTabProps {
  historicoBuscaResultado: any;
  setShowBuscaHistoricoModal: (show: boolean) => void;
  abrirDetalheHistorico: (registro: any) => void;
  selectedPaciente: any;
  setActiveTab: (tab: string) => void;
  historicoPaciente: any[];
}

const FuncionarioHistoricoTab: React.FC<HistoricoTabProps> = ({
  historicoBuscaResultado,
  setShowBuscaHistoricoModal,
  abrirDetalheHistorico,
  selectedPaciente,
  setActiveTab,
  historicoPaciente,
}) => {
  // Se veio do clique em um paciente específico na aba Pacientes
  if (selectedPaciente) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: "#fff",
          border: "1px solid #D9E4F0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
              Histórico Médico
            </h2>
            <p className="text-sm text-[#8FA8C4] mt-0.5">
              Paciente: {selectedPaciente.nome}
            </p>
          </div>
          <button
            onClick={() => setActiveTab("pacientes")}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              border: "1px solid #C8D9ED",
              color: "#5C7A9B",
              background: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#F0F4F8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            ← Voltar
          </button>
        </div>
        {historicoPaciente && historicoPaciente.length > 0 ? (
          <div className="space-y-3">
            {historicoPaciente.map((item: any) => (
              <div
                key={item.id}
                className="rounded-xl p-4"
                style={{
                  border: "1px solid #E4EDF7",
                  borderLeft: "3px solid #1A3F72",
                  background: "#FAFCFF",
                }}
              >
                <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0F2242]">
                      {item.diagnostico}
                    </h3>
                    <p className="text-xs text-[#8FA8C4] mt-0.5">
                      {format(new Date(item.dataConsulta), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#0F2242]">
                      {item.funcionario.nome}
                    </p>
                    <p className="text-xs text-[#8FA8C4]">
                      {item.funcionario.funcao}
                    </p>
                    {item.funcionario.crm && (
                      <p className="text-xs text-[#8FA8C4]">
                        CRM: {item.funcionario.crm}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                      Laudo
                    </p>
                    <p className="text-[#3A5B82]">{item.laudo}</p>
                  </div>
                  {item.doenca && (
                    <div>
                      <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                        Doença
                      </p>
                      <p className="text-[#3A5B82]">{item.doenca}</p>
                    </div>
                  )}
                  {item.medicacao && (
                    <div>
                      <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                        Medicação
                      </p>
                      <p className="text-[#3A5B82]">{item.medicacao}</p>
                    </div>
                  )}
                  {item.observacoes && (
                    <div>
                      <p className="font-bold uppercase tracking-[0.06em] text-[#8FA8C4] mb-0.5">
                        Observações
                      </p>
                      <p className="text-[#3A5B82]">{item.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
            <p className="text-sm text-[#8FA8C4]">
              Nenhum histórico médico encontrado para este paciente.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Visualização de Busca Geral (CPF)
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[#0F2242] tracking-tight">
            Histórico Médico
          </h2>
          <p className="text-sm text-[#8FA8C4] mt-0.5">
            Busque o paciente por CPF para visualizar todo o histórico médico em
            ordem cronológica.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowBuscaHistoricoModal(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all"
          style={{ background: "#1A3F72" }}
        >
          Buscar por CPF
        </button>
      </div>

      {historicoBuscaResultado?.paciente && (
        <div className="mb-5 rounded-xl border border-[#D9E4F0] bg-[#F7FAFE] p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-[#8FA8C4]">
            Paciente localizado
          </p>
          <h3 className="text-lg font-semibold text-[#0F2242] mt-1">
            {historicoBuscaResultado.paciente.nome}
          </h3>
          <p className="text-sm text-[#5C7A9B]">
            CPF: {historicoBuscaResultado.paciente.cpf} • CNS:{" "}
            {historicoBuscaResultado.paciente.cns || "—"}
          </p>
        </div>
      )}

      {historicoBuscaResultado?.registros?.length ? (
        <div className="space-y-3">
          {historicoBuscaResultado.registros.map((registro: any) => (
            <article
              key={`${registro.tipo}-${registro.id}`}
              className="rounded-xl border border-[#E4EDF7] bg-[#FAFCFF] p-4"
              style={{ borderLeft: "4px solid #1A3F72" }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="rounded-full bg-[#EBF2FB] px-2.5 py-0.5 text-[11px] font-semibold text-[#1A3F72]">
                      {registro.categoria}
                    </span>
                    <span className="text-xs text-[#8FA8C4]">
                      {format(new Date(registro.dataRegistro), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F2242]">
                    {registro.titulo}
                  </h3>
                  <p className="text-sm text-[#3A5B82] mt-1">
                    {registro.resumo}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => abrirDetalheHistorico(registro)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition-all"
                  style={{ background: "#145C35" }}
                >
                  Visualizar
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#C8D9ED] bg-[#F7FAFE] p-8 text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-[#C8D9ED]" />
          <p className="text-sm text-[#5C7A9B]">
            Clique em “Buscar por CPF” para carregar todo o histórico do
            paciente em uma linha do tempo.
          </p>
        </div>
      )}
    </div>
  );
};

export default FuncionarioHistoricoTab;
