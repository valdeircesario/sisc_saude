import React from "react";
import { X, Save, Send, User, Calendar, ClipboardCheck, FlaskConical, Building2, AlertCircle } from "lucide-react";

interface PatientActionModalsProps {
  selectedPaciente: any;
  showHistoricoModal: boolean;
  setShowHistoricoModal: (show: boolean) => void;
  handleHistoricoSubmit: (e: React.FormEvent) => void;
  historicoData: any;
  setHistoricoData: (val: any) => void;
  isRegistrandoHistorico: boolean;

  showVacinaModal: boolean;
  setShowVacinaModal: (show: boolean) => void;
  handleVacinaSubmit: (e: React.FormEvent) => void;
  vacinaData: any;
  setVacinaData: (val: any) => void;
  isRegistrandoVacina: boolean;

  showExameModal: boolean;
  setShowExameModal: (show: boolean) => void;
  handleExameSubmit: (e: React.FormEvent) => void;
  exameData: any;
  setExameData: (val: any) => void;
  isSolicitandoExame: boolean;
  laboratorios: any[];

  showInternacaoModal: boolean;
  setShowInternacaoModal: (show: boolean) => void;
  handleInternacaoSubmit: (e: React.FormEvent) => void;
  internacaoData: any;
  setInternacaoData: (val: any) => void;
  isSolicitandoInternacao: boolean;
  hospitais: any[];
  loadingHospitais: boolean;
  hospitaisError: boolean;
}

