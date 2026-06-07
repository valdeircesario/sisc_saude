
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X } from "lucide-react";

interface PacienteConfirmarAgendamentoModalProps {
  showConfirmarModal: boolean;
  setShowConfirmarModal: (show: boolean) => void;
  selectedItem: any;
  confirmacaoObservacoes: string;
  setConfirmacaoObservacoes: (obs: string) => void;
  handleConfirmarAgendamento: () => void;
  isLoading: boolean;
}

export const PacienteConfirmarAgendamentoModal: React.FC<PacienteConfirmarAgendamentoModalProps> = ({
  showConfirmarModal,
  setShowConfirmarModal,
  selectedItem,
  confirmacaoObservacoes,
  setConfirmacaoObservacoes,
  handleConfirmarAgendamento,
  isLoading,
}) => {
  if (!showConfirmarModal || !selectedItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <Check className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Confirmar Agendamento</h3>
          </div>
          <button onClick={() => setShowConfirmarModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 text-gray-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-xl bg-slate-50 border border-gray-100 p-3 mb-4 text-sm">
          <p className="font-bold text-gray-800">{selectedItem.hospital?.nome || "Hospital"}</p>
          <p className="text-gray-500 text-xs mt-1">
            {(selectedItem.dataAgendada || selectedItem.dataAgendamento) && format(new Date(selectedItem.dataAgendada || selectedItem.dataAgendamento), "dd/MM/yyyy", { locale: ptBR })}
            {(selectedItem.horaAgendada || selectedItem.horaAgendamento) && ` às ${selectedItem.horaAgendada || selectedItem.horaAgendamento}`}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Observações (opcional)</label>
          <textarea value={confirmacaoObservacoes} onChange={(e) => setConfirmacaoObservacoes(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none" rows={3} placeholder="Alguma observação sobre a confirmação..." />
        </div>
        <div className="flex gap-3">
          <button onClick={handleConfirmarAgendamento} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"><Check className="h-4 w-4" /> {isLoading ? "Confirmando..." : "Confirmar"}</button>
          <button onClick={() => setShowConfirmarModal(false)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  );
};
