import React from "react";
import {
  User,
  Heart,
  Shield,
  FileText,
  LogOut,
  Calendar,
  Building2,
  Pill,
  Stethoscope,
  Activity,
  History,
  Menu,
  Megaphone,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  generateVacinasPDF,
} from "../../utils/pdfGenerator";
import { PacienteHomeTab } from "../../components/Paciente/PacienteHomeTab";
import { PacientePerfilTab } from "../../components/Paciente/PacientePerfilTab";
import { PacienteConsultasTab } from "../../components/Paciente/PacienteConsultasTab";
import { PacienteHistoricoTab } from "../../components/Paciente/PacienteHistoricoTab";
import { PacienteVacinasTab } from "../../components/Paciente/PacienteVacinasTab";
import { PacienteExamesTab } from "../../components/Paciente/PacienteExamesTab";
import { PacienteInternacoesTab } from "../../components/Paciente/PacienteInternacoesTab";
import { PacienteProcedimentosTab } from "../../components/Paciente/PacienteProcedimentosTab";
import { PacienteMedicacoesTab } from "../../components/Paciente/PacienteMedicacoesTab";
import { PacienteAgendamentosTab } from "../../components/Paciente/PacienteAgendamentosTab";
import { PacienteHistoricoHospitalarTab } from "../../components/Paciente/PacienteHistoricoHospitalarTab";
import { PacienteReceitasAtestadoTab } from "../../components/Paciente/PacienteReceitasAtestadoTab";
import { PacienteSolicitarConsultaModal } from "../../components/Paciente/PacienteSolicitarConsultaModal";
import { PacienteEditarPerfilModal } from "../../components/Paciente/PacienteEditarPerfilModal";
import { PacienteDetalhesModal } from "../../components/Paciente/PacienteDetalhesModal";
import { PacienteConfirmarAgendamentoModal } from "../../components/Paciente/PacienteConfirmarAgendamentoModal";
import { PacienteCancelarConsultaModal } from "../../components/Paciente/PacienteCancelarConsultaModal";
import { PacienteGerenciarRetornoModal } from "../../components/Paciente/PacienteGerenciarRetornoModal";
import { EmptyState } from "../../components/UI/EmptyState";
import { StatusBadge } from "../../components/UI/StatusBadge";
import { SectionHeader } from "../../components/UI/SectionHeader";
import MinhasCampanhas from "../../components/Paciente/MinhasCampanhas";
import { usePacienteDashboard } from "../../hooks/usePacienteDashboard";

