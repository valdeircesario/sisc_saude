import React from "react";
import { 
  FileText, 
  FlaskConical, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { LaboratorioHeader } from "../../components/Laboratorio/LaboratorioHeader";
import { LaboratorioSidebar } from "../../components/Laboratorio/LaboratorioSidebar";
import { LaboratorioSolicitacoesTab } from "../../components/Laboratorio/LaboratorioSolicitacoesTab";
import { LaboratorioExamesTab } from "../../components/Laboratorio/LaboratorioExamesTab";
import { LaboratorioModals } from "../../components/Laboratorio/LaboratorioModals";
import { useLaboratorioDashboard } from "../../hooks/useLaboratorioDashboard";

const LaboratorioDashboard: React.FC = () => {
  const {
    user,
    logout,
    activeTab,
    setActiveTab,
    solicitacoes,
    loadingSolicitacoes,
    exames,
    loadingExames,
    showAgendamentoModal,
    setShowAgendamentoModal,
    selectedSolicitacao,
    setSelectedSolicitacao,
    agendamentoData,
    setAgendamentoData,
    handleAgendamentoSubmit,
    resetAgendamentoForm,
    showResultadoModal,
    setShowResultadoModal,
    selectedExame,
    setSelectedExame,
    resultadoData,
    setResultadoData,
    handleResultadoSubmit,
    resetResultadoForm,
    openAgendamentoModal,
    openResultadoModal,
  } = useLaboratorioDashboard();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-sky-100 text-sky-700 border border-sky-200";
      case "realizado": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "pendente": return "bg-amber-100 text-amber-700 border border-amber-200";
      case "cancelado": return "bg-rose-100 text-rose-700 border border-rose-200";
      default: return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "realizado": return <CheckCircle className="h-3.5 w-3.5" />;
      case "agendado": return <Clock className="h-3.5 w-3.5" />;
      case "pendente": return <AlertCircle className="h-3.5 w-3.5" />;
      default: return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const navigation = [
    { name: "Solicitações", key: "solicitacoes", icon: FileText },
    { name: "Exames realizados", key: "exames", icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <LaboratorioHeader userNome={user?.nome} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <LaboratorioSidebar
            navigation={navigation}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="flex-1">
            {activeTab === "solicitacoes" && (
              <LaboratorioSolicitacoesTab
                loading={loadingSolicitacoes}
                solicitacoes={solicitacoes}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                onOpenAgendamento={openAgendamentoModal}
              />
            )}

            {activeTab === "exames" && (
              <LaboratorioExamesTab
                loading={loadingExames}
                exames={exames}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                onOpenResultado={openResultadoModal}
              />
            )}
          </div>
        </div>
      </div>

      <LaboratorioModals
        showAgendamentoModal={showAgendamentoModal}
        setShowAgendamentoModal={setShowAgendamentoModal}
        selectedSolicitacao={selectedSolicitacao}
        setSelectedSolicitacao={setSelectedSolicitacao}
        agendamentoData={agendamentoData}
        setAgendamentoData={setAgendamentoData}
        handleAgendamentoSubmit={handleAgendamentoSubmit}
        resetAgendamentoForm={resetAgendamentoForm}
        showResultadoModal={showResultadoModal}
        setShowResultadoModal={setShowResultadoModal}
        selectedExame={selectedExame}
        setSelectedExame={setSelectedExame}
        resultadoData={resultadoData}
        setResultadoData={setResultadoData}
        handleResultadoSubmit={handleResultadoSubmit}
        resetResultadoForm={resetResultadoForm}
      />
    </div>
  );
};

export default LaboratorioDashboard;
