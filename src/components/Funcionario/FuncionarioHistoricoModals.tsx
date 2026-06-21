import React from "react";
import { X, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { downloadExamePDF } from "../../utils/downloadFile";

interface HistoricoModalsProps {
  showBuscaHistoricoModal: boolean;
  setShowBuscaHistoricoModal: (show: boolean) => void;
  handleBuscarHistoricoPorCpf: (e: React.FormEvent) => void;
  cpfHistoricoBusca: string;
  setCpfHistoricoBusca: (val: string) => void;
  isBuscandoHistorico: boolean;
  registroHistoricoDetalhe: any;
  setRegistroHistoricoDetalhe: (registro: any) => void;
  pacienteNome?: string;
}

const FuncionarioHistoricoModals: React.FC<HistoricoModalsProps> = ({
  showBuscaHistoricoModal,
  setShowBuscaHistoricoModal,
  handleBuscarHistoricoPorCpf,
  cpfHistoricoBusca,
  setCpfHistoricoBusca,
  isBuscandoHistorico,
  registroHistoricoDetalhe,
  setRegistroHistoricoDetalhe,
  pacienteNome,
}) => {
  return (
    <>
      {/* Modal de Busca por CPF */}
      {showBuscaHistoricoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            style={{ border: "1px solid #D9E4F0" }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#0F2242]">
                  Buscar histórico por CPF
                </h3>
                <p className="text-sm text-[#5C7A9B] mt-1">
                  Informe o CPF do paciente e o sistema reunirá consultas,
                  exames, encaminhamentos, vacinas e medicações em uma lista por
                  data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBuscaHistoricoModal(false)}
                className="rounded-lg p-2 text-[#5C7A9B] hover:bg-[#F0F4F8]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleBuscarHistoricoPorCpf} className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                CPF do paciente
                <input
                  type="text"
                  value={cpfHistoricoBusca}
                  onChange={(e) => setCpfHistoricoBusca(e.target.value)}
                  placeholder="000.000.000-00"
                  className="mt-1 w-full rounded-lg border border-[#C8D9ED] bg-[#F4F8FC] px-3 py-2 text-sm text-[#1A2E4A] outline-none"
                />
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBuscaHistoricoModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#5C7A9B] border border-[#C8D9ED] bg-transparent"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isBuscandoHistorico}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-[#1A3F72] disabled:opacity-50"
                >
                  {isBuscandoHistorico ? "Buscando..." : "Buscar histórico"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhe do Registro */}
      {registroHistoricoDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            style={{ border: "1px solid #D9E4F0" }}
          >
            <div className="border-b border-[#EEF2F7] bg-gradient-to-r from-[#0F2242] via-[#173A67] to-[#24508D] p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#DDE8F7]">
                    Visualização detalhada
                  </p>
                  <h3 className="text-2xl font-bold leading-tight text-white">
                    {registroHistoricoDetalhe.titulo}
                  </h3>
                  <p className="text-sm text-[#E6EEF8]">
                    {registroHistoricoDetalhe.categoria} •{" "}
                    {format(
                      new Date(registroHistoricoDetalhe.dataRegistro),
                      "dd/MM/yyyy HH:mm",
                      { locale: ptBR },
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRegistroHistoricoDetalhe(null)}
                  className="rounded-xl border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#EAF2FB]">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {registroHistoricoDetalhe.categoria}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {pacienteNome || "Paciente"}
                </span>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {registroHistoricoDetalhe.tipo === "historico" && (
                  <>
                    {[
                      [
                        "Diagnóstico",
                        registroHistoricoDetalhe.detalhes?.diagnostico,
                      ],
                      ["Laudo", registroHistoricoDetalhe.detalhes?.laudo],
                      ["Doença", registroHistoricoDetalhe.detalhes?.doenca],
                      [
                        "Medicação",
                        registroHistoricoDetalhe.detalhes?.medicacao,
                      ],
                      [
                        "Observações",
                        registroHistoricoDetalhe.detalhes?.observacoes,
                      ],
                      [
                        "Médico responsável",
                        registroHistoricoDetalhe.detalhes?.funcionario?.nome,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "consulta" && (
                  <>
                    {[
                      ["Motivo", registroHistoricoDetalhe.detalhes?.motivo],
                      [
                        "Especialidade",
                        registroHistoricoDetalhe.detalhes?.especialidade,
                      ],
                      ["Status", registroHistoricoDetalhe.detalhes?.status],
                      [
                        "Observações",
                        registroHistoricoDetalhe.detalhes?.observacoes,
                      ],
                      [
                        "Data agendada",
                        format(
                          new Date(
                            registroHistoricoDetalhe.detalhes?.dataAgendada ||
                              registroHistoricoDetalhe.dataRegistro,
                          ),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR },
                        ),
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "exame" && (
                  <>
                    {[
                      [
                        "Tipo do exame",
                        registroHistoricoDetalhe.detalhes?.tipo,
                      ],
                      ["Status", registroHistoricoDetalhe.detalhes?.status],
                      [
                        "Resultado",
                        registroHistoricoDetalhe.detalhes?.resultado,
                      ],
                      [
                        "Laboratório",
                        registroHistoricoDetalhe.detalhes?.laboratorio?.nome,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                    
                    {registroHistoricoDetalhe.detalhes?.arquivoPdf && (
                      <article className="rounded-2xl border border-sky-100 bg-sky-50 p-4 shadow-sm md:col-span-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-sky-600 font-black">
                          Documentação
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm font-semibold text-sky-900">Laudo técnico em PDF disponível</p>
                          <button
                            onClick={() => downloadExamePDF(registroHistoricoDetalhe.detalhes.arquivoPdf)}
                            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-sky-200 hover:bg-sky-700 transition-all"
                          >
                            <Download className="h-3.5 w-3.5" /> Baixar Laudo
                          </button>
                        </div>
                      </article>
                    )}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "solicitacao_exame" && (
                  <>
                    {[
                      ["Tipo", registroHistoricoDetalhe.detalhes?.tipoExame],
                      [
                        "Observações",
                        registroHistoricoDetalhe.detalhes?.observacoes,
                      ],
                      [
                        "Laboratório",
                        registroHistoricoDetalhe.detalhes?.laboratorio?.nome,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "encaminhamento" && (
                  <>
                    {[
                      ["Tipo", registroHistoricoDetalhe.detalhes?.tipo],
                      ["Motivo", registroHistoricoDetalhe.detalhes?.motivo],
                      ["Detalhes", registroHistoricoDetalhe.detalhes?.detalhes],
                      [
                        "Laudo médico",
                        registroHistoricoDetalhe.detalhes?.laudoMedico,
                      ],
                      [
                        "Hospital",
                        registroHistoricoDetalhe.detalhes?.hospital?.nome,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "vacina" && (
                  <>
                    {[
                      ["Nome", registroHistoricoDetalhe.detalhes?.nome],
                      ["Lote", registroHistoricoDetalhe.detalhes?.lote],
                      [
                        "Data da aplicação",
                        format(
                          new Date(
                            registroHistoricoDetalhe.detalhes?.dataApl ||
                              registroHistoricoDetalhe.dataRegistro,
                          ),
                          "dd/MM/yyyy",
                          { locale: ptBR },
                        ),
                      ],
                      [
                        "Próxima dose",
                        registroHistoricoDetalhe.detalhes?.proximaDose
                          ? format(
                              new Date(
                                registroHistoricoDetalhe.detalhes.proximaDose,
                              ),
                              "dd/MM/yyyy",
                              { locale: ptBR },
                            )
                          : "—",
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}

                {registroHistoricoDetalhe.tipo === "medicacao" && (
                  <>
                    {[
                      [
                        "Medicamento",
                        registroHistoricoDetalhe.detalhes?.medicamento?.nome,
                      ],
                      [
                        "Quantidade",
                        registroHistoricoDetalhe.detalhes?.quantidade,
                      ],
                      [
                        "Data da retirada",
                        format(
                          new Date(
                            registroHistoricoDetalhe.detalhes?.dataRetirada ||
                              registroHistoricoDetalhe.dataRegistro,
                          ),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR },
                        ),
                      ],
                      [
                        "Observações",
                        registroHistoricoDetalhe.detalhes?.observacoes,
                      ],
                    ].map(([label, value]) => (
                      <article
                        key={label}
                        className="rounded-2xl border border-[#E4EDF7] bg-[#F8FAFD] p-4 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8FA8C4]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm text-[#1A2E4A]">
                          {value || "—"}
                        </p>
                      </article>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-[#EEF2F7] bg-[#F8FAFD] p-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setRegistroHistoricoDetalhe(null)}
                  className="rounded-xl border border-[#C8D9ED] bg-white px-4 py-2 text-sm font-semibold text-[#5C7A9B] transition hover:bg-[#F0F4F8]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioHistoricoModals;
