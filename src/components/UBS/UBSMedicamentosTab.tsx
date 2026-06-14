import React from "react";
import { Plus, Pill, Search, Filter, Package } from "lucide-react";
import { MedicamentoCard } from "./UBSCards";

interface UBSMedicamentosTabProps {
  medicamentos: any[];
  loadingMedicamentos: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resetMedForm: () => void;
  setShowMedModal: (show: boolean) => void;
  handleEditMed: (medicamento: any) => void;
}

export const UBSMedicamentosTab: React.FC<UBSMedicamentosTabProps> = ({
  medicamentos,
  loadingMedicamentos,
  searchTerm,
  setSearchTerm,
  resetMedForm,
  setShowMedModal,
  handleEditMed,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100 shadow-sm">
              <Pill className="h-5 w-5 text-violet-600" />
            </div>
            Farmácia / Insumos
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 ml-13">
            Controle de estoque e dispensação
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm shadow-gray-100/50"
              placeholder="Nome do medicamento..."
            />
          </div>

          <button
            onClick={() => {
              resetMedForm();
              setShowMedModal(true);
            }}
            className="group flex items-center justify-center gap-2.5 px-6 py-3 bg-teal-600 text-white rounded-2xl text-sm font-bold hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 w-full sm:w-auto"
          >
            <div className="w-5 h-5 rounded-lg bg-teal-500 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus className="w-4 h-4 text-white" />
            </div>
            Entrada de Estoque
          </button>
        </div>
      </div>

      {loadingMedicamentos ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-600 border-t-transparent mb-4"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Inventariando estoque...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicamentos?.length > 0 ? (
            medicamentos.map((medicamento: any) => (
              <MedicamentoCard
                key={medicamento.id}
                medicamento={medicamento}
                onEdit={handleEditMed}
              />
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
              <Package className="h-12 w-12 text-gray-100 mb-3" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Estoque vazio ou não encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
