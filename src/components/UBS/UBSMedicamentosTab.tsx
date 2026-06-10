import React from "react";
import { Plus, Search } from "lucide-react";
import { MedicamentoCard } from "./UBSCards";

interface UBSMedicamentosTabProps {
  medicamentos: any[];
  loadingMedicamentos: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resetMedForm: () => void;
  setShowMedModal: (show: boolean) => void;
  handleEditMed: (med: any) => void;
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Medicamentos</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
          <button
            onClick={() => {
              resetMedForm();
              setShowMedModal(true);
            }}
            className="
              inline-flex items-center justify-center
              bg-gradient-to-r from-green-950 to-emerald-700
              hover:from-green-700 hover:to-emerald-700
              text-white font-medium
              px-6 py-2.5
              rounded-xl
              shadow-sm hover:shadow-md
              transition-all duration-200
              active:scale-[0.98]
              whitespace-nowrap
            "
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Medicamento
          </button>

          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar medicamentos..."
              className="
                w-full
                pl-12 pr-4 py-3
                rounded-xl
                border border-gray-200
                bg-white/90
                text-gray-700
                placeholder:text-gray-400
                shadow-sm
                transition-all duration-200
                focus:outline-none
                focus:ring-2 focus:ring-blue-500/30
                focus:border-blue-500
                hover:border-gray-300
              "
            />
          </div>
        </div>
      </div>
      {loadingMedicamentos ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando medicamentos...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {medicamentos
            ?.filter(
              (med: any) =>
                med.nome
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                med.descricao
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()),
            )
            .map((med: any) => (
              <MedicamentoCard
                key={med.id}
                medicamento={med}
                onEdit={handleEditMed}
              />
            ))}
        </div>
      )}
    </div>
  );
};
