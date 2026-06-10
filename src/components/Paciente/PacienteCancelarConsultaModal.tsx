
import React from "react";
import { X, Stethoscope, MapPin, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PacienteCancelarConsultaModalProps {
  showCancelarModal: boolean;
  setShowCancelarModal: (show: boolean) => void;
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  motivoCancelamento: string;
  setMotivoCancelamento: (motivo: string) => void;
  handleCancelarConsulta: () => void;
  isLoading: boolean;
}

export const PacienteCancelarConsultaModal: React.FC<
  PacienteCancelarConsultaModalProps
> = ({
  showCancelarModal,
  setShowCancelarModal,
  selectedItem,
  setSelectedItem,
  motivoCancelamento,
  setMotivoCancelamento,
  handleCancelarConsulta,
  isLoading,
}) => {
  if (!showCancelarModal || !selectedItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                <X className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Cancelar Consulta
                </h3>
                <p className="text-xs text-rose-200 mt-0.5">
                  Esta ação não poderá ser desfeita
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowCancelarModal(false);
                setSelectedItem(null);
                setMotivoCancelamento("");
              }}
              className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Resumo da consulta */}
          <div className="rounded-xl bg-slate-50 border border-gray-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Consulta selecionada
            </p>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-sm font-bold text-gray-800">
                {selectedItem.especialidade}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500">{selectedItem.ubs?.nome}</p>
            </div>
            {selectedItem.dataAgendada && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  {format(new Date(selectedItem.dataAgendada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {/* Campo de motivo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-rose-400" />
              Motivo do Cancelamento
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all resize-none"
              rows={3}
              placeholder="Descreva o motivo do cancelamento..."
              required
            />
            <p className="text-xs text-gray-400">
              O motivo será registrado no histórico da consulta.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancelarConsulta}
              disabled={isLoading || !motivoCancelamento.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-rose-100 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <X className="h-3.5 w-3.5" />
                  Confirmar Cancelamento
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowCancelarModal(false);
                setSelectedItem(null);
                setMotivoCancelamento("");
              }}
              className="flex flex-1 items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-slate-200 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