const FuncionarioPatientActionModals: React.FC<PatientActionModalsProps> = ({
  selectedPaciente,
  showHistoricoModal,
  setShowHistoricoModal,
  handleHistoricoSubmit,
  historicoData,
  setHistoricoData,
  isRegistrandoHistorico,

  showVacinaModal,
  setShowVacinaModal,
  handleVacinaSubmit,
  vacinaData,
  setVacinaData,
  isRegistrandoVacina,

  showExameModal,
  setShowExameModal,
  handleExameSubmit,
  exameData,
  setExameData,
  isSolicitandoExame,
  laboratorios,

  showInternacaoModal,
  setShowInternacaoModal,
  handleInternacaoSubmit,
  internacaoData,
  setInternacaoData,
  isSolicitandoInternacao,
  hospitais,
  loadingHospitais,
  hospitaisError,
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

  const PatientInfo = () => selectedPaciente && (
    <div className="mx-6 mt-6 p-4 bg-[#F8FAFD] border border-[#E4EDF7] rounded-2xl flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white border border-[#C8D9ED] flex items-center justify-center shadow-sm">
        <User className="h-5 w-5 text-[#1A3F72]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#0F2242]">{selectedPaciente.nome}</p>
        <p className="text-[10px] font-bold text-[#3A5B82] uppercase tracking-widest">CPF: {selectedPaciente.cpf}</p>
      </div>
    </div>
  );

  const Label = ({ children }: any) => (
    <label className="block text-[10px] font-black uppercase tracking-widest text-[#8FA8C4] mb-1.5 ml-1">
      {children}
    </label>
  );

  const Input = (props: any) => (
    <input
      {...props}
      className="w-full px-4 py-2.5 bg-white border border-[#C8D9ED] rounded-xl text-sm font-medium text-[#1A2E4A] outline-none focus:border-[#1A3F72] transition-all"
    />
  );

  const Select = (props: any) => (
    <select
      {...props}
      className="w-full px-4 py-2.5 bg-white border border-[#C8D9ED] rounded-xl text-sm font-medium text-[#1A2E4A] outline-none focus:border-[#1A3F72] transition-all"
    />
  );

  const Textarea = (props: any) => (
    <textarea
      {...props}
      className="w-full px-4 py-2.5 bg-white border border-[#C8D9ED] rounded-xl text-sm font-medium text-[#1A2E4A] outline-none focus:border-[#1A3F72] transition-all resize-none"
    />
  );

  return (
    <>
      {/* Modal de Histórico Médico */}
      {showHistoricoModal && (
        <div className="fixed inset-0 bg-[#0A192F]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <ModalHeader 
              title="Evolução Clínica" 
              subtitle="Registrar Prontuário" 
              icon={ClipboardCheck} 
              colorClass="bg-[#EAF5EF] text-[#145C35] border-[#C8EBD9]"
              onClose={() => setShowHistoricoModal(false)}
            />
            <div className="overflow-y-auto flex-1">
              <PatientInfo />
              <form onSubmit={handleHistoricoSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Data da Consulta</Label>
                    <Input
                      type="date"
                      value={historicoData.dataConsulta}
                      onChange={(e: any) => setHistoricoData({ ...historicoData, dataConsulta: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Diagnóstico Principal *</Label>
                    <Input
                      type="text"
                      value={historicoData.diagnostico}
                      onChange={(e: any) => setHistoricoData({ ...historicoData, diagnostico: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Laudo e Evolução *</Label>
                  <Textarea
                    value={historicoData.laudo}
                    onChange={(e: any) => setHistoricoData({ ...historicoData, laudo: e.target.value })}
                    rows={3}
                    required
                    placeholder="Descreva a evolução do paciente..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>CID / Doença</Label>
                    <Input
                      type="text"
                      value={historicoData.doenca}
                      onChange={(e: any) => setHistoricoData({ ...historicoData, doenca: e.target.value })}
                      placeholder="Ex: J00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Medicação / Conduta</Label>
                    <Input
                      type="text"
                      value={historicoData.medicacao}
                      onChange={(e: any) => setHistoricoData({ ...historicoData, medicacao: e.target.value })}
                      placeholder="Ex: Paracetamol 500mg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Observações Adicionais</Label>
                  <Textarea
                    value={historicoData.observacoes}
                    onChange={(e: any) => setHistoricoData({ ...historicoData, observacoes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowHistoricoModal(false)}
                    className="px-6 py-2.5 text-xs font-bold text-[#5C7A9B] hover:bg-[#F8FAFD] rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistrandoHistorico}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#145C35] text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {isRegistrandoHistorico ? "Salvando..." : "Registrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vacina */}
      {showVacinaModal && (
        <div className="fixed inset-0 bg-[#0A192F]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <ModalHeader 
              title="Cartão de Vacina" 
              subtitle="Registrar Dose" 
              icon={Building2} 
              colorClass="bg-[#EBF2FB] text-[#1A3F72] border-[#C8D9ED]"
              onClose={() => setShowVacinaModal(false)}
            />
            <PatientInfo />
            <form onSubmit={handleVacinaSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nome da Vacina *</Label>
                  <Input
                    type="text"
                    value={vacinaData.nome}
                    onChange={(e: any) => setVacinaData({ ...vacinaData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Lote *</Label>
                  <Input
                    type="text"
                    value={vacinaData.lote}
                    onChange={(e: any) => setVacinaData({ ...vacinaData, lote: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Data de Aplicação *</Label>
                  <Input
                    type="date"
                    value={vacinaData.dataApl}
                    onChange={(e: any) => setVacinaData({ ...vacinaData, dataApl: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Próxima Dose (Opcional)</Label>
                  <Input
                    type="date"
                    value={vacinaData.proximaDose}
                    onChange={(e: any) => setVacinaData({ ...vacinaData, proximaDose: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVacinaModal(false)}
                  className="px-6 py-2.5 text-xs font-bold text-[#5C7A9B] hover:bg-[#F8FAFD] rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRegistrandoVacina}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1A3F72] text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isRegistrandoVacina ? "Salvando..." : "Salvar Dose"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exame */}
      {showExameModal && (
        <div className="fixed inset-0 bg-[#0A192F]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <ModalHeader 
              title="Solicitação de Exame" 
              subtitle="Encaminhamento Laboratorial" 
              icon={FlaskConical} 
              colorClass="bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]"
              onClose={() => setShowExameModal(false)}
            />
            
            <div className="overflow-y-auto flex-1">
              <PatientInfo />
              
              <form onSubmit={handleExameSubmit} className="p-6 space-y-5">
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    Certifique-se de selecionar o laboratório correto para que o paciente possa agendar a coleta adequadamente.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Laboratório de Destino *</Label>
                    <Select
                      value={exameData.laboratorioId}
                      onChange={(e: any) => setExameData({ ...exameData, laboratorioId: e.target.value })}
                      required
                    >
                      <option value="">Selecione a unidade de destino</option>
                      {laboratorios?.map((lab: any) => (
                        <option key={lab.id} value={lab.id}>{lab.nome}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tipo de Procedimento / Exame *</Label>
                    <Input
                      type="text"
                      value={exameData.tipoExame}
                      onChange={(e: any) => setExameData({ ...exameData, tipoExame: e.target.value })}
                      placeholder="Ex: Hemograma, Ressonância Magnética..."
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Instruções Adicionais para o Laudo</Label>
                    <Textarea
                      value={exameData.observacoes}
                      onChange={(e: any) => setExameData({ ...exameData, observacoes: e.target.value })}
                      rows={4}
                      placeholder="Informações relevantes para o laboratório ou preparo do paciente..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExameModal(false)}
                    className="px-6 py-2.5 text-xs font-bold text-[#5C7A9B] hover:bg-[#F8FAFD] rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSolicitandoExame}
                    className="flex items-center gap-2 px-8 py-2.5 bg-[#7C3AED] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSolicitandoExame ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar Solicitação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Internação */}
      {showInternacaoModal && (
        <div className="fixed inset-0 bg-[#0A192F]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <ModalHeader 
              title="Solicitação de Internação" 
              subtitle="Encaminhamento Hospitalar" 
              icon={Building2} 
              colorClass="bg-[#FEF2F2] text-[#B91C1C] border-[#FEE2E2]"
              onClose={() => setShowInternacaoModal(false)}
            />
            
            <div className="overflow-y-auto flex-1">
              <PatientInfo />
              
              <form onSubmit={handleInternacaoSubmit} className="p-6 space-y-5">
                <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                    Atenção: Solicitações de internação requerem laudo médico detalhado e justificativa clínica para processamento na regulação.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Hospital de Destino *</Label>
                    {loadingHospitais ? (
                      <div className="px-4 py-2.5 bg-[#F8FAFD] rounded-xl text-xs text-[#8FA8C4] border border-[#E4EDF7] animate-pulse flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-[#8FA8C4]/30 border-t-[#8FA8C4] rounded-full animate-spin" />
                        Carregando unidades...
                      </div>
                    ) : hospitaisError ? (
                      <div className="px-4 py-2.5 bg-rose-50 rounded-xl text-[10px] text-rose-600 border border-rose-100 font-bold uppercase">
                        Erro ao carregar hospitais
                      </div>
                    ) : (
                      <Select
                        value={internacaoData.hospitalId}
                        onChange={(e: any) => setInternacaoData({ ...internacaoData, hospitalId: e.target.value })}
                        required
                      >
                        <option value="">Selecione o hospital</option>
                        {hospitais?.map((h: any) => (
                          <option key={h.id} value={h.id}>{h.nome}</option>
                        ))}
                      </Select>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label>Prioridade Clínica *</Label>
                    <Select
                      value={internacaoData.prioridade}
                      onChange={(e: any) => setInternacaoData({ ...internacaoData, prioridade: e.target.value })}
                      required
                    >
                      <option value="leve">Leve (Baixa Urgência)</option>
                      <option value="medio">Médio (Urgente)</option>
                      <option value="grave">Grave (Muito Urgente)</option>
                      <option value="urgente">Urgente (Emergência)</option>
                      <option value="gravissimo">Gravíssimo (Imediato)</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tipo de Solicitação *</Label>
                    <Select
                      value={internacaoData.tipo}
                      onChange={(e: any) => setInternacaoData({ ...internacaoData, tipo: e.target.value })}
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="internacao">Internação Clínica</option>
                      <option value="cirurgia">Procedimento Cirúrgico</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Motivo / Hipótese Diagnóstica *</Label>
                    <Input
                      type="text"
                      value={internacaoData.motivo}
                      onChange={(e: any) => setInternacaoData({ ...internacaoData, motivo: e.target.value })}
                      placeholder="Ex: Insuficiência Respiratória"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Detalhes do Quadro Clínico *</Label>
                  <Textarea
                    value={internacaoData.detalhes}
                    onChange={(e: any) => setInternacaoData({ ...internacaoData, detalhes: e.target.value })}
                    rows={3}
                    placeholder="Descreva detalhadamente a necessidade de internação..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Laudo Médico Justificativo *</Label>
                  <Textarea
                    value={internacaoData.laudoMedico}
                    onChange={(e: any) => setInternacaoData({ ...internacaoData, laudoMedico: e.target.value })}
                    rows={4}
                    placeholder="Laudo técnico para análise da regulação hospitalar..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Observações Gerais</Label>
                  <Textarea
                    value={internacaoData.observacoes}
                    onChange={(e: any) => setInternacaoData({ ...internacaoData, observacoes: e.target.value })}
                    rows={2}
                    placeholder="Informações logísticas ou adicionais..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInternacaoModal(false)}
                    className="px-6 py-2.5 text-xs font-bold text-[#5C7A9B] hover:bg-[#F8FAFD] rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSolicitandoInternacao}
                    className="flex items-center gap-2 px-8 py-2.5 bg-[#B91C1C] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSolicitandoInternacao ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Confirmar Internação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FuncionarioPatientActionModals;
