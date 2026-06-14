import React from "react";
import { Plus, Megaphone } from "lucide-react";
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
              <Megaphone className="h-5 w-5 text-amber-600" />
            </div>
            Campanhas de Saúde
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 ml-13">
            Ações preventivas e vacinação
          </p>
        </div>

        <button
          onClick={() => setShowCampanhaModal(true)}
          className="group flex items-center gap-2.5 px-6 py-3 bg-teal-600 text-white rounded-2xl text-sm font-bold hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95"
        >
          <div className="w-5 h-5 rounded-lg bg-teal-500 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-4 h-4 text-white" />
          </div>
          Criar Campanha
        </button>
      </div>

      {loadingCampanhas ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-600 border-t-transparent mb-4"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sincronizando campanhas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campanhas?.length > 0 ? (
            campanhas.map((campanha: any) => (
              <CampanhaCard
                key={campanha.id}
                campanha={campanha}
                inscricoes={inscricoesPorCampanha[campanha.id] || []}
                onEdit={handleEditCampanha}
                onDelete={handleDeleteCampanha}
                onInscricoes={openInscricoesModal}
              />
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
              <Megaphone className="h-12 w-12 text-gray-100 mb-3" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhuma campanha registrada</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
