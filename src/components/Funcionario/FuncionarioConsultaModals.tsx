import React from "react";
import { X, Clock, MapPin, User, Phone, FileText, ClipboardCheck, Stethoscope, ChevronRight, Activity, Save, Plus, Trash2, Pill, ClipboardList, AlertCircle } from "lucide-react";

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
  toggleIncluirReceita: () => void;
  toggleIncluirAtestado: () => void;
  adicionarMedicamentoEvolucao: () => void;
  removerMedicamentoEvolucao: (index: number) => void;
  atualizarMedicamentoEvolucao: (
    index: number,
    campo: string,
    valor: string,
  ) => void;
  isRegistrandoHistorico: boolean;

  // Retorno (Agendamento) 
  formRetorno: any;
  setFormRetorno: (val: any) => void;
  modalRetorno: { aberto: boolean; consulta: any };
  setModalRetorno: (modal: { aberto: boolean; consulta: any }) => void;
  handleAgendarRetorno: (e: React.FormEvent) => void;
  handleCancelarRetorno: (id: string) => void;

  // Evolução de Retorno (Exclusivo - Atendimento do Retorno)
  modalEvolucaoRetorno: { aberto: boolean; consulta: any };
  setModalEvolucaoRetorno: (modal: { aberto: boolean; consulta: any }) => void;
  formEvolucaoRetorno: any;
  setFormEvolucaoRetorno: (val: any) => void;
  toggleIncluirReceitaRetorno: () => void;
  toggleIncluirAtestadoRetorno: () => void;
  adicionarMedicamentoEvolucaoRetorno: () => void;
  removerMedicamentoEvolucaoRetorno: (index: number) => void;
  atualizarMedicamentoEvolucaoRetorno: (
    index: number,
    campo: string,
    valor: string,
  ) => void;
  handleRegistrarEvolucaoRetorno: (e: React.FormEvent) => void;
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
  toggleIncluirReceita,
  toggleIncluirAtestado,
  adicionarMedicamentoEvolucao,
  removerMedicamentoEvolucao,
  atualizarMedicamentoEvolucao,
  isRegistrandoHistorico,
  formRetorno,
  setFormRetorno,
  modalRetorno,
  setModalRetorno,
  handleAgendarRetorno,
  handleCancelarRetorno,
  modalEvolucaoRetorno,
  setModalEvolucaoRetorno,
  formEvolucaoRetorno,
  setFormEvolucaoRetorno,
  toggleIncluirReceitaRetorno,
  toggleIncluirAtestadoRetorno,
  adicionarMedicamentoEvolucaoRetorno,
  removerMedicamentoEvolucaoRetorno,
  atualizarMedicamentoEvolucaoRetorno,
  handleRegistrarEvolucaoRetorno,
}) => {
  const [confirmandoCancelamento, setConfirmandoCancelamento] = React.useState(false);

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
    <label className="block text-[11px] font-black uppercase tracking-widest text-[#4A6280] mb-2 ml-1">
      {children}
    </label>
  );

  return (
    <>
      {showConsultaDetailsModal && selectedConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/70 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl flex flex-col border border-white/20">
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
            
            <div className="overflow-y-auto flex-1 p-8 space-y-8">
              {/* Paciente e Unidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#F8FAFD] border border-[#E4EDF7] rounded-[2rem] shadow-sm">
                  <p className="text-[11px] font-black text-[#6B8BA4] uppercase tracking-widest mb-4">Paciente</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#C8D9ED] flex items-center justify-center shadow-md">
                      <User className="h-6 w-6 text-[#1A3F72]" />
                    </div>
                    <div>
                      <p className="text-base font-black text-[#0F2242] leading-tight">{selectedConsulta.paciente?.nome}</p>
                      <p className="text-[11px] font-black text-[#1A3F72] uppercase mt-1">CPF: {selectedConsulta.paciente?.cpf}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-[#F8FAFD] border border-[#E4EDF7] rounded-[2rem] shadow-sm">
                  <p className="text-[11px] font-black text-[#6B8BA4] uppercase tracking-widest mb-4">Local do Atendimento</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#C8D9ED] flex items-center justify-center shadow-md">
                      <MapPin className="h-6 w-6 text-[#145C35]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-black text-[#0F2242] leading-tight truncate">{selectedConsulta.ubs?.nome}</p>
                      <p className="text-[11px] font-black text-[#145C35] uppercase mt-1 truncate">{selectedConsulta.ubs?.endereco}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status e Data */}
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[180px] p-6 bg-white border border-[#EEF2F7] rounded-[2rem] shadow-md transition-all hover:shadow-lg">
                  <p className="text-[10px] font-black text-[#6B8BA4] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Status do Atendimento
                  </p>
                  <span className={`inline-flex px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border-2 ${getStatusColor(selectedConsulta.status)}`}>
                    {selectedConsulta.status}
                  </span>
                </div>
                <div className="flex-1 min-w-[180px] p-6 bg-white border border-[#EEF2F7] rounded-[2rem] shadow-md transition-all hover:shadow-lg">
                  <p className="text-[10px] font-black text-[#6B8BA4] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Horário Agendado
                  </p>
                  <p className="text-base font-black text-[#0F2242]">
                    {formatConsultaDate(selectedConsulta.dataAgendada)}
                  </p>
                </div>
              </div>

              {/* Detalhes Médicos */}
              <div className="space-y-8">
                <div className="p-6 bg-[#FAFCFF] border-2 border-[#E4EDF7] rounded-[2rem] shadow-inner">
                  <Label>Queixa Principal / Motivo</Label>
                  <p className="text-base text-[#1A2E4A] font-bold leading-relaxed italic opacity-90">"{selectedConsulta.motivo || "Não informado"}"</p>
                </div>

                {(selectedConsulta.historicoMedico || selectedConsulta.laudo) && (
                  <div className="p-8 bg-emerald-50/40 border-2 border-emerald-100 rounded-[2.5rem] space-y-7 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 rounded-xl">
                        <ClipboardCheck className="h-6 w-6 text-emerald-700" />
                      </div>
                      <h4 className="text-[13px] font-black text-emerald-800 uppercase tracking-widest">
                        {selectedConsulta.tipo === "retorno" ? "Evolução do Retorno" : "Evolução do Atendimento"}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-emerald-700/70 uppercase mb-2 ml-1">Diagnóstico (CID)</p>
                        <p className="text-base font-black text-[#0F2242] bg-white px-5 py-3 rounded-2xl border border-emerald-100 shadow-sm">
                          {selectedConsulta.historicoMedico?.diagnostico || selectedConsulta.diagnostico || "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-emerald-700/70 uppercase mb-2 ml-1">Doença / CID Interno</p>
                        <p className="text-base font-black text-[#0F2242] bg-white px-5 py-3 rounded-2xl border border-emerald-100 shadow-sm">
                          {selectedConsulta.historicoMedico ? getConsultaDisease(selectedConsulta) : (selectedConsulta.doenca || "—")}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-emerald-700/70 uppercase mb-2 ml-1">Conduta Clínica e Prontuário</p>
                      <div className="text-base text-[#0F2242] font-bold leading-relaxed bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm whitespace-pre-wrap">
                        {selectedConsulta.historicoMedico?.laudo || selectedConsulta.laudo}
                      </div>
                    </div>
                    {(selectedConsulta.historicoMedico?.observacoes || selectedConsulta.observacao) && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-emerald-700/70 uppercase mb-2 ml-1">Observações Gerais</p>
                        <p className="text-sm text-[#4A5568] font-bold bg-white/60 px-5 py-3 rounded-2xl border border-emerald-100/50 italic">
                          {selectedConsulta.historicoMedico?.observacoes || selectedConsulta.observacao}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Seção de Receita Vinculada */}
                {selectedConsulta.receita && (
                  <div className="p-8 bg-blue-50/40 border-2 border-blue-100 rounded-[2.5rem] space-y-7 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg">
                          <Pill className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black text-blue-900 uppercase tracking-widest">Receita Médica Digital</h4>
                        </div>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                        selectedConsulta.receita.status === "dispensada" ? "bg-green-100 border-green-200 text-green-700" : "bg-blue-100 border-blue-200 text-blue-700"
                      }`}>
                        {selectedConsulta.receita.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-1">
                        <p className="text-[10px] font-black text-blue-700/60 uppercase ml-1">Descrição da Prescrição</p>
                        <p className="text-sm font-bold text-[#1E3A8A] bg-white px-5 py-3 rounded-2xl border border-blue-100 shadow-sm">{selectedConsulta.receita.descricao}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-700/60 uppercase ml-1">CID da Receita</p>
                        <p className="text-sm font-black text-[#1E3A8A] bg-white px-5 py-3 rounded-2xl border border-blue-100 shadow-sm text-center">{selectedConsulta.receita.cid}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[11px] font-black text-blue-800 uppercase tracking-[0.15em] flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Itens Prescritos ({selectedConsulta.receita.itens?.length || 0})
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {selectedConsulta.receita.itens?.map((item: any, idx: number) => (
                          <div key={idx} className="p-5 bg-white border-2 border-blue-50 rounded-[1.5rem] shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                            <div className="flex justify-between items-start mb-3">
                              <p className="text-base font-black text-[#0F2242]">{item.medicamento}</p>
                              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{item.dosagem}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-[9px] font-black text-[#8FA8C4] uppercase">Posologia</p>
                                <p className="font-bold text-[#1A3F72]">{item.posologia || "Conforme bula"}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-[#8FA8C4] uppercase">Quantidade</p>
                                <p className="font-bold text-[#1A3F72]">{item.quantidade} unidade(s)</p>
                              </div>
                            </div>
                            {item.observacoes && (
                              <div className="mt-3 pt-3 border-t border-blue-50">
                                <p className="text-[9px] font-black text-blue-400 uppercase">Instruções de Uso</p>
                                <p className="text-xs font-bold text-blue-800 italic">"{item.observacoes}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Seção de Atestado Vinculado */}
                {selectedConsulta.atestado && (
                  <div className="p-8 bg-purple-50/40 border-2 border-purple-100 rounded-[2.5rem] space-y-7 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 border-b border-purple-100 pb-4">
                      <div className="p-2.5 bg-purple-600 rounded-xl shadow-lg">
                        <ClipboardList className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-purple-900 uppercase tracking-widest">Atestado Médico</h4>
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-0.5">Emitido em {new Date(selectedConsulta.atestado.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-purple-700/60 uppercase ml-1">Motivo do Afastamento</p>
                        <p className="text-sm font-bold text-purple-900 bg-white px-5 py-3 rounded-2xl border border-purple-100 shadow-sm">{selectedConsulta.atestado.descricao}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-center">
                          <p className="text-[10px] font-black text-purple-700/60 uppercase">Dias</p>
                          <p className="text-lg font-black text-purple-900 bg-white py-2 rounded-2xl border border-purple-100 shadow-sm">{selectedConsulta.atestado.diasRepouso}</p>
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="text-[10px] font-black text-purple-700/60 uppercase">CID</p>
                          <p className="text-lg font-black text-purple-900 bg-white py-2 rounded-2xl border border-purple-100 shadow-sm">{selectedConsulta.atestado.cid}</p>
                        </div>
                      </div>
                    </div>

                    {selectedConsulta.atestado.observacoes && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-purple-700/60 uppercase ml-1">Observações do Atestado</p>
                        <p className="text-sm text-purple-800 font-bold bg-white/60 px-5 py-3 rounded-2xl border border-purple-100/50 italic shadow-inner">
                          {selectedConsulta.atestado.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-[#F8FAFD] border-t border-[#E4EDF7] flex justify-end gap-4">
              {selectedConsulta.status === "realizado" && selectedConsulta.tipo !== "retorno" && (
                <button
                  onClick={() => {
                    setShowConsultaDetailsModal(false);
                    setModalRetorno({
                      aberto: true,
                      consulta: selectedConsulta,
                    });
                    setFormRetorno((prev: any) => ({
                      ...prev,
                      diagnostico: selectedConsulta.historicoMedico?.diagnostico || "",
                      motivo: `Retorno de ${selectedConsulta.especialidade}`
                    }));
                  }}
                  className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" /> Marcar Retorno
                </button>
              )}

              {(selectedConsulta.status === "agendada" || selectedConsulta.status === "agendado") && 
               !selectedConsulta.historicoMedico && 
               selectedConsulta.tipo !== "retorno" && (
                <button
                  onClick={() => {
                    setShowConsultaDetailsModal(false);
                    setModalHistorico({
                      aberto: true,
                      consulta: selectedConsulta,
                    });
                  }}
                  className="px-8 py-3.5 bg-[#145C35] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-[#0E4226] hover:scale-[1.03] active:scale-[0.97] transition-all"
                >
                  Registrar Atendimento
                </button>
              )}
              <button
                onClick={() => {
                  setShowConsultaDetailsModal(false);
                  setSelectedConsulta(null);
                }}
                className="px-8 py-3.5 bg-white text-[#1A2E4A] border-2 border-[#C8D9ED] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#F8FAFD] hover:border-[#A4BCCC] transition-all"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL AGENDAR/EDITAR RETORNO ══ */}
      {modalRetorno.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/70 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
            <ModalHeader 
              title={modalRetorno.consulta?.id?.startsWith("ret-") ? "Editar Agendamento de Retorno" : "Agendar Retorno / Acompanhamento"} 
              subtitle={`Paciente: ${modalRetorno.consulta?.paciente?.nome}`} 
              icon={Clock} 
              colorClass="bg-[#EBF2FB] text-[#1A3F72] border-[#C8D9ED]"
              onClose={() => setModalRetorno({ aberto: false, consulta: null })}
            />
            
            <form onSubmit={handleAgendarRetorno} className="p-8 space-y-6">
              <div className="p-6 bg-blue-50/30 border border-blue-100 rounded-3xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Data e Hora do Retorno *</Label>
                    <input
                      type="datetime-local"
                      required
                      value={formRetorno.dataRetorno}
                      onChange={(e) => setFormRetorno((prev: any) => ({ ...prev, dataRetorno: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-white border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-600 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Motivo do Retorno *</Label>
                    <input
                      required
                      value={formRetorno.motivo}
                      onChange={(e) => setFormRetorno((prev: any) => ({ ...prev, motivo: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-white border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-600 transition-all shadow-sm"
                      placeholder="Ex: Acompanhamento de exames"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Diagnóstico Prévio (Sincronizado)</Label>
                  <input
                    value={formRetorno.diagnostico}
                    onChange={(e) => setFormRetorno((prev: any) => ({ ...prev, diagnostico: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-white border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-600 transition-all shadow-sm"
                    placeholder="Diagnóstico identificado na consulta anterior"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações para o Retorno</Label>
                  <textarea
                    rows={3}
                    value={formRetorno.observacao}
                    onChange={(e) => setFormRetorno((prev: any) => ({ ...prev, observacao: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-white border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-600 transition-all resize-none shadow-sm"
                    placeholder="Instruções para o dia do retorno..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {confirmandoCancelamento ? (
                  <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Confirmar Cancelamento</h4>
                        <p className="text-[11px] text-red-700 font-bold">Esta ação é permanente e finalizará o fluxo deste retorno.</p>
                      </div>
                    </div>
                    <p className="text-xs text-red-800 mb-6 leading-relaxed">
                      Tem certeza que deseja cancelar este agendamento? O paciente será notificado e este horário ficará disponível na agenda.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setConfirmandoCancelamento(false)}
                        className="flex-1 px-4 py-3 bg-white text-red-600 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                      >
                        Não, manter agendamento
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleCancelarRetorno(modalRetorno.consulta.id);
                          setConfirmandoCancelamento(false);
                        }}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                      >
                        Sim, cancelar agora
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setModalRetorno({ aberto: false, consulta: null })}
                        className="flex-1 px-8 py-4 bg-white text-[#4A5568] border-2 border-[#C8D9ED] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#F8FAFD] transition-all"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                      >
                        <Save className="h-5 w-5" /> 
                        {modalRetorno.consulta?.id?.startsWith("ret-") ? "Salvar Alterações" : "Confirmar Agendamento"}
                      </button>
                    </div>

                    {modalRetorno.consulta?.id?.startsWith("ret-") && (
                      <button
                        type="button"
                        onClick={() => setConfirmandoCancelamento(true)}
                        className="w-full px-8 py-3 bg-red-50 text-red-600 border-2 border-red-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> Cancelar este Agendamento Permanentemente
                      </button>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL REGISTRAR HISTÓRICO ══ */}
      {modalHistorico.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/70 backdrop-blur-md">
          <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
            <ModalHeader 
              title="Registrar Evolução Clínica" 
              subtitle={`Paciente: ${modalHistorico.consulta?.paciente?.nome}`} 
              icon={FileText} 
              colorClass="bg-[#EAF5EF] text-[#145C35] border-[#C8EBD9]"
              onClose={() => setModalHistorico({ aberto: false, consulta: null })}
            />
            
            <form onSubmit={handleRegistrarHistorico} className="overflow-y-auto flex-1 p-8 space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Diagnóstico Principal *</Label>
                  <input
                    required
                    value={formHistorico.diagnostico}
                    onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, diagnostico: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all shadow-sm placeholder:text-[#8FA8C4]"
                    placeholder="Ex: Amigdalite Aguda"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data do Atendimento *</Label>
                  <input
                    type="date"
                    required
                    value={formHistorico.dataConsulta}
                    onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, dataConsulta: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Laudo / Conduta Clínica *</Label>
                <textarea
                  required
                  rows={5}
                  value={formHistorico.laudo}
                  onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, laudo: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all resize-none shadow-sm placeholder:text-[#8FA8C4]"
                  placeholder="Descreva o atendimento, exame físico e recomendações detalhadas..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>CID / Doença *</Label>
                  <input
                    type="text"
                    required
                    value={formHistorico.doenca}
                    onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, doenca: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all shadow-sm placeholder:text-[#8FA8C4]"
                    placeholder="Código CID ou nome da patologia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medicações Prescritas *</Label>
                  <input
                    type="text"
                    required
                    value={formHistorico.medicacao}
                    onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, medicacao: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all shadow-sm placeholder:text-[#8FA8C4]"
                    placeholder="Resumo dos remédios e dosagens"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações Adicionais *</Label>
                <textarea
                  required
                  rows={2}
                  value={formHistorico.observacoes}
                  onChange={(e) => setFormHistorico((prev: any) => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all resize-none shadow-sm placeholder:text-[#8FA8C4]"
                  placeholder="Algum detalhe relevante para o histórico do paciente..."
                />
              </div>

              {/* Opções Extras: Receita e Atestado */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#EEF2F7]">
                <button
                  type="button"
                  disabled={!formHistorico.diagnostico || !formHistorico.laudo || !formHistorico.doenca || !formHistorico.medicacao || !formHistorico.observacoes}
                  onClick={toggleIncluirReceita}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                    formHistorico.incluirReceita 
                    ? "bg-[#E6F0FF] border-[#3B82F6] text-[#1E40AF] shadow-lg scale-[1.02]" 
                    : "bg-[#F0F4F8] border-[#D1D9E0] text-[#4A5568] hover:bg-white hover:border-[#3B82F6] hover:text-[#3B82F6] disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale"
                  }`}
                >
                  <div className={`p-3 rounded-2xl transition-all ${formHistorico.incluirReceita ? "bg-[#3B82F6] text-white" : "bg-white group-hover:bg-[#3B82F6] group-hover:text-white"}`}>
                    <Pill className="h-7 w-7" />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.1em]">Incluir Receita Médica</span>
                  {formHistorico.incluirReceita && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3B82F6] animate-ping" />}
                </button>

                <button
                  type="button"
                  disabled={!formHistorico.diagnostico || !formHistorico.laudo || !formHistorico.doenca || !formHistorico.medicacao || !formHistorico.observacoes}
                  onClick={toggleIncluirAtestado}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                    formHistorico.incluirAtestado 
                    ? "bg-[#FAF5FF] border-[#8B5CF6] text-[#5B21B6] shadow-lg scale-[1.02]" 
                    : "bg-[#F0F4F8] border-[#D1D9E0] text-[#4A5568] hover:bg-white hover:border-[#8B5CF6] hover:text-[#8B5CF6] disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale"
                  }`}
                >
                  <div className={`p-3 rounded-2xl transition-all ${formHistorico.incluirAtestado ? "bg-[#8B5CF6] text-white" : "bg-white group-hover:bg-[#8B5CF6] group-hover:text-white"}`}>
                    <ClipboardList className="h-7 w-7" />
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.1em]">Incluir Atestado Médico</span>
                  {formHistorico.incluirAtestado && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping" />}
                </button>
              </div>

              {/* Seção da Receita */}
              {formHistorico.incluirReceita && (
                <div className="p-7 bg-[#F0F7FF] border-2 border-[#BFDBFE] rounded-[2.5rem] space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                        <Pill className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-[13px] font-black text-[#1E3A8A] uppercase tracking-widest">Nova Receita Digital</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Descrição da Receita *</Label>
                      <input
                        required={formHistorico.incluirReceita}
                        value={formHistorico.receita.descricao}
                        onChange={(e) => setFormHistorico((prev: any) => ({
                          ...prev,
                          receita: { ...prev.receita, descricao: e.target.value }
                        }))}
                        className="w-full px-5 py-3.5 bg-white border-2 border-[#BFDBFE] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-600 transition-all shadow-sm"
                        placeholder="Ex: Tratamento para Amigdalite"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CID Principal *</Label>
                      <input
                        required={formHistorico.incluirReceita}
                        value={formHistorico.receita.cid}
                        onChange={(e) => setFormHistorico((prev: any) => ({
                          ...prev,
                          receita: { ...prev.receita, cid: e.target.value }
                        }))}
                        className="w-full px-5 py-3.5 bg-white border-2 border-[#BFDBFE] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-600 transition-all shadow-sm"
                        placeholder="Ex: J03.9"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-white/20">
                      <Label>Medicamentos Prescritos</Label>
                      <button
                        type="button"
                        onClick={adicionarMedicamentoEvolucao}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-md active:scale-95 transition-all"
                      >
                        <Plus className="h-4 w-4" /> Adicionar Outro Item
                      </button>
                    </div>

                    <div className="space-y-5">
                      {formHistorico.receita.medicamentos.map((med: any, index: number) => (
                        <div key={index} className="p-6 bg-white border-2 border-white rounded-[2rem] space-y-4 relative group shadow-md transition-all hover:shadow-xl">
                          {formHistorico.receita.medicamentos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerMedicamentoEvolucao(index)}
                              className="absolute -top-3 -right-3 p-2 bg-red-50 text-red-600 border-2 border-red-100 rounded-full hover:bg-red-600 hover:text-white transition-all shadow-lg z-10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <Label>Nome do Medicamento *</Label>
                              <input
                                required={formHistorico.incluirReceita}
                                value={med.medicamento}
                                onChange={(e) => atualizarMedicamentoEvolucao(index, "medicamento", e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8FAFD] border-2 border-[#E4EDF7] rounded-xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-400"
                                placeholder="Nome do remédio"
                              />
                            </div>
                            <div>
                              <Label>Dosagem *</Label>
                              <input
                                required={formHistorico.incluirReceita}
                                value={med.dosagem}
                                onChange={(e) => atualizarMedicamentoEvolucao(index, "dosagem", e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8FAFD] border-2 border-[#E4EDF7] rounded-xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-400"
                                placeholder="Ex: 500mg"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Posologia / Uso *</Label>
                              <input
                                required={formHistorico.incluirReceita}
                                value={med.posologia}
                                onChange={(e) => atualizarMedicamentoEvolucao(index, "posologia", e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8FAFD] border-2 border-[#E4EDF7] rounded-xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-400"
                                placeholder="Ex: 1 comprimido de 8/8h"
                              />
                            </div>
                            <div>
                              <Label>Quantidade *</Label>
                              <input
                                required={formHistorico.incluirReceita}
                                type="number"
                                min="1"
                                value={med.quantidade}
                                onChange={(e) => atualizarMedicamentoEvolucao(index, "quantidade", e.target.value)}
                                className="w-full px-4 py-3 bg-[#F8FAFD] border-2 border-[#E4EDF7] rounded-xl text-sm font-bold text-[#0F2242] outline-none focus:border-blue-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seção do Atestado */}
              {formHistorico.incluirAtestado && (
                <div className="p-7 bg-[#F9F5FF] border-2 border-[#DDD6FE] rounded-[2.5rem] space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#DDD6FE] pb-4">
                    <div className="p-3 bg-purple-600 rounded-2xl shadow-lg">
                      <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-[13px] font-black text-[#4C1D95] uppercase tracking-widest">Novo Atestado Médico</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Descrição / Motivo do Afastamento *</Label>
                      <input
                        required={formHistorico.incluirAtestado}
                        value={formHistorico.atestado.descricao}
                        onChange={(e) => setFormHistorico((prev: any) => ({
                          ...prev,
                          atestado: { ...prev.atestado, descricao: e.target.value }
                        }))}
                        className="w-full px-5 py-3.5 bg-white border-2 border-[#DDD6FE] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-purple-600 transition-all shadow-sm"
                        placeholder="Ex: Repouso devido a sintomas gripais intensos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dias de Repouso *</Label>
                      <input
                        required={formHistorico.incluirAtestado}
                        type="number"
                        min="1"
                        value={formHistorico.atestado.diasRepouso}
                        onChange={(e) => setFormHistorico((prev: any) => ({
                          ...prev,
                          atestado: { ...prev.atestado, diasRepouso: e.target.value }
                        }))}
                        className="w-full px-5 py-3.5 bg-white border-2 border-[#DDD6FE] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-purple-600 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-[#EEF2F7]">
                <button
                  type="button"
                  onClick={() => setModalHistorico({ aberto: false, consulta: null })}
                  className="flex-1 px-8 py-4 bg-white text-[#4A5568] border-2 border-[#C8D9ED] rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-[#F8FAFD] hover:border-[#A4BCCC] transition-all"
                >
                  Cancelar Atendimento
                </button>
                <button
                  type="submit"
                  disabled={isRegistrandoHistorico}
                  className="flex-[2] px-8 py-4 bg-[#145C35] text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-[#0E4226] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                >
                  {isRegistrandoHistorico ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Finalizar e Salvar Prontuário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL REGISTRAR EVOLUÇÃO DE RETORNO (EXCLUSIVO) ══ */}
      {modalEvolucaoRetorno.aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/70 backdrop-blur-md">
          <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
            <ModalHeader 
              title="Registrar Atendimento de Retorno" 
              subtitle={`Paciente: ${modalEvolucaoRetorno.consulta?.paciente?.nome}`} 
              icon={Activity} 
              colorClass="bg-[#EBF2FB] text-[#1A3F72] border-[#C8D9ED]"
              onClose={() => setModalEvolucaoRetorno({ aberto: false, consulta: null })}
            />
            
            <form onSubmit={handleRegistrarEvolucaoRetorno} className="overflow-y-auto flex-1 p-8 space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Diagnóstico do Retorno *</Label>
                  <input
                    required
                    value={formEvolucaoRetorno.diagnostico}
                    onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({ ...prev, diagnostico: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all shadow-sm placeholder:text-[#8FA8C4]"
                    placeholder="Diagnóstico atualizado no retorno"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Doença / CID *</Label>
                  <input
                    required
                    value={formEvolucaoRetorno.doenca}
                    onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({ ...prev, doenca: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all shadow-sm placeholder:text-[#8FA8C4]"
                    placeholder="Ex: J03.9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Evolução Clínica / Conduta *</Label>
                <textarea
                  required
                  rows={5}
                  value={formEvolucaoRetorno.laudo}
                  onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({ ...prev, laudo: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all resize-none shadow-sm placeholder:text-[#8FA8C4]"
                  placeholder="Descreva a evolução do paciente desde a última consulta..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nova Medicação (se houver)</Label>
                  <input
                    value={formEvolucaoRetorno.medicacao}
                    onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({ ...prev, medicacao: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all shadow-sm placeholder:text-[#8FA8C4]"
                    placeholder="Resumo das medicações"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observações de Retorno</Label>
                  <input
                    value={formEvolucaoRetorno.observacao}
                    onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({ ...prev, observacao: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-[#F8FAFD] border-2 border-[#C8D9ED] rounded-2xl text-sm font-bold text-[#0F2242] outline-none focus:border-[#1A3F72] focus:bg-white transition-all shadow-sm placeholder:text-[#8FA8C4]"
                    placeholder="Notas adicionais do retorno"
                  />
                </div>
              </div>

              {/* Opções Extras para Retorno */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#EEF2F7]">
                <button
                  type="button"
                  onClick={toggleIncluirReceitaRetorno}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                    formEvolucaoRetorno.incluirReceita 
                    ? "bg-[#E6F0FF] border-[#3B82F6] text-[#1E40AF] shadow-lg scale-[1.02]" 
                    : "bg-[#F0F4F8] border-[#D1D9E0] text-[#4A5568] hover:bg-white hover:border-[#3B82F6] hover:text-[#3B82F6]"
                  }`}
                >
                  <Pill className="h-7 w-7" />
                  <span className="text-[12px] font-black uppercase tracking-[0.1em]">Gerar Receita no Retorno</span>
                </button>

                <button
                  type="button"
                  onClick={toggleIncluirAtestadoRetorno}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                    formEvolucaoRetorno.incluirAtestado 
                    ? "bg-[#FAF5FF] border-[#8B5CF6] text-[#5B21B6] shadow-lg scale-[1.02]" 
                    : "bg-[#F0F4F8] border-[#D1D9E0] text-[#4A5568] hover:bg-white hover:border-[#8B5CF6] hover:text-[#8B5CF6]"
                  }`}
                >
                  <ClipboardList className="h-7 w-7" />
                  <span className="text-[12px] font-black uppercase tracking-[0.1em]">Gerar Atestado no Retorno</span>
                </button>
              </div>

              {/* Seção da Receita no Retorno */}
              {formEvolucaoRetorno.incluirReceita && (
                <div className="p-7 bg-[#F0F7FF] border-2 border-[#BFDBFE] rounded-[2.5rem] space-y-6">
                  <Label>Detalhes da Receita de Retorno</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      placeholder="Descrição"
                      value={formEvolucaoRetorno.receita.descricao}
                      onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({
                        ...prev,
                        receita: { ...prev.receita, descricao: e.target.value }
                      }))}
                      className="w-full px-5 py-3.5 bg-white border-2 border-[#BFDBFE] rounded-2xl"
                    />
                    <input
                      placeholder="CID"
                      value={formEvolucaoRetorno.receita.cid}
                      onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({
                        ...prev,
                        receita: { ...prev.receita, cid: e.target.value }
                      }))}
                      className="w-full px-5 py-3.5 bg-white border-2 border-[#BFDBFE] rounded-2xl"
                    />
                  </div>
                  <button type="button" onClick={adicionarMedicamentoEvolucaoRetorno} className="text-xs font-bold text-blue-600">+ Adicionar Medicamento</button>
                  {formEvolucaoRetorno.receita.medicamentos.map((med: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white border rounded-xl space-y-2">
                       <input placeholder="Medicamento" value={med.medicamento} onChange={(e) => atualizarMedicamentoEvolucaoRetorno(idx, "medicamento", e.target.value)} className="w-full px-3 py-2 border rounded" />
                       <div className="grid grid-cols-2 gap-2">
                         <input placeholder="Dosagem" value={med.dosagem} onChange={(e) => atualizarMedicamentoEvolucaoRetorno(idx, "dosagem", e.target.value)} className="px-3 py-2 border rounded" />
                         <input placeholder="Quantidade" type="number" value={med.quantidade} onChange={(e) => atualizarMedicamentoEvolucaoRetorno(idx, "quantidade", e.target.value)} className="px-3 py-2 border rounded" />
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Seção do Atestado no Retorno */}
              {formEvolucaoRetorno.incluirAtestado && (
                <div className="p-7 bg-[#F9F5FF] border-2 border-[#DDD6FE] rounded-[2.5rem] space-y-6">
                  <Label>Detalhes do Atestado de Retorno</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      placeholder="Motivo"
                      value={formEvolucaoRetorno.atestado.descricao}
                      onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({
                        ...prev,
                        atestado: { ...prev.atestado, descricao: e.target.value }
                      }))}
                      className="w-full px-5 py-3.5 bg-white border-2 border-[#DDD6FE] rounded-2xl"
                    />
                    <input
                      placeholder="Dias"
                      type="number"
                      value={formEvolucaoRetorno.atestado.diasRepouso}
                      onChange={(e) => setFormEvolucaoRetorno((prev: any) => ({
                        ...prev,
                        atestado: { ...prev.atestado, diasRepouso: e.target.value }
                      }))}
                      className="w-full px-5 py-3.5 bg-white border-2 border-[#DDD6FE] rounded-2xl"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-[#EEF2F7]">
                <button
                  type="button"
                  onClick={() => setModalEvolucaoRetorno({ aberto: false, consulta: null })}
                  className="flex-1 px-8 py-4 bg-white text-[#4A5568] border-2 border-[#C8D9ED] rounded-[1.5rem] text-xs font-black uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegistrandoHistorico}
                  className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100"
                >
                  {isRegistrandoHistorico ? "Processando..." : "Finalizar Retorno"}
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
