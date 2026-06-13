import React from "react";
import { X } from "lucide-react";

interface MedicationModalsProps {
  showAdministradorMedicamentoModal: boolean;
  selectedAdminPaciente: any;
  resetAdministracaoForm: () => void;
  medSearchTerm: string;
  setMedSearchTerm: (val: string) => void;
  loadingMedicamentos: boolean;
  filteredMedicamentos: any[];
  openAdministrarMed: (med: any) => void;
  editingMed: any;
  resetMedForm: () => void;
  medData: any;
  setMedData: (data: any) => void;
  handleMedSubmit: (e: React.FormEvent) => void;
  isUpdatingMed: boolean;
  selectedMed: any;
  administracaoData: any;
  setAdministracaoData: (data: any) => void;
  handleAdministrarSubmit: (e: React.FormEvent) => void;
  isAdministrandoMed: boolean;
}

const FuncionarioMedicationModals: React.FC<MedicationModalsProps> = ({
  showAdministradorMedicamentoModal,
  selectedAdminPaciente,
  resetAdministracaoForm,
  medSearchTerm,
  setMedSearchTerm,
  loadingMedicamentos,
  filteredMedicamentos,
  openAdministrarMed,
  editingMed,
  resetMedForm,
  medData,
  setMedData,
  handleMedSubmit,
  isUpdatingMed,
  selectedMed,
  administracaoData,
  setAdministracaoData,
  handleAdministrarSubmit,
  isAdministrandoMed,
}) => {
  return (
    <>
      {showAdministradorMedicamentoModal && selectedAdminPaciente && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(10,25,47,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
            style={{
              border: "1px solid #D9E4F0",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #EEF2F7" }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                  Selecionar medicamento
                </p>
                <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                  Administrar para {selectedAdminPaciente.nome}
                </h3>
                <p className="text-xs text-[#8FA8C4] mt-0.5">
                  CNS: {selectedAdminPaciente.cns}
                </p>
              </div>
              <button
                type="button"
                onClick={resetAdministracaoForm}
                className="rounded-full p-2 transition-all"
                style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#D9E4F0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#F0F4F8")
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8FA8C4]">
                  Buscar medicamento
                </p>
                <div className="w-full max-w-md">
                  <label htmlFor="med-search" className="sr-only">
                    Buscar medicamento
                  </label>
                  <input
                    id="med-search"
                    type="text"
                    value={medSearchTerm}
                    onChange={(e) => setMedSearchTerm(e.target.value)}
                    className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] placeholder-[#8FA8C4] outline-none transition-all"
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
                    placeholder="Pesquisar por nome de medicamento"
                  />
                </div>
              </div>
              {loadingMedicamentos ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#C8D9ED] border-t-[#1A3F72] mx-auto"></div>
                  <p className="mt-3 text-sm text-[#8FA8C4]">
                    Carregando medicamentos...
                  </p>
                </div>
              ) : filteredMedicamentos && filteredMedicamentos.length > 0 ? (
                <div className="space-y-3">
                  {filteredMedicamentos.map((med: any) => (
                    <div
                      key={med.id}
                      className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      style={{
                        border: "1px solid #E4EDF7",
                        background: "#FAFCFF",
                      }}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-2 items-center">
                          <p className="text-xs text-[#8FA8C4]">{med.nome}</p>
                          <span
                            className="px-2 py-0.5 text-xs rounded-full font-medium"
                            style={{
                              background: "#EBF2FB",
                              color: "#1A3F72",
                            }}
                          >
                            UBS: {med.ubs?.nome || "Não informada"}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#0F2242]">
                          {med.descricao}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-[#5C7A9B]">
                          <p>
                            <span className="font-semibold text-[#3A5B82]">
                              Lote:
                            </span>{" "}
                            {med.lote}
                          </p>
                          <p>
                            <span className="font-semibold text-[#3A5B82]">
                              Quantidade:
                            </span>{" "}
                            {med.quantidade}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Number(med.quantidade) > 0 ? (
                          <button
                            type="button"
                            onClick={() => openAdministrarMed(med)}
                            className="px-3 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                            style={{ background: "#145C35" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#0E4226")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "#145C35")
                            }
                          >
                            Administrar
                          </button>
                        ) : (
                          <span
                            className="px-3 py-2 rounded-lg text-xs font-medium"
                            style={{
                              border: "1px solid #F0C0C0",
                              background: "#FEF0F0",
                              color: "#8B1F1F",
                            }}
                          >
                            Sem estoque
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#8FA8C4]">
                  Nenhum medicamento encontrado para sua UBS.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {editingMed && (
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
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #EEF2F7" }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                  Editar medicação
                </p>
                <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                  {editingMed.descricao}
                </h3>
              </div>
              <button
                type="button"
                onClick={resetMedForm}
                className="rounded-full p-2 transition-all"
                style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#D9E4F0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#F0F4F8")
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleMedSubmit} className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                    Quantidade
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={medData.quantidade}
                    onChange={(e) =>
                      setMedData({
                        ...medData,
                        quantidade: e.target.value,
                      })
                    }
                    className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
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
                    placeholder="Ex: 100"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                    Data de validade
                  </span>
                  <input
                    type="date"
                    value={medData.dataValidade}
                    onChange={(e) =>
                      setMedData({
                        ...medData,
                        dataValidade: e.target.value,
                      })
                    }
                    className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
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
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                  Observações
                </span>
                <textarea
                  value={medData.observacoes}
                  onChange={(e) =>
                    setMedData({
                      ...medData,
                      observacoes: e.target.value,
                    })
                  }
                  className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
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
                  rows={4}
                  placeholder="Observações sobre o medicamento"
                />
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetMedForm}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingMed}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "#1A3F72" }}
                  onMouseEnter={(e) =>
                    !isUpdatingMed &&
                    (e.currentTarget.style.background = "#0F2A52")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#1A3F72")
                  }
                >
                  {isUpdatingMed ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMed && (
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
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #EEF2F7" }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                  Ministrar ao paciente
                </p>
                <h3 className="mt-1.5 text-lg font-bold text-[#0F2242]">
                  {selectedMed.nome}
                </h3>
              </div>
              <button
                type="button"
                onClick={resetAdministracaoForm}
                className="rounded-full p-2 transition-all"
                style={{ background: "#F0F4F8", color: "#5C7A9B" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#D9E4F0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#F0F4F8")
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={handleAdministrarSubmit}
              className="space-y-5 px-6 py-5"
            >
              <p className="text-xs text-[#8FA8C4]">
                Lote: {selectedMed.lote} · Disponível:{" "}
                <span className="font-semibold text-[#145C35]">
                  {selectedMed.quantidade} unidades
                </span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                    CNS do paciente *
                  </span>
                  <input
                    type="text"
                    value={administracaoData.pacienteCns}
                    onChange={(e) =>
                      setAdministracaoData({
                        ...administracaoData,
                        pacienteCns: e.target.value,
                      })
                    }
                    required
                    placeholder="Informe o CNS do paciente"
                    className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                    style={{
                      border: "1px solid #C8D9ED",
                      background: "#F4F8FC",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#145C35";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#C8D9ED";
                      e.target.style.background = "#F4F8FC";
                    }}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                    Quantidade *
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={selectedMed.quantidade}
                    value={administracaoData.quantidade}
                    onChange={(e) =>
                      setAdministracaoData({
                        ...administracaoData,
                        quantidade: e.target.value,
                      })
                    }
                    required
                    placeholder={`Máx: ${selectedMed.quantidade}`}
                    className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                    style={{
                      border: "1px solid #C8D9ED",
                      background: "#F4F8FC",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#145C35";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#C8D9ED";
                      e.target.style.background = "#F4F8FC";
                    }}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                    Data e Hora *
                  </span>
                  <input
                    type="datetime-local"
                    value={administracaoData.dataRetirada}
                    onChange={(e) =>
                      setAdministracaoData({
                        ...administracaoData,
                        dataRetirada: e.target.value,
                      })
                    }
                    required
                    className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
                    style={{
                      border: "1px solid #C8D9ED",
                      background: "#F4F8FC",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#145C35";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#C8D9ED";
                      e.target.style.background = "#F4F8FC";
                    }}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] block mb-1.5">
                    Observações
                  </span>
                  <textarea
                    value={administracaoData.observacoes}
                    onChange={(e) =>
                      setAdministracaoData({
                        ...administracaoData,
                        observacoes: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Observações sobre a administração (opcional)"
                    className="block w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
                    style={{
                      border: "1px solid #C8D9ED",
                      background: "#F4F8FC",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#145C35";
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#C8D9ED";
                      e.target.style.background = "#F4F8FC";
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetAdministracaoForm}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAdministrandoMed}
                  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "#145C35" }}
                  onMouseEnter={(e) =>
                    !isAdministrandoMed &&
                    (e.currentTarget.style.background = "#0E4226")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#145C35")
                  }
                >
                  {isAdministrandoMed
                    ? "Registrando..."
                    : "Registrar Administração"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioMedicationModals;
