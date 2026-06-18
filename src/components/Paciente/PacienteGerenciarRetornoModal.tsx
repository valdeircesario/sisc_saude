import React from "react";
import { X, Clock, AlertCircle, Save, Trash2, Calendar, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PacienteGerenciarRetornoModalProps {
  showModal: boolean;
  onClose: () => void;
  selectedItem: any;
  formRetorno: { dataRetorno: string; observacao: string };
  setFormRetorno: (val: any) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const PacienteGerenciarRetornoModal: React.FC<PacienteGerenciarRetornoModalProps> = ({
  showModal,
  onClose,
  selectedItem,
  formRetorno,
  setFormRetorno,
  onSave,
  onCancel,
}) => {
  const [confirmandoCancelamento, setConfirmandoCancelamento] = React.useState(false);

  if (!showModal || !selectedItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="bg-teal-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl border border-white/30 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Confirmação de Retorno</h3>
              <p className="text-xs text-teal-100 mt-0.5">{selectedItem.especialidade}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-6">
          {confirmandoCancelamento ? (
            <div className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl space-y-4 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h4 className="text-sm font-black text-red-900 uppercase">Confirmar Cancelamento</h4>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                Tem certeza que deseja cancelar este agendamento de retorno? Esta ação é permanente.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmandoCancelamento(false)}
                  className="flex-1 py-3 bg-white text-red-600 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
                 <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Data Agendada</p>
                 <p className="text-base font-bold text-slate-800">
                    {formRetorno.dataRetorno ? format(new Date(formRetorno.dataRetorno), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : "Não informada"}
                 </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Adicionar Observação (Opcional)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                  <textarea
                    rows={2}
                    value={formRetorno.observacao}
                    onChange={(e) => setFormRetorno((p: any) => ({ ...p, observacao: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white transition-all resize-none"
                    placeholder="Deixe um recado para a equipe médica..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" /> Confirmar Retorno
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => setConfirmandoCancelamento(true)}
                  className="w-full py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Cancelar Agendamento de Retorno
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
