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
import { generateUBSReportPDF } from "../../utils/pdfGenerator";

const formatDateBR = (dateString: string) => {
  if (!dateString) return "";

  const isoDateMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateString);
  const date = isoDateMatch
    ? new Date(
        Number(isoDateMatch[1]),
        Number(isoDateMatch[2]) - 1,
        Number(isoDateMatch[3]),
      )
    : new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("pt-BR");
};

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
    loadingConsultas,
    filteredConsultas,
    hospitaisList,
    loadingHospitais,
    hospitaisError,
    medicamentos,
    loadingMedicamentos,
    dashboardStats,
    loadingDashboardStats,

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
    reportType,
    setReportType,
    reportCampaignId,
    setReportCampaignId,
    reportCampanhas,
    loadingReportCampanhas,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    relatorio,
    loadingRelatorio,
    fetchRelatorio,
  } = useUBSDashboard();

  const dashboardMetrics = [
    {
      label: "Consultas solicitadas",
      value: dashboardStats?.consultasSolicitadas ?? 0,
      accent: "from-cyan-500 to-teal-500",
      trend: "Solicitações abertas",
    },
    {
      label: "Consultas realizadas",
      value: dashboardStats?.consultasRealizadas ?? 0,
      accent: "from-emerald-500 to-teal-500",
      trend: "Atendimentos concluídos",
    },
    {
      label: "Consultas canceladas",
      value: dashboardStats?.consultasCanceladas ?? 0,
      accent: "from-rose-500 to-fuchsia-500",
      trend: "Cancelamentos registrados",
    },
    {
      label: "Pacientes atendidos",
      value: dashboardStats?.pacientesAtendidos ?? 0,
      accent: "from-violet-500 to-indigo-500",
      trend: "Pacientes únicos",
    },
    {
      label: "Medicamentos dispensados",
      value: dashboardStats?.medicamentosDispensados ?? 0,
      accent: "from-amber-500 to-orange-500",
      trend: "Saídas de medicamentos",
    },
    {
      label: "Vacinas registradas",
      value: dashboardStats?.vacinasRegistradas ?? 0,
      accent: "from-sky-500 to-blue-500",
      trend: "Registros de vacinação",
    },
    {
      label: "Campanhas ativas",
      value: dashboardStats?.campanhasAtivas ?? 0,
      accent: "from-lime-500 to-emerald-500",
      trend: "Campanhas em execução",
    },
    {
      label: "Campanhas realizadas",
      value: dashboardStats?.campanhasRealizadas ?? 0,
      accent: "from-slate-500 to-slate-700",
      trend: "Campanhas finalizadas",
    },
  ];

  const chartBase = Math.max(
    dashboardStats?.consultasSolicitadas ?? 0,
    dashboardStats?.consultasRealizadas ?? 0,
    dashboardStats?.consultasCanceladas ?? 0,
    dashboardStats?.medicamentosDispensados ?? 0,
    dashboardStats?.vacinasRegistradas ?? 0,
    dashboardStats?.campanhasAtivas ?? 0,
    dashboardStats?.campanhasRealizadas ?? 0,
    1,
  );

  const activityBars = [
    {
      label: "Consultas realizadas",
      value: dashboardStats?.consultasRealizadas ?? 0,
      color: "bg-emerald-500",
    },
    {
      label: "Consultas solicitadas",
      value: dashboardStats?.consultasSolicitadas ?? 0,
      color: "bg-cyan-500",
    },
    {
      label: "Medicamentos dispensados",
      value: dashboardStats?.medicamentosDispensados ?? 0,
      color: "bg-amber-500",
    },
    {
      label: "Vacinas registradas",
      value: dashboardStats?.vacinasRegistradas ?? 0,
      color: "bg-sky-500",
    },
  ];

  const kpiStats = [
    {
      label: "Funcionários cadastrados",
      value: dashboardStats?.totalFuncionarios ?? 0,
    },
    {
      label: "Campanhas",
      value: (dashboardStats?.campanhas || []).length,
    },
    {
      label: "Inscrições totais",
      value: (dashboardStats?.campanhas || []).reduce(
        (sum: number, campanha: { _count?: { inscricoes?: number } }) =>
          sum + (campanha._count?.inscricoes ?? 0),
        0,
      ),
    },
  ];

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
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid gap-6">
                <section className="rounded-[32px] bg-white shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-7 border-b border-slate-200/70">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                          Painel UBS
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                          Visão geral e tendências
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-500">
                          Acompanhe os principais indicadores de atendimento,
                          campanhas e distribuição de medicamentos.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                        {loadingDashboardStats
                          ? "Atualizando..."
                          : "Dados atualizados"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-6 lg:grid-cols-2 xl:grid-cols-4">
                    {dashboardMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 shadow-sm"
                      >
                        <span
                          className={`inline-flex rounded-2xl bg-gradient-to-r ${metric.accent} px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white`}
                        >
                          {metric.trend}
                        </span>
                        <p className="mt-4 text-sm text-slate-500">
                          {metric.label}
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900">
                          {metric.value}
                        </p>
                        <div className="mt-5 h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-slate-400"
                            style={{
                              width: `${Math.min(100, Math.round((metric.value / chartBase) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 px-6 pb-6 lg:grid-cols-2">
                    <div className="rounded-[26px] bg-slate-50 p-5 border border-slate-200">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                            Performance rápida
                          </p>
                          <h2 className="mt-3 text-xl font-semibold text-slate-900">
                            Consultas & vacinação
                          </h2>
                        </div>
                        <span className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                          Estável
                        </span>
                      </div>

                      <div className="mt-6 space-y-4">
                        {activityBars.map((bar) => {
                          const width =
                            chartBase > 0
                              ? Math.round((bar.value / chartBase) * 100)
                              : 0;
                          return (
                            <div key={bar.label}>
                              <div className="flex items-center justify-between text-sm text-slate-600">
                                <span>{bar.label}</span>
                                <span className="font-semibold text-slate-900">
                                  {bar.value}
                                </span>
                              </div>
                              <div className="mt-2 h-2 rounded-full bg-slate-200">
                                <div
                                  className={`${bar.color} h-2 rounded-full`}
                                  style={{ width: `${width}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-[26px] bg-slate-50 p-5 border border-slate-200">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                            Resumo de equipe
                          </p>
                          <h2 className="mt-3 text-xl font-semibold text-slate-900">
                            Status da UBS
                          </h2>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{" "}
                          Estável
                        </span>
                      </div>

                      <div className="mt-6 grid gap-3">
                        {kpiStats.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-3xl bg-white p-4 border border-slate-200"
                          >
                            <p className="text-sm text-slate-500">
                              {item.label}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/70">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        Principais campanhas
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Inscrições por campanha e tempo de execução.
                      </p>
                    </div>
                    <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-600">
                      Últimos 30 dias
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.12em] text-[11px]">
                        <tr>
                          <th className="px-4 py-3">Campanha</th>
                          <th className="px-4 py-3">Tipo</th>
                          <th className="px-4 py-3">Início</th>
                          <th className="px-4 py-3">Fim</th>
                          <th className="px-4 py-3">Inscrições</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(dashboardStats?.campanhas || []).map(
                          (campanha: {
                            id: string;
                            titulo: string;
                            tipo: string;
                            dataIni: string;
                            dataFim?: string | null;
                            _count?: { inscricoes?: number };
                          }) => (
                            <tr key={campanha.id}>
                              <td className="px-4 py-4 text-slate-900">
                                {campanha.titulo}
                              </td>
                              <td className="px-4 py-4 text-slate-600 capitalize">
                                {campanha.tipo}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {new Date(campanha.dataIni).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {campanha.dataFim
                                  ? new Date(
                                      campanha.dataFim,
                                    ).toLocaleDateString("pt-BR")
                                  : "-"}
                              </td>
                              <td className="px-4 py-4 text-slate-900 font-semibold">
                                {campanha._count?.inscricoes ?? 0}
                              </td>
                            </tr>
                          ),
                        )}
                        {!(dashboardStats?.campanhas || []).length && (
                          <tr>
                            <td
                              className="px-4 py-6 text-slate-500"
                              colSpan={5}
                            >
                              Não há campanhas cadastradas ainda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          )}

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
          {activeTab === "relatorios" && (
            <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Relatórios UBS
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Filtre por tipo e período para gerar relatórios da UBS.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fetchRelatorio()}
                    disabled={
                      loadingRelatorio ||
                      (reportType === "campanhas" && !reportCampaignId)
                    }
                    className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loadingRelatorio ? "Carregando..." : "Buscar relatório"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      generateUBSReportPDF(reportType, relatorio, {
                        dataInicio: reportStartDate,
                        dataFim: reportEndDate,
                      })
                    }
                    disabled={!relatorio || !relatorio.resultado?.length}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    Exportar PDF
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Tipo de relatório
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) => {
                          setReportType(e.target.value);
                          setReportCampaignId("");
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-teal-500"
                      >
                        <option value="estoque">Estoque</option>
                        <option value="dispensacoes">Dispensações</option>
                        <option value="consultas">Consultas</option>
                        <option value="vacinas">Vacinas</option>
                        <option value="campanhas">Campanhas</option>
                      </select>
                    </div>

                    {reportType === "campanhas" && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">
                          Campanha
                        </label>
                        <select
                          value={reportCampaignId}
                          onChange={(e) => setReportCampaignId(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-teal-500"
                        >
                          <option value="">Selecione uma campanha</option>
                          {reportCampanhas?.map((campanha: any) => (
                            <option key={campanha.id} value={campanha.id}>
                              {campanha.titulo}
                            </option>
                          ))}
                        </select>
                        {loadingReportCampanhas && (
                          <p className="mt-2 text-xs text-slate-500">
                            Carregando campanhas...
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Data início
                      </label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Data fim
                      </label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-teal-500"
                      />
                    </div>

                    <div className="rounded-3xl bg-white p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">
                        Status do relatório
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {relatorio?.resultado?.length ?? 0} registro(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                        Resultado
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">
                        {reportType === "estoque"
                          ? "Estoque de Medicamentos"
                          : reportType === "dispensacoes"
                            ? "Medicamentos Dispensados"
                            : reportType === "consultas"
                              ? "Consultas"
                              : reportType === "vacinas"
                                ? "Vacinações"
                                : "Campanhas"}
                      </h3>
                    </div>
                    <span className="text-sm text-slate-500">
                      {reportStartDate || reportEndDate
                        ? `${formatDateBR(reportStartDate) || "--"} até ${formatDateBR(reportEndDate) || "--"}`
                        : "Período completo"}
                    </span>
                  </div>

                  {loadingRelatorio ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                      Carregando relatório...
                    </div>
                  ) : !relatorio ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                      Use os filtros ao lado e clique em Buscar para carregar os
                      dados.
                    </div>
                  ) : !relatorio.resultado?.length ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                      Nenhum resultado encontrado para este filtro.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.12em] text-[11px]">
                          <tr>
                            {reportType === "estoque" && (
                              <>
                                <th className="px-4 py-3">Medicamento</th>
                                <th className="px-4 py-3">Lote</th>
                                <th className="px-4 py-3">Quantidade</th>
                                <th className="px-4 py-3">Validade</th>
                                <th className="px-4 py-3">Vencido</th>
                              </>
                            )}
                            {reportType === "dispensacoes" && (
                              <>
                                <th className="px-4 py-3">Medicamento</th>
                                <th className="px-4 py-3">Paciente</th>
                                <th className="px-4 py-3">Quantidade</th>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Profissional</th>
                              </>
                            )}
                            {reportType === "consultas" && (
                              <>
                                <th className="px-4 py-3">Paciente</th>
                                <th className="px-4 py-3">Especialidade</th>
                                <th className="px-4 py-3">Data Agendada</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Data Consulta</th>
                                <th className="px-4 py-3">Diagnóstico</th>
                                <th className="px-4 py-3">Laudo</th>
                              </>
                            )}
                            {reportType === "vacinas" && (
                              <>
                                <th className="px-4 py-3">Paciente</th>
                                <th className="px-4 py-3">Vacina</th>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Lote</th>
                                <th className="px-4 py-3">Próxima Dose</th>
                              </>
                            )}
                            {reportType === "campanhas" && (
                              <>
                                <th className="px-4 py-3">Nome</th>
                                <th className="px-4 py-3">CPF</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Agendamento</th>
                                <th className="px-4 py-3">Observações</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {relatorio.resultado.map(
                            (item: any, index: number) => (
                              <tr key={index}>
                                {reportType === "estoque" && (
                                  <>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.nome}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.lote}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.quantidade}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {new Date(
                                        item.dataValidade,
                                      ).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.vencido ? "Sim" : "Não"}
                                    </td>
                                  </>
                                )}
                                {reportType === "dispensacoes" && (
                                  <>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.medicamento}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.pacienteNome}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.quantidade}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {new Date(
                                        item.dataRetirada,
                                      ).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.funcionarioNome}
                                    </td>
                                  </>
                                )}
                                {reportType === "consultas" && (
                                  <>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.pacienteNome}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.especialidade}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {formatDateBR(item.dataAgendada)}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.status}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.historico?.dataConsulta
                                        ? formatDateBR(
                                            item.historico.dataConsulta,
                                          )
                                        : "-"}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.historico?.diagnostico || "-"}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.historico?.laudo || "-"}
                                    </td>
                                  </>
                                )}
                                {reportType === "vacinas" && (
                                  <>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.pacienteNome}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.vacinaNome}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {formatDateBR(item.dataApl)}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.lote}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.proximaDose
                                        ? formatDateBR(item.proximaDose)
                                        : "-"}
                                    </td>
                                  </>
                                )}
                                {reportType === "campanhas" && (
                                  <>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.nome}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.cpf}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.status}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600">
                                      {item.agendamento
                                        ? `${formatDateBR(item.agendamento.dataAgendada)} ${item.agendamento.horaAgendada || ""}`
                                        : "Sem agendamento"}
                                    </td>
                                    <td className="px-4 py-4 text-slate-900">
                                      {item.observacoes ||
                                        item.agendamento?.observacoes ||
                                        "-"}
                                    </td>
                                  </>
                                )}
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </section>
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
