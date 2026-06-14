import React from "react";
import { Modal } from "./UBSModalBase";
import { User, CreditCard, Phone, Mail, Briefcase, Shield, Key, Plus, Save } from "lucide-react";

export const UBSFuncionarioModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  editingItem: any;
  funcData: any;
  setFuncData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ isOpen, onClose, editingItem, funcData, setFuncData, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Ajustar Cadastro de Equipe" : "Credenciamento de Funcionário"}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-10">
        {/* Seção: Dados Pessoais */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
              <User className="h-4.5 w-4.5 text-teal-600" />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Identificação Civil
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={funcData.nome}
                onChange={(e) => setFuncData({ ...funcData, nome: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                placeholder="Ex: João Silva"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                CPF <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={funcData.cpf}
                onChange={(e) => setFuncData({ ...funcData, cpf: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Telefone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={funcData.telefone}
                onChange={(e) => setFuncData({ ...funcData, telefone: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                E-mail <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={funcData.email}
                onChange={(e) => setFuncData({ ...funcData, email: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
                placeholder="nome@exemplo.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Seção: Dados Profissionais */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
              <Briefcase className="h-4.5 w-4.5 text-teal-600" />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Atribuições Clínicas
            </h4>
          </div>

          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Função Técnica <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {["Médico", "Enfermeiro", "Farmacêutico"].map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setFuncData({ ...funcData, funcao: opcao })}
                  className={`
                    px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                    ${funcData.funcao === opcao
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-100 scale-105"
                      : "bg-white border border-slate-200 text-slate-400 hover:border-teal-500 hover:text-teal-600"
                    }
                  `}
                >
                  {opcao}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 sm:w-1/2">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-teal-500" /> Registro Profissional (CRM/COREM/CRF) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={funcData.crm}
              onChange={(e) => setFuncData({ ...funcData, crm: e.target.value })}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
              placeholder="Ex.: CRM/SP 123456"
              required
            />
          </div>
        </div>

        {/* Seção: Acesso */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
              <Key className="h-4.5 w-4.5 text-teal-600" />
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Credenciais de Acesso
            </h4>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Senha de Segurança {editingItem ? (
                <span className="text-[10px] font-bold text-slate-400 normal-case ml-2">(Opcional se mantiver atual)</span>
              ) : (
                <span className="text-rose-500">*</span>
              )}
            </label>
            <input
              type="password"
              value={funcData.senha}
              onChange={(e) => setFuncData({ ...funcData, senha: e.target.value })}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
              placeholder="••••••••"
              required={!editingItem}
            />
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
            className="w-full sm:w-auto px-12 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2"
          >
            {editingItem ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingItem ? "Atualizar Cadastro" : "Efetivar Credenciamento"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
