import React from "react";
import { Search, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConsultarReceitaTabProps {
  receitaEncontrada: any;
  handleBuscarReceita: (e: React.FormEvent) => void;
  registroReceitaBusca: string;
  setRegistroReceitaBusca: (val: string) => void;
  buscarReceitaLoading: boolean;
  carregandoReceita: boolean;
  handleLimparReceita: () => void;
  setShowDetalhesDispensacaoModal: (show: boolean) => void;
  handleValidarDispensacao: () => void;
  isDispensando: boolean;
  isValidando: boolean;
}

const FuncionarioConsultarReceitaTab: React.FC<ConsultarReceitaTabProps> = ({
  receitaEncontrada,
  handleBuscarReceita,
  registroReceitaBusca,
  setRegistroReceitaBusca,
  buscarReceitaLoading,
  carregandoReceita,
  handleLimparReceita,
  setShowDetalhesDispensacaoModal,
  handleValidarDispensacao,
  isDispensando,
  isValidando,
}) => {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "#fff",
        border: "1px solid #D9E4F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F2242] tracking-tight leading-tight">
            Consultar Receita
          </h2>
          <p className="text-xs text-[#8FA8C4] mt-0.5">
            Busque pelo número de registro de assinatura
          </p>
        </div>
      </div>

      {!receitaEncontrada ? (
        <form onSubmit={handleBuscarReceita} className="flex gap-2 max-w-lg">
          <input
            type="text"
            value={registroReceitaBusca}
            onChange={(e) => setRegistroReceitaBusca(e.target.value)}
            placeholder="Ex: REG-SISC1A2B3C-D4E5F6"
            className="flex-1 rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
            style={{
              border: "1px solid #C8D9ED",
              background: "#F4F8FC",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#1A3F72";
              e.target.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#C8D9ED";
              e.target.style.background = "#F4F8FC";
            }}
            required
          />
          <button
            type="submit"
            disabled={buscarReceitaLoading || carregandoReceita}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: "#1A3F72" }}
            onMouseEnter={(e) =>
              !buscarReceitaLoading &&
              (e.currentTarget.style.background = "#0F2A52")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1A3F72")}
          >
            <Search className="h-3.5 w-3.5" />
            Buscar
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Barra de status + registro + nova busca — tudo em uma linha */}
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2.5"
            style={{
              background: "#F0F6FF",
              border: "1px solid #D9E4F0",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background:
                    receitaEncontrada.status === "ativa"
                      ? "#D1F3E9"
                      : "#FEE4E2",
                  color:
                    receitaEncontrada.status === "ativa"
                      ? "#145C35"
                      : "#912F29",
                }}
              >
                {receitaEncontrada.status
                  ? receitaEncontrada.status.charAt(0).toUpperCase() +
                    receitaEncontrada.status.slice(1)
                  : "N/A"}
              </span>
              <span className="text-xs text-[#8FA8C4]">
                Reg.:&nbsp;
                <span className="font-mono font-semibold text-[#0F2242]">
                  {receitaEncontrada.registroAssinatura || "N/A"}
                </span>
              </span>
            </div>
            <button
              onClick={handleLimparReceita}
              className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
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
              Nova busca
            </button>
          </div>

          {/* Paciente + Médico/UBS lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Paciente */}
            <div
              className="rounded-lg p-3 space-y-2.5"
              style={{
                background: "#F8FAFD",
                border: "1px solid #E4EDF7",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4]">
                Paciente
              </p>
              <p className="text-sm font-semibold text-[#0F2242] leading-tight">
                {receitaEncontrada.paciente?.nome || "N/A"}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  {
                    label: "CPF",
                    value: receitaEncontrada.paciente?.cpf,
                  },
                  {
                    label: "CNS",
                    value: receitaEncontrada.paciente?.cns,
                  },
                  {
                    label: "Nascimento",
                    value: receitaEncontrada.paciente?.nascimento
                      ? format(
                          new Date(receitaEncontrada.paciente.nascimento),
                          "dd/MM/yyyy",
                          { locale: ptBR },
                        )
                      : null,
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4]">
                      {label}
                    </p>
                    <p className="text-xs font-semibold text-[#0F2242]">
                      {value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Médico / UBS */}
            <div
              className="rounded-lg p-3 space-y-2.5"
              style={{
                background: "#F8FAFD",
                border: "1px solid #E4EDF7",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4]">
                Médico / UBS
              </p>
              <p className="text-sm font-semibold text-[#0F2242] leading-tight">
                {receitaEncontrada.funcionario?.nome || "N/A"}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4]">
                    CRM
                  </p>
                  <p className="text-xs font-semibold text-[#0F2242]">
                    {receitaEncontrada.funcionario?.crm || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4]">
                    UBS
                  </p>
                  <p className="text-xs font-semibold text-[#0F2242]">
                    {receitaEncontrada.ubs?.nome || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Observações gerais (se houver) */}
          {receitaEncontrada.observacoes && (
            <div
              className="rounded-lg px-3 py-2.5"
              style={{
                background: "#F8FAFD",
                border: "1px solid #E4EDF7",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                Observações
              </p>
              <p className="text-xs text-[#1A2E4A]">
                {receitaEncontrada.observacoes}
              </p>
            </div>
          )}

          {/* Medicamentos */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0F2242] mb-2">
              Medicamentos da Receita
            </p>

            {receitaEncontrada.itens && receitaEncontrada.itens.length > 0 ? (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid #E4EDF7" }}
              >
                {/* Cabeçalho da tabela */}
                <div
                  className="grid gap-2 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4]"
                  style={{
                    gridTemplateColumns: "2fr 1fr 1fr 1.5fr auto",
                    background: "#F8FAFD",
                    borderBottom: "1px solid #E4EDF7",
                  }}
                >
                  <span>Medicamento</span>
                  <span>Dosagem</span>
                  <span>Qtd.</span>
                  <span>Posologia</span>
                  <span>Status</span>
                </div>

                <div className="divide-y" style={{ borderColor: "#E4EDF7" }}>
                  {receitaEncontrada.itens.map((item: any, idx: number) => {
                    const foiDispensado =
                      receitaEncontrada.dispensacoes?.some(
                        (d: any) => d.medicamentoFornecido === item.medicamento,
                      ) || false;

                    return (
                      <div key={idx}>
                        <div
                          className="grid gap-2 items-center px-3 py-2.5 bg-white"
                          style={{
                            gridTemplateColumns: "2fr 1fr 1fr 1.5fr auto",
                          }}
                        >
                          <p className="text-xs font-semibold text-[#0F2242] leading-tight">
                            {item.medicamento || "N/A"}
                          </p>
                          <p className="text-xs text-[#3A5B82]">{item.dosagem || "—"}</p>
                          <p className="text-xs text-[#3A5B82]">{item.quantidade || "—"}</p>
                          <p className="text-xs text-[#3A5B82] leading-tight">
                            {item.posologia || "—"}
                          </p>
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                            style={{
                              background: foiDispensado ? "#D1F3E9" : "#FEE4E2",
                              color: foiDispensado ? "#145C35" : "#912F29",
                            }}
                          >
                            {foiDispensado ? "✓ Dispensado" : "⧖ Pendente"}
                          </span>
                        </div>

                        {/* Observações do item (linha expandida, se houver) */}
                        {item.observacoes && (
                          <div
                            className="px-3 pb-2 -mt-1"
                            style={{ background: "#FAFCFF" }}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4]">
                              Obs.:{" "}
                            </span>
                            <span className="text-[10px] text-[#5C7A9B]">
                              {item.observacoes}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8FA8C4] py-3 text-center">
                Nenhum medicamento encontrado.
              </p>
            )}
          </div>

          {/* Histórico de Dispensações */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0F2242] mb-2">
              Histórico de Dispensações
            </p>

            {receitaEncontrada.dispensacoes &&
            receitaEncontrada.dispensacoes.length > 0 ? (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid #E4EDF7" }}
              >
                <div
                  className="grid gap-2 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4]"
                  style={{
                    gridTemplateColumns: "1.5fr 1.2fr 0.8fr 0.9fr 0.8fr",
                    background: "#F8FAFD",
                    borderBottom: "1px solid #E4EDF7",
                  }}
                >
                  <span>Farmácia</span>
                  <span>Medicamento</span>
                  <span>Qtd.</span>
                  <span>Status</span>
                  <span>Data</span>
                </div>

                <div className="divide-y" style={{ borderColor: "#E4EDF7" }}>
                  {receitaEncontrada.dispensacoes.map(
                    (dispensacao: any, idx: number) => (
                      <div
                        key={idx}
                        className="grid gap-2 items-center px-3 py-2 bg-white"
                        style={{
                          gridTemplateColumns: "1.5fr 1.2fr 0.8fr 0.9fr 0.8fr",
                        }}
                      >
                        <p className="text-xs font-semibold text-[#0F2242] truncate">
                          {dispensacao.farmaciaResponsavel ||
                            dispensacao.farmacia?.nome ||
                            "N/A"}
                        </p>
                        <p className="text-xs text-[#3A5B82] truncate">
                          {dispensacao.medicamentoFornecido ||
                            receitaEncontrada.medicamento ||
                            "N/A"}
                        </p>
                        <p className="text-xs text-[#3A5B82]">
                          {dispensacao.quantidadeDispensada || "—"}
                        </p>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            background:
                              dispensacao.statusDispensacao === "completa"
                                ? "#D1F3E9"
                                : "#FFF3CD",
                            color:
                              dispensacao.statusDispensacao === "completa"
                                ? "#145C35"
                                : "#856404",
                          }}
                        >
                          {dispensacao.statusDispensacao || "N/A"}
                        </span>
                        <p className="text-[10px] text-[#8FA8C4]">
                          {dispensacao.dataDispensacao
                            ? format(
                                new Date(dispensacao.dataDispensacao),
                                "dd/MM/yy",
                                { locale: ptBR },
                              )
                            : dispensacao.createdAt
                              ? format(
                                  new Date(dispensacao.createdAt),
                                  "dd/MM/yy",
                                  { locale: ptBR },
                                )
                              : "N/A"}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 py-3 px-3 rounded-lg"
                style={{
                  background: "#F8FAFD",
                  border: "1px solid #E4EDF7",
                }}
              >
                <Package className="h-4 w-4 text-[#C8D9ED] shrink-0" />
                <p className="text-xs text-[#8FA8C4]">
                  Nenhuma dispensação registrada para esta receita.
                </p>
              </div>
            )}
          </div>

          {/* Ação */}
          <div className="flex justify-end pt-1">
            {receitaEncontrada.itens &&
            receitaEncontrada.itens.filter((m: any) => m.status === "dispensado")
              .length === receitaEncontrada.itens.length ? (
              // Todos os medicamentos foram dispensados
              <button
                onClick={() => setShowDetalhesDispensacaoModal(true)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2"
                style={{ background: "#1A3F72" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0F2242")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1A3F72")}
              >
                <Package className="h-3.5 w-3.5" />
                Ver Detalhes das Dispensações
              </button>
            ) : receitaEncontrada.itens &&
              receitaEncontrada.itens.filter((m: any) => m.status === "pendente")
                .length > 0 ? (
              // Existem medicamentos pendentes
              <button
                onClick={handleValidarDispensacao}
                disabled={isDispensando || isValidando}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-2"
                style={{ background: "#00A651" }}
                onMouseEnter={(e) =>
                  !isDispensando && (e.currentTarget.style.background = "#007A3F")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "#00A651")}
              >
                <Package className="h-3.5 w-3.5" />
                Dispensar Receita
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncionarioConsultarReceitaTab;
