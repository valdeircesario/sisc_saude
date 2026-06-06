import React from "react";
import { Modal } from "./UBSModalBase";

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
      title={editingItem ? "Editar Funcionário" : "Novo Funcionário"}
      size="lg"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Seção: Dados pessoais */}
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
          Dados pessoais
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={funcData.nome}
              onChange={(e) => setFuncData({ ...funcData, nome: e.target.value })}
              placeholder="Ex.: João Silva"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              CPF <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={funcData.cpf}
              onChange={(e) => setFuncData({ ...funcData, cpf: e.target.value })}
              placeholder="000.000.000-00"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={funcData.telefone}
              onChange={(e) => setFuncData({ ...funcData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={funcData.email}
              onChange={(e) => setFuncData({ ...funcData, email: e.target.value })}
              placeholder="nome@exemplo.com"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Seção: Dados profissionais */}
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
          Dados profissionais
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600">
            Função <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {["Médico", "Enfermeiro", "Farmacêutico"].map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setFuncData({ ...funcData, funcao: opcao })}
                className={`px-4 py-1.5 rounded-full text-xs border transition-colors ${
                  funcData.funcao === opcao
                    ? "bg-green-100 border-green-600 text-green-800 font-medium"
                    : "bg-white border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-700 hover:bg-green-50"
                }`}
              >
                {opcao}
              </button>
            ))}
          </div>
          <input type="hidden" value={funcData.funcao} required />
        </div>

        <div className="flex flex-col gap-1.5 w-1/2">
          <label className="text-xs font-medium text-gray-600">
            CRM <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={funcData.crm}
            onChange={(e) => setFuncData({ ...funcData, crm: e.target.value })}
            placeholder="Ex.: CRM/SP 123456"
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <hr className="border-gray-100" />

        {/* Seção: Acesso ao sistema */}
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
          Acesso ao sistema
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-600">
            Senha{" "}
            {editingItem ? (
              <span className="text-gray-400 font-normal">
                (deixe em branco para manter a atual)
              </span>
            ) : (
              <span className="text-red-500">*</span>
            )}
          </label>
          <input
            type="password"
            value={funcData.senha}
            onChange={(e) => setFuncData({ ...funcData, senha: e.target.value })}
            placeholder="Mínimo 8 caracteres"
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required={!editingItem}
          />
          <span className="text-xs text-gray-400">
            Use letras, números e símbolos para uma senha forte.
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
          >
            {editingItem ? "Atualizar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
