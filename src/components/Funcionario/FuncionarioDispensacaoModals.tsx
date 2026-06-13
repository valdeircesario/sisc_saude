import React from "react";
import { X, Package } from "lucide-react";

interface DispensacaoModalsProps {
  showDispensacaoModal: boolean;
  setShowDispensacaoModal: (show: boolean) => void;
  receitaEncontrada: any;
  user: any;
  erroDispensacao: any;
  medicamentosSelecionados: Record<string, any>;
  setMedicamentosSelecionados: (val: Record<string, any>) => void;
  handleDispensarMedicamentos: () => void;
  isDispensandoMedicamentos: boolean;
  showDetalhesDispensacaoModal: boolean;
  setShowDetalhesDispensacaoModal: (show: boolean) => void;
}

const FuncionarioDispensacaoModals: React.FC<DispensacaoModalsProps> = ({
  showDispensacaoModal,
  setShowDispensacaoModal,
  receitaEncontrada,
  user,
  erroDispensacao,
  medicamentosSelecionados,
  setMedicamentosSelecionados,
  handleDispensarMedicamentos,
  isDispensandoMedicamentos,
  showDetalhesDispensacaoModal,
  setShowDetalhesDispensacaoModal,
}) => {
  return (
    <>
      {/* Modal de Dispensação de Receita */}
      {showDispensacaoModal && receitaEncontrada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(10,25,47,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
            style={{
              border: "1px solid #D9E4F0",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            {/* Header */}
            <div
              className="border-b px-6 py-4"
              style={{ borderColor: "#E4EDF7", background: "#F8FAFD" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2242]">
                    Dispensar Medicamentos da Receita
                  </h3>
                  <p className="text-xs text-[#8FA8C4] mt-1">
                    Paciente: {receitaEncontrada.paciente?.nome || "N/A"} •
                    Registro: {receitaEncontrada.registroAssinatura || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDispensacaoModal(false);
                    setMedicamentosSelecionados({});
                  }}
                  className="rounded-lg p-2 text-[#8FA8C4] hover:bg-[#E4EDF7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto space-y-4">
              {erroDispensacao && (
                <div
                  className="rounded-lg border-l-4 p-4"
                  style={{
                    borderColor: "#DC2626",
                    background: "#FEE2E2",
                  }}
                >
                  <p className="text-sm font-semibold text-[#991B1B]">
                    {erroDispensacao.message ||
                      "Erro ao dispensar medicamentos"}
                  </p>
                </div>
              )}

              {/* Informações da Farmácia (Responsável) */}
              <div
                className="rounded-lg p-4"
                style={{
                  background: "#F0F6FF",
                  border: "1px solid #D9E4F0",
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-2">
                  Responsável pela Dispensação
                </p>
                <p className="text-sm font-semibold text-[#0F2242]">
                  {user?.nome || "Funcionário não identificado"}
                </p>
                <p className="text-xs text-[#8FA8C4]">
                  {user?.funcao || "Função"}
                </p>
              </div>

              {/* Resumo de Status */}
              {receitaEncontrada.itens && receitaEncontrada.itens.length > 0 && (
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    background: "#F0F6FF",
                    borderColor: "#D9E4F0",
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-2">
                    Status da Dispensação
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#8FA8C4]">
                        Total de Medicamentos
                      </p>
                      <p className="text-lg font-bold text-[#0F2242]">
                        {receitaEncontrada.itens.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8FA8C4]">Pendentes</p>
                      <p className="text-lg font-bold text-[#F97316]">
                        {
                          receitaEncontrada.itens.filter(
                            (m: any) => m.status === "pendente",
                          ).length
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8FA8C4]">Dispensados</p>
                      <p className="text-lg font-bold text-[#00A651]">
                        {
                          receitaEncontrada.itens.filter(
                            (m: any) => m.status === "dispensado",
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Medicamentos para Dispensar */}
              <div>
                <h4 className="text-sm font-bold text-[#0F2242] mb-3">
                  Medicamentos Pendentes para Dispensar
                </h4>

                {receitaEncontrada.itens && receitaEncontrada.itens.length > 0 ? (
                  <>
                    {receitaEncontrada.itens.filter(
                      (m: any) => m.status === "dispensado",
                    ).length === receitaEncontrada.itens.length ? (
                      <div
                        className="rounded-lg border-l-4 p-4"
                        style={{
                          borderColor: "#00A651",
                          background: "#F0FDF4",
                        }}
                      >
                        <p className="text-sm font-semibold text-[#166534]">
                          ✓ Receita completamente dispensada! Todos os
                          medicamentos foram dispensados e esta receita não pode
                          mais receber dispensações.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {receitaEncontrada.itens
                          .filter((item: any) => item.status === "pendente")
                          .map((item: any) => {
                            const isSelected =
                              medicamentosSelecionados[item.id]?.selecionado ||
                              false;
                            const data = medicamentosSelecionados[item.id] || {
                              selecionado: false,
                              medicamentoFornecido: item.medicamento,
                              quantidadeDispensada: item.quantidade,
                              observacoes: "",
                            };

                            const canDispense = item.status === "pendente";

                            return (
                              <div
                                key={item.id}
                                className="rounded-lg border p-4 transition-all"
                                style={{
                                  background: isSelected ? "#F0F6FF" : "#F8FAFD",
                                  borderColor: isSelected ? "#B3D9F2" : "#E4EDF7",
                                }}
                              >
                                {/* Checkbox e Status */}
                                <div className="flex items-start gap-3 mb-3">
                                  <input
                                    type="checkbox"
                                    id={`med-${item.id}`}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (canDispense) {
                                        setMedicamentosSelecionados({
                                          ...medicamentosSelecionados,
                                          [item.id]: {
                                            ...data,
                                            selecionado: e.target.checked,
                                          },
                                        });
                                      }
                                    }}
                                    disabled={!canDispense}
                                    className="mt-1 h-4 w-4 cursor-pointer"
                                  />
                                  <div className="flex-1">
                                    <label
                                      htmlFor={`med-${item.id}`}
                                      className="text-sm font-semibold text-[#0F2242] cursor-pointer flex items-center gap-2"
                                    >
                                      {item.medicamento}
                                      {!canDispense && (
                                        <span
                                          className="px-2 py-0.5 rounded text-xs font-semibold"
                                          style={{
                                            background: "#D1F3E9",
                                            color: "#145C35",
                                          }}
                                        >
                                          Dispensado
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                </div>

                                {/* Campos editáveis quando selecionado */}
                                {isSelected && canDispense && (
                                  <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7 border-t pt-3"
                                    style={{ borderColor: "#E4EDF7" }}
                                  >
                                    <div>
                                      <label className="block text-xs font-semibold text-[#8FA8C4] mb-1">
                                        Medicamento Fornecido
                                      </label>
                                      <input
                                        type="text"
                                        value={data.medicamentoFornecido}
                                        onChange={(e) =>
                                          setMedicamentosSelecionados({
                                            ...medicamentosSelecionados,
                                            [item.id]: {
                                              ...data,
                                              medicamentoFornecido:
                                                e.target.value,
                                            },
                                          })
                                        }
                                        placeholder={item.medicamento}
                                        className="w-full px-2 py-1.5 rounded text-xs outline-none transition-all"
                                        style={{
                                          border: "1px solid #C8D9ED",
                                          background: "#FFFFFF",
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-[#8FA8C4] mb-1">
                                        Quantidade a Dispensar
                                      </label>
                                      <input
                                        type="number"
                                        value={data.quantidadeDispensada}
                                        onChange={(e) =>
                                          setMedicamentosSelecionados({
                                            ...medicamentosSelecionados,
                                            [item.id]: {
                                              ...data,
                                              quantidadeDispensada:
                                                parseInt(e.target.value) ||
                                                item.quantidade,
                                            },
                                          })
                                        }
                                        min="1"
                                        max={item.quantidade}
                                        className="w-full px-2 py-1.5 rounded text-xs outline-none transition-all"
                                        style={{
                                          border: "1px solid #C8D9ED",
                                          background: "#FFFFFF",
                                        }}
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-xs font-semibold text-[#8FA8C4] mb-1">
                                        Observações
                                      </label>
                                      <textarea
                                        value={data.observacoes}
                                        onChange={(e) =>
                                          setMedicamentosSelecionados({
                                            ...medicamentosSelecionados,
                                            [item.id]: {
                                              ...data,
                                              observacoes: e.target.value,
                                            },
                                          })
                                        }
                                        placeholder="Ex: Medicamento genérico, substituição, etc."
                                        className="w-full px-2 py-1.5 rounded text-xs outline-none transition-all resize-none"
                                        style={{
                                          border: "1px solid #C8D9ED",
                                          background: "#FFFFFF",
                                        }}
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Informações resumidas */}
                                <div className="grid grid-cols-3 gap-2 pl-7 text-xs">
                                  <div>
                                    <span className="text-[#8FA8C4]">
                                      Dosagem:
                                    </span>
                                    <p className="font-semibold text-[#0F2242]">
                                      {item.dosagem || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-[#8FA8C4]">
                                      Quantidade:
                                    </span>
                                    <p className="font-semibold text-[#0F2242]">
                                      {item.quantidade}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-[#8FA8C4]">
                                      Posologia:
                                    </span>
                                    <p className="font-semibold text-[#0F2242]">
                                      {item.posologia || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-[#8FA8C4]">
                      Nenhum medicamento encontrado para esta receita.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="border-t flex justify-end gap-3 px-6 py-4"
              style={{ borderColor: "#E4EDF7", background: "#F8FAFD" }}
            >
              <button
                onClick={() => {
                  setShowDispensacaoModal(false);
                  setMedicamentosSelecionados({});
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
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
                Fechar
              </button>

              {receitaEncontrada.itens &&
              receitaEncontrada.itens.filter(
                (m: any) => m.status === "dispensado",
              ).length === receitaEncontrada.itens.length ? (
                <button
                  onClick={() => {
                    setShowDispensacaoModal(false);
                    setShowDetalhesDispensacaoModal(true);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{ background: "#1A3F72" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#0F2242")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#1A3F72")
                  }
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Ver Detalhes das Dispensações
                  </div>
                </button>
              ) : receitaEncontrada.itens &&
                receitaEncontrada.itens.filter(
                  (m: any) => m.status === "pendente",
                ).length > 0 ? (
                <button
                  onClick={handleDispensarMedicamentos}
                  disabled={
                    isDispensandoMedicamentos ||
                    Object.values(medicamentosSelecionados).every(
                      (m) => !m.selecionado,
                    )
                  }
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#00A651" }}
                  onMouseEnter={(e) =>
                    !isDispensandoMedicamentos &&
                    (e.currentTarget.style.background = "#007A3F")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#00A651")
                  }
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {isDispensandoMedicamentos
                      ? "Dispensando..."
                      : "Confirmar Dispensação"}
                  </div>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes de Dispensações */}
      {showDetalhesDispensacaoModal && receitaEncontrada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(10,25,47,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
            style={{
              border: "1px solid #D9E4F0",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            {/* Header */}
            <div
              className="border-b px-6 py-4"
              style={{ borderColor: "#E4EDF7", background: "#F8FAFD" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2242]">
                    Detalhes das Dispensações
                  </h3>
                  <p className="text-xs text-[#8FA8C4] mt-1">
                    Paciente: {receitaEncontrada.paciente?.nome || "N/A"} •
                    Registro: {receitaEncontrada.registroAssinatura || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetalhesDispensacaoModal(false)}
                  className="rounded-lg p-2 text-[#8FA8C4] hover:bg-[#E4EDF7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto space-y-4">
              {receitaEncontrada.dispensacoes &&
              receitaEncontrada.dispensacoes.length > 0 ? (
                <div className="space-y-3">
                  {receitaEncontrada.dispensacoes.map(
                    (dispensacao: any, index: number) => {
                      const medicamento = receitaEncontrada.itens?.find(
                        (item: any) =>
                          item.id === dispensacao.receitaMedicamentoId,
                      );

                      return (
                        <div
                          key={dispensacao.id}
                          className="rounded-lg border p-4"
                          style={{
                            background: "#F8FAFD",
                            borderColor: "#E4EDF7",
                          }}
                        >
                          {/* Número da Dispensação */}
                          <div
                            className="flex items-center justify-between mb-3 pb-3 border-b"
                            style={{ borderColor: "#E4EDF7" }}
                          >
                            <p className="text-sm font-bold text-[#0F2242]">
                              Dispensação #{index + 1}
                            </p>
                            <span
                              className="px-2 py-0.5 rounded text-xs font-semibold"
                              style={{
                                background: "#D1F3E9",
                                color: "#145C35",
                              }}
                            >
                              ✓ Dispensado
                            </span>
                          </div>

                          {/* Dados da Dispensação */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Medicamento
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {medicamento?.medicamento ||
                                  dispensacao.medicamentoFornecido ||
                                  "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Medicamento Fornecido
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {dispensacao.medicamentoFornecido ||
                                  medicamento?.medicamento ||
                                  "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Quantidade Dispensada
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {dispensacao.quantidadeDispensada} un.
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Responsável
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {dispensacao.ubsResponsavel ||
                                  dispensacao.farmaciaResponsavel ||
                                  "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Data e Hora
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {new Date(
                                  dispensacao.dataDispensacao,
                                ).toLocaleString("pt-BR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Local
                              </p>
                              <p className="text-sm font-semibold text-[#0F2242]">
                                {dispensacao.ubs?.nome || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Observações */}
                          {dispensacao.observacoesDispensacao && (
                            <div
                              className="mt-3 pt-3 border-t"
                              style={{ borderColor: "#E4EDF7" }}
                            >
                              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                                Observações
                              </p>
                              <p className="text-sm text-[#5C7A9B]">
                                {dispensacao.observacoesDispensacao}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-[#8FA8C4]">
                    Nenhuma dispensação registrada para esta receita.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="border-t flex justify-end gap-3 px-6 py-4"
              style={{ borderColor: "#E4EDF7", background: "#F8FAFD" }}
            >
              <button
                onClick={() => setShowDetalhesDispensacaoModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
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
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioDispensacaoModals;
