import React from "react";
import ReceitasAtestado from "../../components/receitasAtestado";
import FuncionarioPacientesTab from "../../components/Funcionario/FuncionarioPacientesTab";
import FuncionarioMedicamentosTab from "../../components/Funcionario/FuncionarioMedicamentosTab";
import FuncionarioMedicationModals from "../../components/Funcionario/FuncionarioMedicationModals";
import FuncionarioConsultarReceitaTab from "../../components/Funcionario/FuncionarioConsultarReceitaTab";
import FuncionarioConsultasTab from "../../components/Funcionario/FuncionarioConsultasTab";
import FuncionarioConsultaModals from "../../components/Funcionario/FuncionarioConsultaModals";
import FuncionarioHistoricoTab from "../../components/Funcionario/FuncionarioHistoricoTab";
import FuncionarioHistoricoModals from "../../components/Funcionario/FuncionarioHistoricoModals";
import FuncionarioSolicitacoesTab from "../../components/Funcionario/FuncionarioSolicitacoesTab";
import FuncionarioExamesTab from "../../components/Funcionario/FuncionarioExamesTab";
import FuncionarioPatientActionModals from "../../components/Funcionario/FuncionarioPatientActionModals";
import FuncionarioDispensacaoModals from "../../components/Funcionario/FuncionarioDispensacaoModals";
import { FuncionarioHeader } from "../../components/Funcionario/FuncionarioHeader";
import { FuncionarioSidebar } from "../../components/Funcionario/FuncionarioSidebar";
import { useFuncionarioDashboard } from "../../hooks/useFuncionarioDashboard";

