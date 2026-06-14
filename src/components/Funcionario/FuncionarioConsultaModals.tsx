import React from "react";
import { X, Clock, MapPin, User, Phone, FileText, ClipboardCheck, Stethoscope, ChevronRight, Activity, Save } from "lucide-react";

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
  const ModalHeader = ({ title, subtitle, icon: Icon, colorClass, onClose }: any) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEF2F7]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#0F2242] leading-tight">{title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8FA8C4] mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-full hover:bg-[#F8FAFD] text-[#8FA8C4] hover:text-[#1A3F72] transition-all"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  const Label = ({ children }: any) => (
    <label className="block text-[10px] font-black uppercase tracking-widest text-[#8FA8C4] mb-1.5 ml-1">
      {children}
    </label>
  );

  return (
    <>
      {showConsultaDetailsModal && selectedConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            <ModalHeader 
              title="Resumo do Atendimento" 
              subtitle={selectedConsulta.especialidade || "Clínica Geral"} 
              icon={Stethoscope} 
              colorClass="bg-[#EBF2FB] text-[#1A3F72] border-[#C8D9ED]"
              onClose={() => {
                setShowConsultaDetailsModal(false);
                setSelectedConsulta(null);
              }}
            />
            
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Paciente e Unidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F8FAFD] border border-[#E4EDF7] rounded-2xl">
                  <p className="text-[10px] font-black text-[#8FA8C4] uppercase tracking-widest mb-3">Paciente</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#C8D9ED] flex items-center justify-center shadow-sm">
                      <User className="h-5 w-5 text-[#1A3F72]" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#0F2242] leading-tight">{selectedConsulta.paciente?.nome}</p>
                      <p className="text-[10px] font-bold text-[#3A5B82] uppercase mt-0.5">CPF: {selectedConsulta.paciente?.cpf}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[#F8FAFD] border border-[#E4EDF7] rounded-2xl">
                  <p className="text-[10px] font-black text-[#8FA8C4] uppercase tracking-widest mb-3">Local do Atendimento</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#C8D9ED] flex items-center justify-center shadow-sm">
                      <MapPin className="h-5 w-5 text-[#145C35]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#0F2242] leading-tight truncate">{selectedConsulta.ubs?.nome}</p>
                      <p className="text-[10px] font-bold text-[#3A5B82] uppercase mt-0.5 truncate">{selectedConsulta.ubs?.endereco}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status e Data */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px] p-4 bg-white border border-[#EEF2F7] rounded-2xl shadow-sm">
                  <p className="text-[9px] font-black text-[#8FA8C4] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Activity className="h-3 w-3" /> Status do Pedido
                  </p>
                  <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedConsulta.status)}`}>
                    {selectedConsulta.status}
                  </span>
                </div>
                <div className="flex-1 min-w-[140px] p-4 bg-white border border-[#EEF2F7] rounded-2xl shadow-sm">
                  <p className="text-[9px] font-black text-[#8FA8C4] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Horário Marcado
                  </p>
                  <p className="text-sm font-black text-[#0F2242]">
                    {formatConsultaDate(selectedConsulta.dataAgendada)}
                  </p>
                </div>
              </div>

              {/* Detalhes Médicos */}
              <div className="space-y-4">
                <div className="p-5 bg-[#FAFCFF] border border-[#E4EDF7] rounded-2xl">
                  <Label>Queixa Principal / Motivo</Label>
                  <p className="text-sm text-[#1A2E4A] font-medium leading-relaxed italic">"{selectedConsulta.motivo || "Não informado"}"</p>
                </div>

                {selectedConsulta.historicoMedico && (
                  <div className="p-5 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Resultado do Atendimento</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase mb-1">Diagnóstico (CID)</p>
                        <p className="text-sm font-bold text-[#0F2242]">{selectedConsulta.historicoMedico.diagnostico || "Não registrado"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase mb-1">Doença</p>
                        <p className="text-sm font-bold text-[#0F2242]">{getConsultaDisease(selectedConsulta)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-emerald-600/60 uppercase mb-1">Laudo / Evolução</p>
                      <p className="text-sm text-[#1A2E4A] font-medium leading-relaxed">{selectedConsulta.historicoMedico.laudo}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-[#F8FAFD] border-t border-[#E4EDF7] flex justify-end gap-3">
              {(selectedConsulta.status === "agendada" || selectedConsulta.status === "agendado") && !selectedConsulta.historicoMedico && (
                <button
                  onClick={() => {
                    setShowConsultaDetailsModal(false);
                    setModalHistorico({
                      aberto: true,
                      consulta: selectedConsulta,
                    });
                  }}
                  className="px-6 py-2.5 bg-[#145C35] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Registrar Atendimento
                </button>
              )}
              <button
                onClick={() => {
                  setShowConsultaDetailsModal(false);
                  setSelectedConsulta(null);
                }}
                className="px-6 py-2.5 bg-white text-[#5C7A9B] border border-[#C8D9ED] rounded-xl text-xs font-bold hover:bg-[#F8FAFD] transition-all"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL REGISTRAR HISTÓRICO ══ */}
      {modalHistorico.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <ModalHeader 
              title="Registrar Evolução" 
              subtitle={`Paciente: ${modalHistorico.consulta?.paciente?.nome}`} 
              icon={FileText} 
              colorClass="bg-[#EAF5EF] text-[#145C35] border-[#C8EBD9]"
              onClose={() => setModalHistorico({ aberto: false, consulta: null })}
            />
            
            <form onSubmit={handleRegistrarHistorico} className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Diagnóstico Principal *</Label>
                  <input
                    required
                    value={formHistorico.diagnostico}
                    onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, diagnostico: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all"
                    placeholder="Ex: Amigdalite Aguda"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Data do Atendimento *</Label>
                  <input
                    type="date"
                    required
                    value={formHistorico.dataConsulta}
                    onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, dataConsulta: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Laudo / Conduta Clínica *</Label>
                <textarea
                  required
                  rows={4}
                  value={formHistorico.laudo}
                  onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, laudo: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all resize-none"
                  placeholder="Descreva o atendimento e recomendações..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>CID / Doença</Label>
                  <input
                    type="text"
                    value={formHistorico.doenca}
                    onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, doenca: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all"
                    placeholder="Código CID ou nome"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Medicações Prescritas</Label>
                  <input
                    type="text"
                    value={formHistorico.medicacao}
                    onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, medicacao: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all"
                    placeholder="Remédios e dosagens"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Observações Adicionais</Label>
                <textarea
                  rows={2}
                  value={formHistorico.observacoes}
                  onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#F8FAFD] border border-[#C8D9ED] rounded-xl text-sm font-medium outline-none focus:border-[#1A3F72] transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalHistorico({ aberto: false, consulta: null })}
                  className="flex-1 px-6 py-3 bg-white text-[#5C7A9B] border border-[#C8D9ED] rounded-xl text-xs font-bold hover:bg-[#F8FAFD] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegistrandoHistorico}
                  className="flex-1 px-6 py-3 bg-[#145C35] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isRegistrandoHistorico ? "Processando..." : "Salvar Prontuário"}
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
