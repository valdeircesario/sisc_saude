
import React from "react";
import { Edit, Save, X } from "lucide-react";

interface PacienteEditarPerfilModalProps {
  showEditarPerfilModal: boolean;
  setShowEditarPerfilModal: (show: boolean) => void;
  perfilData: any;
  setPerfilData: (data: any) => void;
  handleAtualizarPerfil: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const PacienteEditarPerfilModal: React.FC<PacienteEditarPerfilModalProps> = ({
  showEditarPerfilModal,
  setShowEditarPerfilModal,
  perfilData,
  setPerfilData,
  handleAtualizarPerfil,
  isLoading,
}) => {
  if (!showEditarPerfilModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
              <Edit className="h-4 w-4 text-teal-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Editar Perfil</h3>
          </div>
          <button onClick={() => setShowEditarPerfilModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleAtualizarPerfil} className="space-y-4">
          {[
            { label: "Endereço", key: "endereco", type: "text" },
            { label: "Telefone", key: "telefone", type: "tel" },
            { label: "Email", key: "email", type: "email" },
          ].map(({ label, key, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</label>
              <input type={type} value={perfilData[key] || ""} onChange={(e) => setPerfilData({ ...perfilData, [key]: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition-colors disabled:opacity-50">
              <Save className="h-4 w-4" /> {isLoading ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setShowEditarPerfilModal(false)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