const FuncionarioDashboard: React.FC = () => {
  const {
    user,
    logout,
    activeTab,
    setActiveTab,
    navigation,
    handleTabChange,
    isMedico,
    isEnfermagemOuFarmacia,
    pacientes,
    loadingPacientes,
    searchTerm,
    setSearchTerm,
    selectedPaciente,
    setSelectedPaciente,
    loadingMedicamentos,
    medicamentosDaUbs,
    handleEditMed,
    openAdministrarMed,
    showAdministradorMedicamentoModal,
    selectedAdminPaciente,
    resetAdministracaoForm,
    medSearchTerm,
    setMedSearchTerm,
    filteredMedicamentos,
    editingMed,
    resetMedForm,
    medData,
    setMedData,
    handleMedSubmit,
    isUpdatingMed,
    selectedMed,
    administracaoData,
    setAdministracaoData,
    handleAdministrarSubmit,
    isAdministrandoMed,
    cnsBuscaTerm,
    setCnsBuscaTerm,
    isBuscandoPacienteCns,
    buscarPacientePorCns,
    historicoBuscaResultado,
    setShowBuscaHistoricoModal,
    abrirDetalheHistorico,
    historicoPaciente,
    showBuscaHistoricoModal,
    handleBuscarHistoricoPorCpf,
    cpfHistoricoBusca,
    setCpfHistoricoBusca,
    isBuscandoHistorico,
    registroHistoricoDetalhe,
    setRegistroHistoricoDetalhe,
    solicitacoesFiltroPaciente,
    setSolicitacoesFiltroPaciente,
    solicitacoesFiltroTipo,
    setSolicitacoesFiltroTipo,
    pacientesSolicitacoes,
    filteredSolicitacoes,
    getStatusColor,
    getPrioridadeColor,
    receitaEncontrada,
    handleBuscarReceita,
    registroReceitaBusca,
    setRegistroReceitaBusca,
    buscarReceitaLoading,
    carregandoReceita,
    handleLimparReceita,
    handleValidarDispensacao,
    showDispensacaoModal,
    setShowDispensacaoModal,
    erroDispensacao,
    medicamentosSelecionados,
    setMedicamentosSelecionados,
    handleDispensarMedicamentos,
    isDispensandoMedicamentos,
    showDetalhesDispensacaoModal,
    setShowDetalhesDispensacaoModal,
    loadingConsultas,
    consultas,
    formatConsultaDate,
    getConsultaDisease,
    setShowConsultaDetailsModal,
    showConsultaDetailsModal,
    setModalHistorico,
    modalHistorico,
    handleRegistrarHistorico,
    formHistorico,
    setFormHistorico,
    toggleIncluirReceita,
    toggleIncluirAtestado,
    adicionarMedicamentoEvolucao,
    removerMedicamentoEvolucao,
    atualizarMedicamentoEvolucao,
    loadingHistorico,
    selectedConsulta,
    setSelectedConsulta,
    exameSearchTerm,
    setExameSearchTerm,
    loadingExames,
    filteredExames,
    showHistoricoModal,
    setShowHistoricoModal,
    handleHistoricoSubmit,
    historicoData,
    setHistoricoData,
    isRegistrandoHistorico,
    showVacinaModal,
    setShowVacinaModal,
    handleVacinaSubmit,
    vacinaData,
    setVacinaData,
    isRegistrandoVacina,
    showExameModal,
    setShowExameModal,
    handleExameSubmit,
    exameData,
    setExameData,
    isSolicitandoExame,
    laboratorios,
    showInternacaoModal,
    setShowInternacaoModal,
    handleInternacaoSubmit,
    internacaoData,
    setInternacaoData,
    isSolicitandoInternacao,
    hospitais,
    loadingHospitais,
    hospitaisError,
    openVacinaModal,
    openExameModal,
    openInternacaoModal,
    openAdministrarMedicamentoModal,
  } = useFuncionarioDashboard();

  return (
    <div
      className="min-h-screen bg-[#EEF2F7]"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <FuncionarioHeader
        userNome={user?.nome}
        userFuncao={user?.funcao}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <FuncionarioSidebar
            navigation={navigation}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          <div className="flex-1 min-w-0">
            {activeTab === "pacientes" && (
              <FuncionarioPacientesTab
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loadingPacientes={loadingPacientes}
                pacientes={pacientes}
                isMedico={isMedico}
                openExameModal={openExameModal}
                openInternacaoModal={openInternacaoModal}
                setSelectedPaciente={setSelectedPaciente}
                setActiveTab={setActiveTab}
                isEnfermagemOuFarmacia={isEnfermagemOuFarmacia}
                openVacinaModal={openVacinaModal}
                openAdministrarMedicamentoModal={
                  openAdministrarMedicamentoModal
                }
              />
            )}

            {activeTab === "medicamentos" && (
              <FuncionarioMedicamentosTab
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loadingMedicamentos={loadingMedicamentos}
                medicamentosDaUbs={medicamentosDaUbs}
                handleEditMed={handleEditMed}
                openAdministrarMed={openAdministrarMed}
              />
            )}

            {activeTab === "historico" && (
              <FuncionarioHistoricoTab
                historicoBuscaResultado={historicoBuscaResultado}
                setShowBuscaHistoricoModal={setShowBuscaHistoricoModal}
                abrirDetalheHistorico={abrirDetalheHistorico}
                selectedPaciente={selectedPaciente}
                setActiveTab={setActiveTab}
                historicoPaciente={historicoPaciente}
              />
            )}

            {activeTab === "solicitacoes" && (
              <FuncionarioSolicitacoesTab
                solicitacoesFiltroPaciente={solicitacoesFiltroPaciente}
                setSolicitacoesFiltroPaciente={setSolicitacoesFiltroPaciente}
                solicitacoesFiltroTipo={solicitacoesFiltroTipo}
                setSolicitacoesFiltroTipo={setSolicitacoesFiltroTipo}
                pacientesSolicitacoes={pacientesSolicitacoes}
                filteredSolicitacoes={filteredSolicitacoes}
                getStatusColor={getStatusColor}
                getPrioridadeColor={getPrioridadeColor}
              />
            )}

            {activeTab === "consultar_receita" && (
              <FuncionarioConsultarReceitaTab
                receitaEncontrada={receitaEncontrada}
                handleBuscarReceita={handleBuscarReceita}
                registroReceitaBusca={registroReceitaBusca}
                setRegistroReceitaBusca={setRegistroReceitaBusca}
                buscarReceitaLoading={buscarReceitaLoading}
                carregandoReceita={carregandoReceita}
                handleLimparReceita={handleLimparReceita}
                setShowDetalhesDispensacaoModal={
                  setShowDetalhesDispensacaoModal
                }
                handleValidarDispensacao={handleValidarDispensacao}
                isDispensando={isDispensandoMedicamentos}
                isValidando={carregandoReceita}
              />
            )}

            {activeTab === "receitas" && <ReceitasAtestado />}

            {activeTab === "consultas" && (
              <FuncionarioConsultasTab
                loadingConsultas={loadingConsultas}
                consultas={consultas}
                formatConsultaDate={formatConsultaDate}
                getConsultaDisease={getConsultaDisease}
                setSelectedConsulta={setSelectedConsulta}
                setShowConsultaDetailsModal={setShowConsultaDetailsModal}
                setModalHistorico={setModalHistorico}
              />
            )}

            {activeTab === "exames" && (
              <FuncionarioExamesTab
                exameSearchTerm={exameSearchTerm}
                setExameSearchTerm={setExameSearchTerm}
                loadingExames={loadingExames}
                filteredExames={filteredExames}
              />
            )}

            <FuncionarioMedicationModals
              showAdministradorMedicamentoModal={showAdministradorMedicamentoModal}
              selectedAdminPaciente={selectedAdminPaciente}
              resetAdministracaoForm={resetAdministracaoForm}
              medSearchTerm={medSearchTerm}
              setMedSearchTerm={setMedSearchTerm}
              loadingMedicamentos={loadingMedicamentos}
              filteredMedicamentos={filteredMedicamentos}
              openAdministrarMed={openAdministrarMed}
              editingMed={editingMed}
              resetMedForm={resetMedForm}
              medData={medData}
              setMedData={setMedData}
              handleMedSubmit={handleMedSubmit}
              isUpdatingMed={isUpdatingMed}
              selectedMed={selectedMed}
              administracaoData={administracaoData}
              setAdministracaoData={setAdministracaoData}
              handleAdministrarSubmit={handleAdministrarSubmit}
              isAdministrandoMed={isAdministrandoMed}
              cnsBuscaTerm={cnsBuscaTerm}
              setCnsBuscaTerm={setCnsBuscaTerm}
              isBuscandoPacienteCns={isBuscandoPacienteCns}
              buscarPacientePorCns={buscarPacientePorCns}
            />

            <FuncionarioConsultaModals
              showConsultaDetailsModal={showConsultaDetailsModal}
              setShowConsultaDetailsModal={setShowConsultaDetailsModal}
              selectedConsulta={selectedConsulta}
              setSelectedConsulta={setSelectedConsulta}
              getStatusColor={getStatusColor}
              formatConsultaDate={formatConsultaDate}
              getConsultaDisease={getConsultaDisease}
              setModalHistorico={setModalHistorico}
              modalHistorico={modalHistorico}
              handleRegistrarHistorico={handleRegistrarHistorico}
              formHistorico={formHistorico}
              setFormHistorico={setFormHistorico}
              toggleIncluirReceita={toggleIncluirReceita}
              toggleIncluirAtestado={toggleIncluirAtestado}
              adicionarMedicamentoEvolucao={adicionarMedicamentoEvolucao}
              removerMedicamentoEvolucao={removerMedicamentoEvolucao}
              atualizarMedicamentoEvolucao={atualizarMedicamentoEvolucao}
              isRegistrandoHistorico={loadingHistorico}
            />

            <FuncionarioHistoricoModals
              showBuscaHistoricoModal={showBuscaHistoricoModal}
              setShowBuscaHistoricoModal={setShowBuscaHistoricoModal}
              handleBuscarHistoricoPorCpf={handleBuscarHistoricoPorCpf}
              cpfHistoricoBusca={cpfHistoricoBusca}
              setCpfHistoricoBusca={setCpfHistoricoBusca}
              isBuscandoHistorico={isBuscandoHistorico}
              registroHistoricoDetalhe={registroHistoricoDetalhe}
              setRegistroHistoricoDetalhe={setRegistroHistoricoDetalhe}
              pacienteNome={historicoBuscaResultado?.paciente?.nome}
            />

            <FuncionarioPatientActionModals
              selectedPaciente={selectedPaciente}
              showHistoricoModal={showHistoricoModal}
              setShowHistoricoModal={setShowHistoricoModal}
              handleHistoricoSubmit={handleHistoricoSubmit}
              historicoData={historicoData}
              setHistoricoData={setHistoricoData}
              isRegistrandoHistorico={isRegistrandoHistorico}
              showVacinaModal={showVacinaModal}
              setShowVacinaModal={setShowVacinaModal}
              handleVacinaSubmit={handleVacinaSubmit}
              vacinaData={vacinaData}
              setVacinaData={setVacinaData}
              isRegistrandoVacina={isRegistrandoVacina}
              showExameModal={showExameModal}
              setShowExameModal={setShowExameModal}
              handleExameSubmit={handleExameSubmit}
              exameData={exameData}
              setExameData={setExameData}
              isSolicitandoExame={isSolicitandoExame}
              laboratorios={laboratorios}
              showInternacaoModal={showInternacaoModal}
              setShowInternacaoModal={setShowInternacaoModal}
              handleInternacaoSubmit={handleInternacaoSubmit}
              internacaoData={internacaoData}
              setInternacaoData={setInternacaoData}
              isSolicitandoInternacao={isSolicitandoInternacao}
              hospitais={hospitais}
              loadingHospitais={loadingHospitais}
              hospitaisError={hospitaisError}
            />

            <FuncionarioDispensacaoModals
              showDispensacaoModal={showDispensacaoModal}
              setShowDispensacaoModal={setShowDispensacaoModal}
              receitaEncontrada={receitaEncontrada}
              user={user}
              erroDispensacao={erroDispensacao}
              medicamentosSelecionados={medicamentosSelecionados}
              setMedicamentosSelecionados={setMedicamentosSelecionados}
              handleDispensarMedicamentos={handleDispensarMedicamentos}
              isDispensandoMedicamentos={isDispensandoMedicamentos}
              showDetalhesDispensacaoModal={showDetalhesDispensacaoModal}
              setShowDetalhesDispensacaoModal={setShowDetalhesDispensacaoModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioDashboard;
