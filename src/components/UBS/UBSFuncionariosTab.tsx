import React from "react";
import { Plus } from "lucide-react";
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Funcionários</h2>
        <button
          onClick={() => setShowFuncModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Funcionário
        </button>
      </div>
      {loadingFuncionarios ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando funcionários...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {funcionarios?.map((funcionario: any) => (
            <FuncionarioCard
              key={funcionario.id}
              funcionario={funcionario}
              onEdit={handleEditFunc}
              onDelete={handleDeleteFunc}
            />
          ))}
        </div>
      )}
    </div>
  );
};
