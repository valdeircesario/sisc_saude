import React from "react";
import { Modal } from "./UBSModalBase";
import { AlertCircle, Calendar, User, Stethoscope, MessageSquare } from "lucide-react";

export const UBSCancelamentoConsultaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedConsulta: any;
  cancelamentoData: any;
  setCancelamentoData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedConsulta,
  cancelamentoData,
  setCancelamentoData,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancelar Agendamento"
      size="md"
    >
      <div className="space-y-8">
        {/* Warning Header */}
        <div className="flex items-start gap-4 p-5 bg-rose-50 border border-rose-100 rounded-[20px]">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-rose-200 shadow-sm flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">Atenção</h4>
            <p className="text-xs font-medium text-rose-700 leading-relaxed mt-1">
              Ao cancelar esta consulta, o horário será liberado no sistema. Esta ação não poderá ser desfeita.
            </p>
          </div>
        </div>

        {/* Consulta Brief */}
        {selectedConsulta && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[20px] border border-slate-100">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Paciente
                </p>
                <p className="text-sm font-bold text-slate-900">{selectedConsulta.paciente?.nome}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Stethoscope className="h-3 w-3" /> Especialidade
                </p>
                <p className="text-sm font-bold text-slate-900">{selectedConsulta.especialidade || "Geral"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Data Solicitada
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedConsulta.createdAt ? new Date(selectedConsulta.createdAt).toLocaleDateString('pt-BR') : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Queixa Inicial
                </p>
                <p className="text-sm font-medium text-slate-600 italic line-clamp-2">"{selectedConsulta.motivo}"</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
              Motivo do Cancelamento <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={cancelamentoData.observacoes}
              onChange={(e) =>
                setCancelamentoData({
                  ...cancelamentoData,
                  observacoes: e.target.value,
                })
              }
              required
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[20px] text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm min-h-[120px] resize-none"
              placeholder="Descreva brevemente o motivo do cancelamento para o prontuário..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95"
            >
              Confirmar Cancelamento
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
