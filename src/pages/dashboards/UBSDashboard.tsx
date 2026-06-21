import React from "react";
import { UBSHeader } from "../../components/UBS/UBSHeader";
import { UBSTabs } from "../../components/UBS/UBSTabs";
import { UBSFuncionariosTab } from "../../components/UBS/UBSFuncionariosTab";
import { UBSPacientesTab } from "../../components/UBS/UBSPacientesTab";
import { UBSCampanhasTab } from "../../components/UBS/UBSCampanhasTab";
import { UBSConsultasTab } from "../../components/UBS/UBSConsultasTab";
import { UBSMedicamentosTab } from "../../components/UBS/UBSMedicamentosTab";
import { UBSFuncionarioModal } from "../../components/UBS/Modals/UBSFuncionarioModal";
import { UBSCampanhaModal } from "../../components/UBS/Modals/UBSCampanhaModal";
import { UBSEditCampanhaModal } from "../../components/UBS/Modals/UBSEditCampanhaModal";
import { UBSInscricoesCampanhaModal } from "../../components/UBS/Modals/UBSInscricoesCampanhaModal";
import { UBSMedicamentoModal } from "../../components/UBS/Modals/UBSMedicamentoModal";
import { UBSAgendamentoModal } from "../../components/UBS/Modals/UBSAgendamentoModal";
import { UBSEditarPacienteModal } from "../../components/UBS/Modals/UBSEditarPacienteModal";
import { UBSCancelamentoConsultaModal } from "../../components/UBS/Modals/UBSCancelamentoConsultaModal";
import { UBSHistoricoPacienteModal } from "../../components/UBS/Modals/UBSHistoricoPacienteModal";
import { UBSAgendarConsultaPacienteModal } from "../../components/UBS/Modals/UBSAgendarConsultaPacienteModal";
import { UBSAgendamentoCampanhaModal } from "../../components/UBS/Modals/UBSAgendamentoCampanhaModal";
import { UBSSolicitarInternacaoModal } from "../../components/UBS/Modals/UBSSolicitarInternacaoModal";
import { useUBSDashboard } from "../../hooks/useUBSDashboard";

