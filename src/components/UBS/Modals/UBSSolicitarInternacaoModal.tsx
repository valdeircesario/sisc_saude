import React from "react";
import { Send, User, Building2, Briefcase, Activity, AlertTriangle, FileText, ClipboardList, CreditCard } from "lucide-react";
import { Modal } from "./UBSModalBase";

export const UBSSolicitarInternacaoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedPaciente: any;
  internacaoData: any;
  setInternacaoData: (data: any) => void;
  hospitaisList: any[];
  loadingHospitais: boolean;
  hospitaisError: any;
  funcionarios: any[];
  solicitarInternacaoMutation: any;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedPaciente,
  internacaoData,
  setInternacaoData,
  hospitaisList,
  loadingHospitais,
  hospitaisError,
  funcionarios,
  solicitarInternacaoMutation,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitação de Encaminhamento Hospitalar"
      size="xl"
    >
      <div className="space-y-8">
        {/* Patient Clinical Info */}
        {selectedPaciente && (
          <div className="flex items-center gap-4 p-5 bg-rose-50/30 border border-rose-100 rounded-[24px]">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-rose-200 shadow-sm flex-shrink-0">
              <User className="h-6 w-6 text-rose-600" />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Paciente</p>
                <h4 className="text-sm font-black text-slate-900 mt-1 truncate">
                  {selectedPaciente.nome}
                </h4>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">CPF</p>
                <h4 className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" /> {selectedPaciente.cpf}
                </h4>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">CNS</p>
                <h4 className="text-xs font-bold text-slate-700 mt-1">
                  {selectedPaciente.cns || "—"}
                </h4>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Destination & Responsibility Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-[24px] border border-slate-100">
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-rose-500" /> Hospital de Destino <span className="text-rose-500">*</span>
                </label>
                <select
                  value={internacaoData.hospitalId}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      hospitalId: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm appearance-none"
                  required
                >
                  <option value="">Selecione a Unidade Hospitalar</option>
                  {loadingHospitais ? (
                    <option disabled>Carregando rede hospitalar...</option>
                  ) : hospitaisError ? (
                    <option disabled>Erro na conexão com a rede</option>
                  ) : (
                    hospitaisList?.map((hospital: any) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.nome}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-rose-500" /> Profissional Solicitante <span className="text-rose-500">*</span>
                </label>
                <select
                  value={internacaoData.funcionarioId}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      funcionarioId: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm appearance-none"
                  required
                >
                  <option value="">Selecione o profissional</option>
                  {funcionarios?.map((func: any) => (
                    <option key={func.id} value={func.id}>
                      {func.nome} ({func.funcao})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-rose-500" /> Tipo de Encaminhamento <span className="text-rose-500">*</span>
                </label>
                <select
                  value={internacaoData.tipo}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      tipo: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm appearance-none"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="internacao">Internação Clínica</option>
                  <option value="cirurgia">Intervenção Cirúrgica</option>
                  <option value="procedimento">Procedimento Especializado</option>
                  <option value="emergencia">Emergência / Urgência</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Nível de Prioridade <span className="text-rose-500">*</span>
                </label>
                <select
                  value={internacaoData.prioridade}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      prioridade: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm appearance-none"
                  required
                >
                  <option value="baixa">Baixa (Eletivo)</option>
                  <option value="media">Média (Monitorado)</option>
                  <option value="alta">Alta (Urgência)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clinical Justification Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ClipboardList className="h-3.5 w-3.5 text-rose-500" /> Motivo Principal / HD <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={internacaoData.motivo}
                onChange={(e) =>
                  setInternacaoData({
                    ...internacaoData,
                    motivo: e.target.value,
                  })
                }
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                placeholder="Hipótese diagnóstica ou motivo principal"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-rose-500" /> Detalhes Clínicos <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={internacaoData.detalhes}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      detalhes: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[20px] text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm min-h-[120px] resize-none"
                  placeholder="Quadro atual, sintomas e sinais vitais..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-rose-500" /> Laudo Justificativo <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={internacaoData.laudoMedico}
                  onChange={(e) =>
                    setInternacaoData({
                      ...internacaoData,
                      laudoMedico: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[20px] text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm min-h-[120px] resize-none"
                  placeholder="Fundamentação médica para o encaminhamento..."
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={solicitarInternacaoMutation.isLoading}
              className="w-full sm:w-auto px-10 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {solicitarInternacaoMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Enviar Solicitação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