const PacienteDashboard: React.FC = () => {
  const {
    user,
    logout,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    showDetalhesModal,
    setShowDetalhesModal,
    showConsultaModal,
    setShowConsultaModal,
    showConfirmarModal,
    setShowConfirmarModal,
    showCancelarModal,
    setShowCancelarModal,
    showEditarPerfilModal,
    setShowEditarPerfilModal,
    showConfirmarInscricaoModal,
    setShowConfirmarInscricaoModal,
    campanhaParaInscricao,
    selectedItem,
    setSelectedItem,
    internacoesFilter,
    setInternacoesFilter,
    medicacoesSource,
    setMedicacoesSource,
    confirmacaoObservacoes,
    setConfirmacaoObservacoes,
    perfilData,
    setPerfilData,
    consultaData,
    setConsultaData,
    exameSearch,
    setExameSearch,
    examesSource,
    setExamesSource,
    motivoCancelamento,
    setMotivoCancelamento,
    filtroEspecialidade,
    setFiltroEspecialidade,
    
    // Data
    perfil,
    campanhas,
    historicoMedico,
    vacinas,
    filteredExamesRealizados,
    filteredExamesSolicitados,
    consultas,
    consultasFiltradas,
    especialidadesUnicas,
    ubsList,
    filteredSolicitacoesInternacao,
    filteredInternacoes,
    procedimentosHospitalares,
    medicacoesAdministradas,
    medicacoesAdministradasLoading,
    medicacoesPaciente,
    medicacoesPacienteLoading,
    agendamentosHospitalares,
    historicoHospitalar,
    receitasEAtestados,
    
    // Mutations loading states
    isConfirmandoAgendamento,
    isAtualizandoPerfil,
    isSolicitandoConsulta,
    isCancelandoConsulta,
    
    // Handlers
    openDetalhesModal,
    handleConsultaSubmit,
    openConfirmarModal,
    openEditarPerfilModal,
    handleInscreverCampanha,
    handleConfirmarInscricao,
    handleConfirmarAgendamento,
    handleAtualizarPerfil,
    handleCancelarConsulta,
    confirmarConsultaMutation,
    
    // Gerenciamento de Retorno
    showGerenciarRetornoModal,
    setShowGerenciarRetornoModal,
    formRetorno,
    setFormRetorno,
    handleSalvarEdicaoRetorno,
    handleCancelarRetorno: handleCancelarRetornoHook,
    
    // Mutations loading
    isInscrevendoCampanha,
    
    // Navigation
    navigation,
    
    // Helpers
    getPrioridadeColor,
  } = usePacienteDashboard();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#F0F4F8", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(10, 74, 74, 0.35)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: "240px",
          background: "#ffffff",
          borderRight: "0.5px solid #E2E8F0",
        }}
      >
        {/* Logo da sidebar */}
        <div
          className="flex items-center gap-2.5"
          style={{
            height: "64px",
            padding: "0 20px",
            borderBottom: "0.5px solid #E2E8F0",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #0A6B6B, #0E9090)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "15px",
              fontWeight: 500,
              color: "#0A4A4A",
              letterSpacing: "0.01em",
            }}
          >
            SISC Saúde
          </span>
        </div>

        {/* Avatar do paciente */}
        <div
          className="flex items-center gap-4"
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div
            className="relative flex items-center justify-center flex-shrink-0"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0A6B6B 0%, #14B8A6 100%)",
              boxShadow: "0 8px 20px rgba(10, 107, 107, 0.20)",
            }}
          >
            {user?.nome ? (
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                {user.nome
                  .split(" ")
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            ) : (
              <User className="h-6 w-6 text-white" />
            )}

            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#22C55E",
                border: "2px solid white",
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate"
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              {user?.nome || "Usuário"}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#0A6B6B",
                  background: "#E6FFFB",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  border: "1px solid #B2F5EA",
                }}
              >
                PACIENTE
              </span>
            </div>
          </div>
        </div>

        {/* Itens de navegação */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{
            padding: "12px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className="group w-full flex items-center gap-2.5 transition-all duration-150"
                style={{
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: active ? 500 : 400,
                  fontFamily: "'DM Sans', sans-serif",
                  background: active ? "#0A6B6B" : "transparent",
                  color: active ? "#ffffff" : "#4A6B6B",
                }}
              >
                <Icon
                  className="h-4 w-4 flex-shrink-0"
                  style={{ opacity: active ? 1 : 0.65 }}
                />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Botão sair */}
        <div style={{ borderTop: "0.5px solid #E2E8F0", padding: "10px" }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 transition-all duration-150"
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 400,
              fontFamily: "'DM Sans', sans-serif",
              background: "transparent",
              color: "#7A9B9B",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFF0F0";
              e.currentTarget.style.color = "#C0392B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#7A9B9B";
            }}
          >
            <LogOut className="h-4 w-4" />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-900">
                {navigation.find((n) => n.key === activeTab)?.name ??
                  "Portal do Paciente"}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              Online
            </span>
          </div>
        </header>

        {/* Conteúdo scrollável */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {/* ── HOME ──────────────────────────────────────── */}
          {activeTab === "home" && (
            <PacienteHomeTab
              user={user}
              campanhas={campanhas || []}
              setShowConsultaModal={setShowConsultaModal}
              setActiveTab={setActiveTab}
              handleInscreverCampanha={handleInscreverCampanha}
              EmptyState={EmptyState}
            />
          )}

          {/* ── PERFIL ──────────────────────────────────────── */}
          {activeTab === "perfil" && perfil && (
            <PacientePerfilTab
              perfil={perfil}
              openEditarPerfilModal={openEditarPerfilModal}
              SectionHeader={SectionHeader}
            />
          )}

          {/* ── CONSULTAS ───────────────────────────────────── */}
          {activeTab === "consultas" && (
            <PacienteConsultasTab
              consultas={consultas || []}
              consultasFiltradas={consultasFiltradas || []}
              filtroEspecialidade={filtroEspecialidade}
              setFiltroEspecialidade={setFiltroEspecialidade}
              especialidadesUnicas={especialidadesUnicas}
              setShowConsultaModal={setShowConsultaModal}
              openDetalhesModal={openDetalhesModal}
              setSelectedItem={setSelectedItem}
              setShowGerenciarRetornoModal={setShowGerenciarRetornoModal}
              setFormRetorno={setFormRetorno}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
          )}

          {/* ── HISTÓRICO MÉDICO ────────────────────────────── */}
          {activeTab === "historico" && (
            <PacienteHistoricoTab
              historicoMedico={historicoMedico || []}
              perfil={perfil}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}

          {/* ── VACINAS ─────────────────────────────────────── */}
          {activeTab === "vacinas" && (
            <PacienteVacinasTab
              vacinas={vacinas || []}
              perfil={perfil}
              generateVacinasPDF={generateVacinasPDF}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}

          {/* ── EXAMES ──────────────────────────────────────── */}
          {activeTab === "exames" && (
            <PacienteExamesTab
              examesSource={examesSource}
              setExamesSource={setExamesSource}
              filteredExamesRealizados={filteredExamesRealizados}
              filteredExamesSolicitados={filteredExamesSolicitados}
              exameSearch={exameSearch}
              setExameSearch={setExameSearch}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
          )}

          {/* ── INTERNAÇÕES ─────────────────────────────────── */}
          {activeTab === "internacoes" && (
            <PacienteInternacoesTab
              internacoesFilter={internacoesFilter}
              setInternacoesFilter={setInternacoesFilter}
              perfil={perfil}
              filteredSolicitacoesInternacao={filteredSolicitacoesInternacao}
              filteredInternacoes={filteredInternacoes}
              openDetalhesModal={openDetalhesModal}
              openConfirmarModal={openConfirmarModal}
              getPrioridadeColor={getPrioridadeColor}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
          )}

          {/* ── PROCEDIMENTOS ───────────────────────────────── */}
          {activeTab === "procedimentos" && (
            <PacienteProcedimentosTab
              procedimentosHospitalares={procedimentosHospitalares || []}
              openDetalhesModal={openDetalhesModal}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
          )}

          {/* ── MEDICAÇÕES ──────────────────────────────────── */}
          {activeTab === "medicacoes" && (
            <PacienteMedicacoesTab
              medicacoesSource={medicacoesSource}
              setMedicacoesSource={setMedicacoesSource}
              medicacoesPacienteLoading={medicacoesPacienteLoading}
              medicacoesPaciente={medicacoesPaciente || []}
              medicacoesAdministradasLoading={medicacoesAdministradasLoading}
              medicacoesAdministradas={medicacoesAdministradas || []}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}

          {/* ── AGENDAMENTOS ────────────────────────────────── */}
          {activeTab === "agendamentos" && (
            <PacienteAgendamentosTab
              agendamentosHospitalares={agendamentosHospitalares || []}
              openDetalhesModal={openDetalhesModal}
              openConfirmarModal={openConfirmarModal}
              SectionHeader={SectionHeader}
              StatusBadge={StatusBadge}
              EmptyState={EmptyState}
            />
          )}
          {activeTab === "campanhas" && <MinhasCampanhas />}

          {/* ── HISTÓRICO HOSPITALAR ────────────────────────── */}
          {activeTab === "historico-hospitalar" && (
            <PacienteHistoricoHospitalarTab
              historicoHospitalar={historicoHospitalar}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}

          {/* ── RECEITAS E ATESTADOS ────────────────────────── */}
          {activeTab === "receitas-atestados" && (
            <PacienteReceitasAtestadoTab
              receitas={receitasEAtestados?.receitas || []}
              atestados={receitasEAtestados?.atestados || []}
              perfil={perfil}
              SectionHeader={SectionHeader}
              EmptyState={EmptyState}
            />
          )}
        </main>
      </div>

      {/* ── MODAIS ──────────────────────────────────────────── */}

      {/* Modal Solicitar Consulta */}
      <PacienteSolicitarConsultaModal
        showConsultaModal={showConsultaModal}
        setShowConsultaModal={setShowConsultaModal}
        consultaData={consultaData}
        setConsultaData={setConsultaData}
        ubsList={ubsList || []}
        handleConsultaSubmit={handleConsultaSubmit}
        isLoading={isSolicitandoConsulta}
      />

      {/* Modal Editar Perfil */}
      <PacienteEditarPerfilModal
        showEditarPerfilModal={showEditarPerfilModal}
        setShowEditarPerfilModal={setShowEditarPerfilModal}
        perfilData={perfilData}
        setPerfilData={setPerfilData}
        handleAtualizarPerfil={handleAtualizarPerfil}
        isLoading={isAtualizandoPerfil}
      />

      {/* Modal Detalhes */}
      <PacienteDetalhesModal
        showDetalhesModal={showDetalhesModal}
        setShowDetalhesModal={setShowDetalhesModal}
        selectedItem={selectedItem}
        StatusBadge={StatusBadge}
        confirmarConsultaMutation={confirmarConsultaMutation}
        setMotivoCancelamento={setMotivoCancelamento}
        setShowCancelarModal={setShowCancelarModal}
      />

      {/* Modal Confirmar Agendamento */}
      <PacienteConfirmarAgendamentoModal
        showConfirmarModal={showConfirmarModal}
        setShowConfirmarModal={setShowConfirmarModal}
        selectedItem={selectedItem}
        confirmacaoObservacoes={confirmacaoObservacoes}
        setConfirmacaoObservacoes={setConfirmacaoObservacoes}
        handleConfirmarAgendamento={handleConfirmarAgendamento}
        isLoading={isConfirmandoAgendamento}
      />

      {/* Modal Cancelar Consulta */}
      <PacienteCancelarConsultaModal
        showCancelarModal={showCancelarModal}
        setShowCancelarModal={setShowCancelarModal}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        motivoCancelamento={motivoCancelamento}
        setMotivoCancelamento={setMotivoCancelamento}
        handleCancelarConsulta={handleCancelarConsulta}
        isLoading={isCancelandoConsulta}
      />

      {/* Modal Confirmação de Inscrição em Campanha */}
      {showConfirmarInscricaoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmarInscricaoModal(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="bg-teal-600 px-6 py-4">
               <div className="flex items-center gap-3 text-white">
                 <Info className="h-6 w-6" />
                 <h3 className="text-lg font-bold">Confirmar Inscrição</h3>
               </div>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 leading-relaxed">
                Deseja confirmar sua inscrição na campanha:
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                "{campanhaParaInscricao?.titulo || "Campanha Selecionada"}"
              </p>
              
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() => setShowConfirmarInscricaoModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarInscricao}
                  disabled={isInscrevendoCampanha}
                  className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-100 transition-all hover:bg-teal-700 active:scale-95 disabled:opacity-50"
                >
                  {isInscrevendoCampanha ? "Processando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Retorno */}
      <PacienteGerenciarRetornoModal
        showModal={showGerenciarRetornoModal}
        onClose={() => setShowGerenciarRetornoModal(false)}
        selectedItem={selectedItem}
        formRetorno={formRetorno}
        setFormRetorno={setFormRetorno}
        onSave={handleSalvarEdicaoRetorno}
        onCancel={handleCancelarRetornoHook}
      />
    </div>
  );
};

export default PacienteDashboard;
