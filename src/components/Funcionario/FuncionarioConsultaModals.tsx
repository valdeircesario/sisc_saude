import React from "react";

interface ConsultaModalsProps {
  showConsultaDetailsModal: boolean;
  setShowConsultaDetailsModal: (show: boolean) => void;
  selectedConsulta: any;
  setSelectedConsulta: (consulta: any) => void;
  getStatusColor: (status: string) => string;
  formatConsultaDate: (date: any) => string;
  getConsultaDisease: (consulta: any) => string;
  setModalHistorico: (modal: { aberto: boolean; consulta: any }) => void;
  modalHistorico: { aberto: boolean; consulta: any };
  handleRegistrarHistorico: (e: React.FormEvent) => void;
  formHistorico: any;
  setFormHistorico: (val: any) => void;
  isRegistrandoHistorico: boolean;
}

const FuncionarioConsultaModals: React.FC<ConsultaModalsProps> = ({
  showConsultaDetailsModal,
  setShowConsultaDetailsModal,
  selectedConsulta,
  setSelectedConsulta,
  getStatusColor,
  formatConsultaDate,
  getConsultaDisease,
  setModalHistorico,
  modalHistorico,
  handleRegistrarHistorico,
  formHistorico,
  setFormHistorico,
  isRegistrandoHistorico,
}) => {
  return (
    <>
      {showConsultaDetailsModal && selectedConsulta && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: "rgba(10,25,47,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl overflow-y-auto"
            style={{
              maxHeight: "90vh",
              border: "1px solid #D9E4F0",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            <div
              className="flex justify-between items-start p-6"
              style={{ borderBottom: "1px solid #EEF2F7" }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                  Detalhes da consulta
                </p>
                <h2 className="text-lg font-bold text-[#0F2242] mt-1">
                  {selectedConsulta.paciente?.nome || "Paciente não informado"}
                </h2>
                <p className="text-sm text-[#8FA8C4] mt-1">
                  {selectedConsulta.especialidade ||
                    "Especialidade não informada"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowConsultaDetailsModal(false);
                  setSelectedConsulta(null);
                }}
                className="text-[#8FA8C4] hover:text-[#5C7A9B] text-2xl font-bold leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-[#1A2E4A]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#F8FAFD" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                    Status
                  </p>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(selectedConsulta.status)}`}
                  >
                    {selectedConsulta.status}
                  </span>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#F8FAFD" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                    Data do agendamento
                  </p>
                  <p className="font-semibold">
                    {formatConsultaDate(selectedConsulta.dataAgendada)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#F8FAFD" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                    Local
                  </p>
                  <p className="font-semibold">
                    {selectedConsulta.ubs?.nome || "Não informado"}
                  </p>
                  <p className="text-[#5C7A9B] text-xs mt-1">
                    {selectedConsulta.ubs?.endereco || "Endereço não informado"}
                  </p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#F8FAFD" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                    Contato do paciente
                  </p>
                  <p className="font-semibold">
                    {selectedConsulta.paciente?.telefone || "Não informado"}
                  </p>
                  <p className="text-[#5C7A9B] text-xs mt-1">
                    {selectedConsulta.paciente?.email || "Não informado"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: "#F8FAFD" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                  Motivo da consulta
                </p>
                <p>{selectedConsulta.motivo || "Nenhum motivo informado"}</p>
              </div>

              <div className="rounded-xl p-4" style={{ background: "#F8FAFD" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                  Observações
                </p>
                <p>
                  {selectedConsulta.observacoes ||
                    "Nenhuma observação registrada"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#F8FAFD" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                    Doença
                  </p>
                  <p className="font-semibold">
                    {getConsultaDisease(selectedConsulta)}
                  </p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#F8FAFD" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                    Diagnóstico
                  </p>
                  <p className="font-semibold">
                    {selectedConsulta.historicoMedico?.diagnostico ||
                      "Não registrado"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: "#F8FAFD" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                  Laudo
                </p>
                <p>
                  {selectedConsulta.historicoMedico?.laudo ||
                    "Laudo ainda não registrado"}
                </p>
              </div>

              <div className="rounded-xl p-4" style={{ background: "#F8FAFD" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1">
                  Medicação
                </p>
                <p>
                  {selectedConsulta.historicoMedico?.medicacao ||
                    "Nenhuma medicação registrada"}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex justify-end gap-3">
              {(selectedConsulta.status === "agendada" ||
                selectedConsulta.status === "agendado") && (
                <button
                  onClick={() => {
                    setShowConsultaDetailsModal(false);
                    setModalHistorico({
                      aberto: true,
                      consulta: selectedConsulta,
                    });
                  }}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{ background: "#145C35" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#0E4226")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#145C35")
                  }
                >
                  Registrar histórico
                </button>
              )}
              <button
                onClick={() => {
                  setShowConsultaDetailsModal(false);
                  setSelectedConsulta(null);
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
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

      {/* ══ MODAL REGISTRAR HISTÓRICO ══ */}
      {modalHistorico.aberto && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background: "rgba(10,25,47,0.55)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg overflow-y-auto"
            style={{
              maxHeight: "90vh",
              border: "1px solid #D9E4F0",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            <div
              className="flex justify-between items-center p-6"
              style={{ borderBottom: "1px solid #EEF2F7" }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4]">
                  Registrar histórico
                </p>
                <h2 className="text-lg font-bold text-[#0F2242] mt-1">
                  Histórico Médico
                </h2>
                <p className="text-xs text-[#8FA8C4] mt-0.5">
                  Paciente: {modalHistorico.consulta?.paciente?.nome}
                </p>
              </div>
              <button
                onClick={() =>
                  setModalHistorico({ aberto: false, consulta: null })
                }
                className="text-[#8FA8C4] hover:text-[#5C7A9B] text-2xl font-bold leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleRegistrarHistorico} className="p-6 space-y-4">
              {[
                {
                  label: "Laudo",
                  key: "laudo",
                  required: true,
                  type: "textarea",
                  rows: 3,
                  placeholder: "Descreva o laudo médico...",
                },
                {
                  label: "Diagnóstico",
                  key: "diagnostico",
                  required: true,
                  type: "textarea",
                  rows: 2,
                  placeholder: "Diagnóstico do paciente...",
                },
              ].map(({ label, key, required, type, rows, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                    {label}
                    {required && <span className="text-[#8B1F1F]"> *</span>}
                  </label>
                  <textarea
                    required={required}
                    rows={rows}
                    value={formHistorico[key]}
                    onChange={(e) =>
                      setFormHistorico((prev: any) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
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
                    placeholder={placeholder}
                  />
                </div>
              ))}
              {[
                {
                  label: "Doença",
                  key: "doenca",
                  placeholder: "CID ou nome da doença...",
                },
                {
                  label: "Medicação",
                  key: "medicacao",
                  placeholder: "Medicações prescritas...",
                },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={formHistorico[key]}
                    onChange={(e) =>
                      setFormHistorico((prev: any) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
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
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={formHistorico.observacoes}
                  onChange={(e) =>
                    setFormHistorico((prev: any) => ({
                      ...prev,
                      observacoes: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all resize-none"
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
                  placeholder="Observações adicionais..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#8FA8C4] mb-1.5">
                  Data da Consulta <span className="text-[#8B1F1F]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formHistorico.dataConsulta}
                  onChange={(e) =>
                    setFormHistorico((prev: any) => ({
                      ...prev,
                      dataConsulta: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-3 py-2 text-sm text-[#1A2E4A] outline-none transition-all"
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
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setModalHistorico({ aberto: false, consulta: null })
                  }
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
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
                  disabled={isRegistrandoHistorico}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "#1A3F72" }}
                  onMouseEnter={(e) =>
                    !isRegistrandoHistorico &&
                    (e.currentTarget.style.background = "#0F2A52")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#1A3F72")
                  }
                >
                  {isRegistrandoHistorico ? "Registrando..." : "Salvar Histórico"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioConsultaModals;
