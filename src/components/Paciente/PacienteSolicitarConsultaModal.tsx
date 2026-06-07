
import React from "react";
import { Calendar, MapPin, Stethoscope, FileText, X } from "lucide-react";

interface PacienteSolicitarConsultaModalProps {
  showConsultaModal: boolean;
  setShowConsultaModal: (show: boolean) => void;
  consultaData: any;
  setConsultaData: (data: any) => void;
  ubsList: any[];
  handleConsultaSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const PacienteSolicitarConsultaModal: React.FC<
  PacienteSolicitarConsultaModalProps
> = ({
  showConsultaModal,
  setShowConsultaModal,
  consultaData,
  setConsultaData,
  ubsList,
  handleConsultaSubmit,
  isLoading,
}) => {
  if (!showConsultaModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden">
        {/* Cabeçalho com gradiente */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                <Calendar className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Solicitar Consulta</h3>
                <p className="text-xs text-teal-200 mt-0.5">Preencha os dados para agendamento</p>
              </div>
            </div>
            <button
              onClick={() => setShowConsultaModal(false)}
              className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Corpo do formulário */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleConsultaSubmit} className="space-y-5">
            {/* UBS */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-teal-500" />
                Unidade de Saúde (UBS)
              </label>
              <select
                value={consultaData.ubsId}
                onChange={(e) => setConsultaData({ ...consultaData, ubsId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                required
              >
                <option value="">Selecione uma UBS</option>
                {ubsList?.map((ubs: any) => (
                  <option key={ubs.id} value={ubs.id}>{ubs.nome}</option>
                ))}
              </select>
            </div>

            {/* Especialidade */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Stethoscope className="h-3 w-3 text-teal-500" />
                Especialidade
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: "Clínico Geral", icon: "🩺" }, { label: "Cardiologia", icon: "❤️" },
                  { label: "Pediatria", icon: "👶" }, { label: "Ginecologia", icon: "🌸" },
                  { label: "Ortopedia", icon: "🦴" }, { label: "Dermatologia", icon: "🔬" },
                  { label: "Neurologia", icon: "🧠" }, { label: "Oftalmologia", icon: "👁️" },
                  { label: "Odontologia", icon: "🦷" }, { label: "Psicologia", icon: "💬" },
                  { label: "Endocrinologia", icon: "⚗️" }, { label: "Outra", icon: "➕" },
                ].map(({ label, icon }) => {
                  const selected = consultaData.especialidade === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setConsultaData({ ...consultaData, especialidade: label === "Outra" ? "" : label })}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-left transition-all duration-150 hover:-translate-y-0.5 ${selected ? "border-teal-400 bg-teal-50 text-teal-700 shadow-sm shadow-teal-100" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-700"}`}
                    >
                      <span className="text-sm">{icon}</span><span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={consultaData.especialidade}
                  onChange={(e) => setConsultaData({ ...consultaData, especialidade: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                  placeholder="Ou digite outra especialidade..."
                  required
                />
                {consultaData.especialidade && (
                  <button type="button" onClick={() => setConsultaData({ ...consultaData, especialidade: "" })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Motivo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-teal-500" />
                Motivo da Consulta
              </label>
              <textarea
                value={consultaData.motivo}
                onChange={(e) => setConsultaData({ ...consultaData, motivo: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none"
                rows={3}
                placeholder="Descreva brevemente o motivo da consulta, sintomas ou queixa principal..."
                required
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700 hover:-translate-y-0.5 transition-all shadow-sm shadow-teal-200 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Calendar className="h-4 w-4" /> Solicitar Consulta</>}
              </button>
              <button
                type="button"
                onClick={() => setShowConsultaModal(false)}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
