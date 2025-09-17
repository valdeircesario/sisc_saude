import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Calendar, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  FileText,
  Stethoscope,
  Pill,
  TestTube,
  Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HOSPDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('solicitacoes');
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showProcedimentoModal, setShowProcedimentoModal] = useState(false);
  const [showInternacaoModal, setShowInternacaoModal] = useState(false);
  const [showExameModal, setShowExameModal] = useState(false);
  const [showMedicacaoModal, setShowMedicacaoModal] = useState(false);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [agendamentoData, setAgendamentoData] = useState({
    dataAgendada: '',
    horaAgendada: '',
    local: '',
    recomendacoes: '',
    observacoes: ''
  });

  const [procedimentoData, setProcedimentoData] = useState({
    tipo: '',
    descricao: '',
    laudoPos: '',
    instrucoes: '',
    dataRealizacao: '',
    medicoRealizouId: '',
    observacoes: ''
  });

  const [internacaoData, setInternacaoData] = useState({
    pacienteId: '',
    medicoResponsavelId: '',
    dataEntrada: '',
    motivo: '',
    diagnostico: '',
    observacoes: ''
  });

  const [exameData, setExameData] = useState({
    laboratorioId: '',
    pacienteId: '',
    tipoExame: '',
    observacoes: ''
  });

  const [medicacaoData, setMedicacaoData] = useState({
    pacienteId: '',
    internacaoId: '',
    nomeMedicacao: '',
    dosagem: '',
    viaAdministracao: '',
    dataHoraAdministracao: '',
    observacoes: ''
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Queries
  const { data: pacientes, isLoading: loadingPacientes } = useQuery(
    ['hospital-pacientes', searchTerm],
    () => api.get(`/hospital/pacientes?busca=${searchTerm}`).then(res => res.data),
    { enabled: activeTab === 'pacientes' }
  );

  const { data: solicitacoes, isLoading: loadingSolicitacoes } = useQuery(
    'hospital-solicitacoes',
    () => api.get('/hospital/solicitacoes-internacao').then(res => res.data),
    { enabled: activeTab === 'solicitacoes' }
  );

  const { data: agendamentos, isLoading: loadingAgendamentos } = useQuery(
    'hospital-agendamentos',
    () => api.get('/hospital/agendamentos').then(res => res.data),
    { enabled: activeTab === 'agendamentos' }
  );

  const { data: procedimentos, isLoading: loadingProcedimentos } = useQuery(
    'hospital-procedimentos',
    () => api.get('/hospital/procedimentos').then(res => res.data),
    { enabled: activeTab === 'procedimentos' }
  );

  const { data: internacoes, isLoading: loadingInternacoes } = useQuery(
    'hospital-internacoes',
    () => api.get('/hospital/internacoes').then(res => res.data),
    { enabled: activeTab === 'internacoes' }
  );

  const { data: solicitacoesExames, isLoading: loadingSolicitacoesExames } = useQuery(
    'hospital-solicitacoes-exames',
    () => api.get('/hospital/solicitacoes-exames').then(res => res.data),
    { enabled: activeTab === 'exames' }
  );

  const { data: medicacoes, isLoading: loadingMedicacoes } = useQuery(
    'hospital-medicacoes',
    () => api.get('/hospital/medicacoes').then(res => res.data),
    { enabled: activeTab === 'medicacoes' }
  );

  const { data: historicoPaciente } = useQuery(
    ['paciente-historico-hospital', selectedPaciente?.id],
    () => api.get(`/hospital/pacientes/${selectedPaciente.id}/historico`).then(res => res.data),
    { enabled: !!selectedPaciente && showHistoricoModal }
  );

  // Mutations
  const agendarInternacaoMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/hospital/solicitacoes-internacao/${id}/agendar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hospital-solicitacoes');
        toast.success('Internação agendada com sucesso!');
        setShowAgendamentoModal(false);
        setSelectedItem(null);
        resetAgendamentoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao agendar internação');
      }
    }
  );

  const criarProcedimentoMutation = useMutation(
    (data: any) => api.post('/hospital/procedimentos', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hospital-procedimentos');
        toast.success('Procedimento registrado com sucesso!');
        setShowProcedimentoModal(false);
        resetProcedimentoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao registrar procedimento');
      }
    }
  );

  const criarInternacaoMutation = useMutation(
    (data: any) => api.post('/hospital/internacoes', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hospital-internacoes');
        toast.success('Internação registrada com sucesso!');
        setShowInternacaoModal(false);
        resetInternacaoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao registrar internação');
      }
    }
  );

  const solicitarExameMutation = useMutation(
    (data: any) => api.post('/hospital/solicitacoes-exames', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hospital-solicitacoes-exames');
        toast.success('Exame solicitado com sucesso!');
        setShowExameModal(false);
        resetExameForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao solicitar exame');
      }
    }
  );

  const registrarMedicacaoMutation = useMutation(
    (data: any) => api.post('/hospital/medicacoes', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hospital-medicacoes');
        toast.success('Medicação registrada com sucesso!');
        setShowMedicacaoModal(false);
        resetMedicacaoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao registrar medicação');
      }
    }
  );

  // Reset forms
  const resetAgendamentoForm = () => {
    setAgendamentoData({
      dataAgendada: '',
      horaAgendada: '',
      local: '',
      recomendacoes: '',
      observacoes: ''
    });
  };

  const resetProcedimentoForm = () => {
    setProcedimentoData({
      tipo: '',
      descricao: '',
      laudoPos: '',
      instrucoes: '',
      dataRealizacao: '',
      medicoRealizouId: '',
      observacoes: ''
    });
  };

  const resetInternacaoForm = () => {
    setInternacaoData({
      pacienteId: '',
      medicoResponsavelId: '',
      dataEntrada: '',
      motivo: '',
      diagnostico: '',
      observacoes: ''
    });
  };

  const resetExameForm = () => {
    setExameData({
      laboratorioId: '',
      pacienteId: '',
      tipoExame: '',
      observacoes: ''
    });
  };

  const resetMedicacaoForm = () => {
    setMedicacaoData({
      pacienteId: '',
      internacaoId: '',
      nomeMedicacao: '',
      dosagem: '',
      viaAdministracao: '',
      dataHoraAdministracao: '',
      observacoes: ''
    });
  };

  // Handlers
  const handleAgendamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      agendarInternacaoMutation.mutate({ 
        id: selectedItem.id, 
        data: agendamentoData 
      });
    }
  };

  const handleProcedimentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      criarProcedimentoMutation.mutate({
        ...procedimentoData,
        solicitacaoInternacaoId: selectedItem.id,
        pacienteId: selectedItem.pacienteId
      });
    }
  };

  const handleInternacaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    criarInternacaoMutation.mutate(internacaoData);
  };

  const handleExameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    solicitarExameMutation.mutate(exameData);
  };

  const handleMedicacaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registrarMedicacaoMutation.mutate(medicacaoData);
  };

  const openAgendamentoModal = (solicitacao: any) => {
    setSelectedItem(solicitacao);
    setShowAgendamentoModal(true);
  };

  const openProcedimentoModal = (solicitacao: any) => {
    setSelectedItem(solicitacao);
    setShowProcedimentoModal(true);
  };

  const openHistoricoModal = (paciente: any) => {
    setSelectedPaciente(paciente);
    setShowHistoricoModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      case 'agendada': case 'agendado': return 'text-blue-600 bg-blue-100';
      case 'realizada': case 'realizado': return 'text-green-600 bg-green-100';
      case 'cancelada': case 'cancelado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'text-red-600 bg-red-100';
      case 'media': return 'text-yellow-600 bg-yellow-100';
      case 'baixa': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarOpen ? 250 : 80 }} 
        className="bg-red-800 text-white flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-red-700">
          {isSidebarOpen && <h1 className="text-lg font-bold">Hospital Dashboard</h1>}
          <button onClick={toggleSidebar} className="focus:outline-none">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('solicitacoes')}
                className={`flex items-center p-2 rounded hover:bg-red-700 w-full text-left ${activeTab === 'solicitacoes' ? 'bg-red-700' : ''}`}
              >
                <FileText className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Solicitações</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('agendamentos')}
                className={`flex items-center p-2 rounded hover:bg-red-700 w-full text-left ${activeTab === 'agendamentos' ? 'bg-red-700' : ''}`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Agendamentos</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('procedimentos')}
                className={`flex items-center p-2 rounded hover:bg-red-700 w-full text-left ${activeTab === 'procedimentos' ? 'bg-red-700' : ''}`}
              >
                <Stethoscope className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Procedimentos</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('internacoes')}
                className={`flex items-center p-2 rounded hover:bg-red-700 w-full text-left ${activeTab === 'internacoes' ? 'bg-red-700' : ''}`}
              >
                <Heart className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Internações</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('exames')}
                className={`flex items-center p-2 rounded hover:bg-red-700 w-full text-left ${activeTab === 'exames' ? 'bg-red-700' : ''}`}
              >
                <TestTube className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Exames</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('medicacoes')}
                className={`flex items-center p-2 rounded hover:bg-red-700 w-full text-left ${activeTab === 'medicacoes' ? 'bg-red-700' : ''}`}
              >
                <Pill className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Medicações</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('pacientes')}
                className={`flex items-center p-2 rounded hover:bg-red-700 w-full text-left ${activeTab === 'pacientes' ? 'bg-red-700' : ''}`}
              >
                <Users className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Pacientes</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={logout} 
                className="flex items-center p-2 rounded hover:bg-red-700 w-full focus:outline-none"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Sair</span>}
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-red-700">
          {isSidebarOpen && user && (
            <div>
              <p className="text-sm">Logado como:</p>
              <p className="font-bold">{user.name}</p>
              <p className="text-xs">{user.email}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Solicitações de Internação */}
        {activeTab === 'solicitacoes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Solicitações de Internação</h2>
            </div>
            {loadingSolicitacoes ? (
              <p>Carregando solicitações...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {solicitacoes?.map((solicitacao: any) => (
                  <div key={solicitacao.id} className="border border-gray-300 rounded p-4 shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{solicitacao.paciente.nome}</h3>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(solicitacao.status)}`}>
                          {solicitacao.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPrioridadeColor(solicitacao.prioridade)}`}>
                          {solicitacao.prioridade}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Tipo:</strong> {solicitacao.tipo} | <strong>CPF:</strong> {solicitacao.paciente.cpf}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>UBS:</strong> {solicitacao.ubs.nome} | <strong>Médico:</strong> {solicitacao.funcionario.nome}
                    </p>
                    <p className="mb-2"><strong>Motivo:</strong> {solicitacao.motivo}</p>
                    <p className="mb-4"><strong>Detalhes:</strong> {solicitacao.detalhes}</p>
                    <div className="flex space-x-2">
                      {solicitacao.status === 'pendente' && (
                        <button 
                          onClick={() => openAgendamentoModal(solicitacao)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Calendar className="w-4 h-4 mr-1" /> Agendar
                        </button>
                      )}
                      <button 
                        onClick={() => openProcedimentoModal(solicitacao)}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <Stethoscope className="w-4 h-4 mr-1" /> Procedimento
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agendamentos */}
        {activeTab === 'agendamentos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Agendamentos Hospitalares</h2>
            </div>
            {loadingAgendamentos ? (
              <p>Carregando agendamentos...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {agendamentos?.map((agendamento: any) => (
                  <div key={agendamento.id} className="border border-gray-300 rounded p-4 shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{agendamento.paciente.nome}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(agendamento.status)}`}>
                        {agendamento.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Data:</strong> {format(new Date(agendamento.dataAgendamento), "dd/MM/yyyy", { locale: ptBR })} às {agendamento.horaAgendamento}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Tipo:</strong> {agendamento.tipo} | <strong>Médico:</strong> {agendamento.medico?.nome || 'Não definido'}
                    </p>
                    {agendamento.observacoes && (
                      <p className="mb-2"><strong>Observações:</strong> {agendamento.observacoes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Procedimentos */}
        {activeTab === 'procedimentos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Procedimentos Hospitalares</h2>
            </div>
            {loadingProcedimentos ? (
              <p>Carregando procedimentos...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {procedimentos?.map((procedimento: any) => (
                  <div key={procedimento.id} className="border border-gray-300 rounded p-4 shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{procedimento.paciente.nome}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(procedimento.status)}`}>
                        {procedimento.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Tipo:</strong> {procedimento.tipo} | <strong>Data:</strong> {format(new Date(procedimento.dataRealizacao), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Médico:</strong> {procedimento.medicoRealizou?.nome || 'Não informado'}
                    </p>
                    <p className="mb-2"><strong>Descrição:</strong> {procedimento.descricao}</p>
                    {procedimento.laudoPos && (
                      <p className="mb-2"><strong>Laudo:</strong> {procedimento.laudoPos}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Internações */}
        {activeTab === 'internacoes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Internações</h2>
              <button 
                onClick={() => setShowInternacaoModal(true)} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Nova Internação
              </button>
            </div>
            {loadingInternacoes ? (
              <p>Carregando internações...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {internacoes?.map((internacao: any) => (
                  <div key={internacao.id} className="border border-gray-300 rounded p-4 shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{internacao.paciente.nome}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${internacao.dataSaida ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                        {internacao.dataSaida ? 'Alta' : 'Internado'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Entrada:</strong> {format(new Date(internacao.dataEntrada), "dd/MM/yyyy", { locale: ptBR })}
                      {internacao.dataSaida && (
                        <> | <strong>Saída:</strong> {format(new Date(internacao.dataSaida), "dd/MM/yyyy", { locale: ptBR })}</>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Médico Responsável:</strong> {internacao.medicoResponsavel?.nome || 'Não definido'}
                    </p>
                    <p className="mb-2"><strong>Motivo:</strong> {internacao.motivo}</p>
                    {internacao.diagnostico && (
                      <p className="mb-2"><strong>Diagnóstico:</strong> {internacao.diagnostico}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exames */}
        {activeTab === 'exames' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Solicitações de Exames</h2>
              <button 
                onClick={() => setShowExameModal(true)} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Solicitar Exame
              </button>
            </div>
            {loadingSolicitacoesExames ? (
              <p>Carregando solicitações...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {solicitacoesExames?.map((exame: any) => (
                  <div key={exame.id} className="border border-gray-300 rounded p-4 shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">{exame.paciente.nome}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(exame.status)}`}>
                        {exame.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Tipo:</strong> {exame.tipoExame} | <strong>Laboratório:</strong> {exame.laboratorio.nome}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Data:</strong> {format(new Date(exame.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    {exame.observacoes && (
                      <p className="mb-2"><strong>Observações:</strong> {exame.observacoes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Medicações */}
        {activeTab === 'medicacoes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Medicações Administradas</h2>
              <button 
                onClick={() => setShowMedicacaoModal(true)} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Registrar Medicação
              </button>
            </div>
            {loadingMedicacoes ? (
              <p>Carregando medicações...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {medicacoes?.map((medicacao: any) => (
                  <div key={medicacao.id} className="border border-gray-300 rounded p-4 shadow">
                    <h3 className="text-lg font-bold mb-2">{medicacao.nomeMedicacao}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Paciente:</strong> {medicacao.paciente.nome} | <strong>CPF:</strong> {medicacao.paciente.cpf}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Dosagem:</strong> {medicacao.dosagem} | <strong>Via:</strong> {medicacao.viaAdministracao}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Data/Hora:</strong> {format(new Date(medicacao.dataHoraAdministracao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                    {medicacao.observacoes && (
                      <p className="mb-2"><strong>Observações:</strong> {medicacao.observacoes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pacientes */}
        {activeTab === 'pacientes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Pacientes</h2>
            </div>
            <input 
              type="text" 
              placeholder="Buscar pacientes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
            />
            {loadingPacientes ? (
              <p>Carregando pacientes...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pacientes?.map((paciente: any) => (
                  <div key={paciente.id} className="border border-gray-300 rounded p-4 shadow">
                    <h3 className="text-lg font-bold mb-2">{paciente.nome}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>CPF:</strong> {paciente.cpf} | <strong>CNS:</strong> {paciente.cns}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Telefone:</strong> {paciente.telefone}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Email:</strong> {paciente.email}
                    </p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openHistoricoModal(paciente)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <FileText className="w-4 h-4 mr-1" /> Histórico
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Agendamento */}
        {showAgendamentoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Agendar Internação</h3>
              <form onSubmit={handleAgendamentoSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-bold">Data</label>
                  <input 
                    type="date" 
                    value={agendamentoData.dataAgendada}
                    onChange={(e) => setAgendamentoData({...agendamentoData, dataAgendada: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Hora</label>
                  <input 
                    type="time" 
                    value={agendamentoData.horaAgendada}
                    onChange={(e) => setAgendamentoData({...agendamentoData, horaAgendada: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Local</label>
                  <input 
                    type="text" 
                    value={agendamentoData.local}
                    onChange={(e) => setAgendamentoData({...agendamentoData, local: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Recomendações</label>
                  <textarea 
                    value={agendamentoData.recomendacoes}
                    onChange={(e) => setAgendamentoData({...agendamentoData, recomendacoes: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Observações</label>
                  <textarea 
                    value={agendamentoData.observacoes}
                    onChange={(e) => setAgendamentoData({...agendamentoData, observacoes: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAgendamentoModal(false)} 
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Agendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Histórico do Paciente */}
        {showHistoricoModal && selectedPaciente && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Histórico Médico - {selectedPaciente.nome}</h3>
              {historicoPaciente && historicoPaciente.length > 0 ? (
                <div className="space-y-4">
                  {historicoPaciente.map((item: any) => (
                    <div key={item.id} className="border border-gray-300 rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold">{item.diagnostico}</h4>
                        <span className="text-sm text-gray-600">
                          {format(new Date(item.dataConsulta), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Médico:</strong> {item.funcionario.nome} ({item.funcionario.funcao})
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>UBS:</strong> {item.funcionario.ubs.nome}
                      </p>
                      <p className="mb-2"><strong>Laudo:</strong> {item.laudo}</p>
                      {item.doenca && <p className="mb-2"><strong>Doença:</strong> {item.doenca}</p>}
                      {item.medicacao && <p className="mb-2"><strong>Medicação:</strong> {item.medicacao}</p>}
                      {item.observacoes && <p className="mb-2"><strong>Observações:</strong> {item.observacoes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>Nenhum histórico médico encontrado.</p>
              )}
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => setShowHistoricoModal(false)} 
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Outros modais podem ser adicionados aqui seguindo o mesmo padrão */}
      </div>
    </div>
  );
};

export default HOSPDashboard;

