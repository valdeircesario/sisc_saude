import React from "react";
import { Plus, Users, Search } from "lucide-react";
import { FuncionarioCard } from "./UBSCards";

interface UBSFuncionariosTabProps {
  funcionarios: any[];
  loadingFuncionarios: boolean;
  setShowFuncModal: (show: boolean) => void;
  handleEditFunc: (func: any) => void;
  handleDeleteFunc: (id: string) => void;
}

export const UBSFuncionariosTab: React.FC<UBSFuncionariosTabProps> = ({
  funcionarios,
  loadingFuncionarios,
  setShowFuncModal,
  handleEditFunc,
  handleDeleteFunc,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 shadow-sm">
              <Users className="h-5 w-5 text-teal-600" />
            </div>
            Gestão de Equipe
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 ml-13">
            Controle de funcionários e permissões
          </p>
        </div>

        <button
          onClick={() => setShowFuncModal(true)}
          className="group flex items-center gap-2.5 px-6 py-3 bg-teal-600 text-white rounded-2xl text-sm font-bold hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95"
        >
          <div className="w-5 h-5 rounded-lg bg-teal-500 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-4 h-4 text-white" />
          </div>
          Adicionar Funcionário
        </button>
      </div>

      {loadingFuncionarios ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-600 border-t-transparent mb-4"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sincronizando dados...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {funcionarios?.length > 0 ? (
            funcionarios.map((funcionario: any) => (
              <FuncionarioCard
                key={funcionario.id}
                funcionario={funcionario}
                onEdit={handleEditFunc}
                onDelete={handleDeleteFunc}
              />
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
               <Users className="h-12 w-12 text-gray-200 mb-3" />
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhum funcionário encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
