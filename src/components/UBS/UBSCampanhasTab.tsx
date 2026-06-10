import React from "react";
import { Plus } from "lucide-react";
import { CampanhaCard } from "./UBSCards";

interface UBSCampanhasTabProps {
  campanhas: any[];
  loadingCampanhas: boolean;
  inscricoesPorCampanha: { [key: string]: any[] };
  setShowCampanhaModal: (show: boolean) => void;
  handleEditCampanha: (camp: any) => void;
  handleDeleteCampanha: (id: string) => void;
  openInscricoesModal: (camp: any) => void;
}

export const UBSCampanhasTab: React.FC<UBSCampanhasTabProps> = ({
  campanhas,
  loadingCampanhas,
  inscricoesPorCampanha,
  setShowCampanhaModal,
  handleEditCampanha,
  handleDeleteCampanha,
  openInscricoesModal,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Campanhas</h2>
        <button
          onClick={() => setShowCampanhaModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Campanha
        </button>
      </div>
      {loadingCampanhas ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando campanhas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campanhas?.map((campanha: any) => (
            <CampanhaCard
              key={campanha.id}
              campanha={campanha}
              inscricoes={inscricoesPorCampanha[campanha.id] || []}
              onEdit={handleEditCampanha}
              onDelete={handleDeleteCampanha}
              onInscricoes={openInscricoesModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
