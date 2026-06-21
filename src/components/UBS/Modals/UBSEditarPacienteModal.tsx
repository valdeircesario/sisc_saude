import React from "react";
import { Modal } from "./UBSModalBase";
import { User, MapPin, Phone, CreditCard, Save } from "lucide-react";

export const UBSEditarPacienteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedPaciente: any;
  pacienteEditData: any;
  setPacienteEditData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedPaciente,
  pacienteEditData,
  setPacienteEditData,
  onSubmit,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Atualizar Cadastro"
      size="md"
    >
      <div className="space-y-8">
        {/* Patient Header Info */}
        {selectedPaciente && (
          <div className="flex items-center gap-4 p-5 bg-blue-50/50 border border-blue-100 rounded-[24px]">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-blue-200 shadow-sm flex-shrink-0">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 truncate">
                {selectedPaciente.nome}
              </h4>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" /> CPF: {selectedPaciente.cpf}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Endereço */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-blue-500" /> Endereço Residencial <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={pacienteEditData.endereco}
              onChange={(e) =>
                setPacienteEditData({
                  ...pacienteEditData,
                  endereco: e.target.value,
                })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              placeholder="Rua, Número, Bairro..."
              required
            />
          </div>

          {/* Telefone */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-blue-500" /> Telefone de Contato <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={pacienteEditData.telefone}
              onChange={(e) =>
                setPacienteEditData({
                  ...pacienteEditData,
                  telefone: e.target.value,
                })
              }
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-6 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-12 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