const UBSDashboard: React.FC = () => {
  const {
    user,
    logout,
    activeTab,
    setActiveTab,
    showFuncModal,
    setShowFuncModal,
    showCampanhaModal,
    setShowCampanhaModal,
    showAgendamentoModal,
    setShowAgendamentoModal,
    showCancelamentoModal,
    setShowCancelamentoModal,
    showPacienteModal,
    setShowPacienteModal,
    showHistoricoModal,
    setShowHistoricoModal,
    showInscricoesModal,
    setShowInscricoesModal,
    showAgendamentoCampanhaModal,
    setShowAgendamentoCampanhaModal,
    showConsultaPacienteModal,
    setShowConsultaPacienteModal,
    showEditCampanhaModal,
    setShowEditCampanhaModal,
    showInternacaoModal,
    setShowInternacaoModal,
    showMedModal,
    setShowMedModal,
    editingItem,
    editingCampanha,
    editingMed,
    medData,
    setMedData,
    selectedConsulta,
    selectedPaciente,
    selectedCampanha,
    inscricoesPorCampanha,
    selectedInscricao,
    searchTerm,
    setSearchTerm,
    consultaSearchTerm,
    setConsultaSearchTerm,
    consultaStatusFilter,
    setConsultaStatusFilter,
    funcData,
    setFuncData,
    campanhaData,
    setCampanhaData,
    agendamentoData,
    setAgendamentoData,
    cancelamentoData,
    setCancelamentoData,
    pacienteEditData,
    setPacienteEditData,
    consultaPacienteData,
    setConsultaPacienteData,
    agendamentoCampanhaData,
    setAgendamentoCampanhaData,
    editCampanhaData,
    setEditCampanhaData,
    internacaoData,
    setInternacaoData,
    
    // Data
    funcionarios,
    loadingFuncionarios,
    pacientes,
    loadingPacientes,
    historicoPaciente,
    consultasPaciente,
    inscricoesCampanha,
    campanhas,
    loadingCampanhas,
    consultas,
    loadingConsultas,
    filteredConsultas,
    hospitaisList,
    loadingHospitais,
    hospitaisError,
    medicamentos,
    loadingMedicamentos,
    
    // Mutations
    solicitarInternacaoMutation,
    
    // Handlers
    handleFuncSubmit,
    handleCampanhaSubmit,
    handleEditCampanhaSubmit,
    handleAgendamentoSubmit,
    handleCancelamentoSubmit,
    handlePacienteEditSubmit,
    handleConsultaPacienteSubmit,
    handleAgendamentoCampanhaSubmit,
    handleInternacaoSubmit,
    handleMedSubmit,
    handleEditMed,
    handleEditFunc,
    handleEditCampanha,
    handleDeleteFunc,
    handleDeleteCampanha,
    openAgendamentoModal,
    openCancelamentoModal,
    openPacienteModal,
    openHistoricoModal,
    openInscricoesModal,
    openAgendamentoCampanhaModal,
    openConsultaPacienteModal,
    openInternacaoModal,
    resetMedForm,
  } = useUBSDashboard();

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <UBSHeader userNome={user?.nome} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <UBSTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="animate-in fade-in zoom-in-95 duration-500">
          {/* Funcionários Tab */}
          {activeTab === "funcionarios" && (
            <UBSFuncionariosTab
              funcionarios={funcionarios || []}
              loadingFuncionarios={loadingFuncionarios}
              setShowFuncModal={setShowFuncModal}
              handleEditFunc={handleEditFunc}
              handleDeleteFunc={handleDeleteFunc}
            />
          )}

          {/* Pacientes Tab */}
          {activeTab === "pacientes" && (
            <UBSPacientesTab
              pacientes={pacientes || []}
              loadingPacientes={loadingPacientes}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              openPacienteModal={openPacienteModal}
              openHistoricoModal={openHistoricoModal}
              openConsultaPacienteModal={openConsultaPacienteModal}
              openInternacaoModal={openInternacaoModal}
            />
          )}

          {/* Campanhas Tab */}
          {activeTab === "campanhas" && (
            <UBSCampanhasTab
              campanhas={campanhas || []}
              loadingCampanhas={loadingCampanhas}
              inscricoesPorCampanha={inscricoesPorCampanha}
              setShowCampanhaModal={setShowCampanhaModal}
              handleEditCampanha={handleEditCampanha}
              handleDeleteCampanha={handleDeleteCampanha}
              openInscricoesModal={openInscricoesModal}
            />
          )}

          {/* Consultas Tab */}
          {activeTab === "consultas" && (
            <UBSConsultasTab
              filteredConsultas={filteredConsultas}
              loadingConsultas={loadingConsultas}
              consultaSearchTerm={consultaSearchTerm}
              setConsultaSearchTerm={setConsultaSearchTerm}
              consultaStatusFilter={consultaStatusFilter}
              setConsultaStatusFilter={setConsultaStatusFilter}
              openAgendamentoModal={openAgendamentoModal}
              openCancelamentoModal={openCancelamentoModal}
            />
          )}

          {/* Medicamentos Tab */}
          {activeTab === "medicamentos" && (
            <UBSMedicamentosTab
              medicamentos={medicamentos || []}
              loadingMedicamentos={loadingMedicamentos}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              resetMedForm={resetMedForm}
              setShowMedModal={setShowMedModal}
              handleEditMed={handleEditMed}
            />
          )}
        </main>

        {/* Modal de Funcionário */}
        <UBSFuncionarioModal
          isOpen={showFuncModal}
          onClose={() => setShowFuncModal(false)}
          editingItem={editingItem}
          funcData={funcData}
          setFuncData={setFuncData}
          onSubmit={handleFuncSubmit}
        />

        {/* Modal de Campanha */}
        <UBSCampanhaModal
          isOpen={showCampanhaModal}
          onClose={() => setShowCampanhaModal(false)}
          campanhaData={campanhaData}
          setCampanhaData={setCampanhaData}
          onSubmit={handleCampanhaSubmit}
        />

        {/* Modal de Editar Campanha */}
        <UBSEditCampanhaModal
          isOpen={showEditCampanhaModal}
          onClose={() => setShowEditCampanhaModal(false)}
          editCampanhaData={editCampanhaData}
          setEditCampanhaData={setEditCampanhaData}
          onSubmit={handleEditCampanhaSubmit}
        />

        {/* Modal de Medicamento */}
        <UBSMedicamentoModal
          isOpen={showMedModal}
          onClose={() => setShowMedModal(false)}
          editingMed={editingMed}
          medData={medData}
          setMedData={setMedData}
          onSubmit={handleMedSubmit}
        />

        {/* Modal de Agendamento de Consulta */}
        <UBSAgendamentoModal
          isOpen={showAgendamentoModal}
          onClose={() => setShowAgendamentoModal(false)}
          selectedConsulta={selectedConsulta}
          agendamentoData={agendamentoData}
          setAgendamentoData={setAgendamentoData}
          funcionarios={funcionarios || []}
          onSubmit={handleAgendamentoSubmit}
        />

        {/* Modal de Editar Paciente */}
        <UBSEditarPacienteModal
          isOpen={showPacienteModal}
          onClose={() => setShowPacienteModal(false)}
          selectedPaciente={selectedPaciente}
          pacienteEditData={pacienteEditData}
          setPacienteEditData={setPacienteEditData}
          onSubmit={handlePacienteEditSubmit}
        />

        {/* Modal de Cancelamento de Consulta */}
        <UBSCancelamentoConsultaModal
          isOpen={showCancelamentoModal}
          onClose={() => setShowCancelamentoModal(false)}
          selectedConsulta={selectedConsulta}
          cancelamentoData={cancelamentoData}
          setCancelamentoData={setCancelamentoData}
          onSubmit={handleCancelamentoSubmit}
        />

        {/* Modal de Histórico do Paciente */}
        <UBSHistoricoPacienteModal
          isOpen={showHistoricoModal}
          onClose={() => setShowHistoricoModal(false)}
          selectedPaciente={selectedPaciente}
          historicoPaciente={historicoPaciente || []}
          consultasPaciente={consultasPaciente || []}
        />

        {/* Modal de Agendar Consulta para Paciente */}
        <UBSAgendarConsultaPacienteModal
          isOpen={showConsultaPacienteModal}
          onClose={() => setShowConsultaPacienteModal(false)}
          selectedPaciente={selectedPaciente}
          consultaPacienteData={consultaPacienteData}
          setConsultaPacienteData={setConsultaPacienteData}
          funcionarios={funcionarios || []}
          onSubmit={handleConsultaPacienteSubmit}
        />

        {/* Modal de Inscrições da Campanha */}
        <UBSInscricoesCampanhaModal
          isOpen={showInscricoesModal}
          onClose={() => setShowInscricoesModal(false)}
          selectedCampanha={selectedCampanha}
          inscricoesCampanha={inscricoesCampanha || []}
          openAgendamentoCampanhaModal={openAgendamentoCampanhaModal}
        />

        {/* Modal de Agendamento de Campanha */}
        <UBSAgendamentoCampanhaModal
          isOpen={showAgendamentoCampanhaModal}
          onClose={() => setShowAgendamentoCampanhaModal(false)}
          selectedInscricao={selectedInscricao}
          selectedCampanha={selectedCampanha}
          agendamentoCampanhaData={agendamentoCampanhaData}
          setAgendamentoCampanhaData={setAgendamentoCampanhaData}
          onSubmit={handleAgendamentoCampanhaSubmit}
        />

        {/* Modal de Solicitação de Internação */}
        <UBSSolicitarInternacaoModal
          isOpen={showInternacaoModal}
          onClose={() => setShowInternacaoModal(false)}
          selectedPaciente={selectedPaciente}
          internacaoData={internacaoData}
          setInternacaoData={setInternacaoData}
          hospitaisList={hospitaisList || []}
          loadingHospitais={loadingHospitais}
          hospitaisError={hospitaisError}
          funcionarios={funcionarios || []}
          solicitarInternacaoMutation={solicitarInternacaoMutation}
          onSubmit={handleInternacaoSubmit}
        />
      </div>
    </div>
  );
};

export default UBSDashboard;
