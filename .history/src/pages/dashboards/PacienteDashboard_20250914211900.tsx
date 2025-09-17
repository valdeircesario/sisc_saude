import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  Activity,
  History,
  Edit,
  Save,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PacienteDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('perfil');
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [showEditarPerfilModal, setShowEditarPerfilModal] = useState(false);
  const [showSolicitarConsultaModal, setShowSolicitarConsultaModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [confirmacaoObservacoes, setConfirmacaoObservacoes] = useState('');

  // Estados para edição de perfil
  const [perfilData, setPerfilData] = useState({
    endereco: '',
    telefone: '',
    email: ''
  });

  // Estados para solicitação de consulta
  const [consultaData, setConsultaData] = useState({
    ubsId: '',
    motivo: '',
    especialidade: ''
  });

  // Queries
  const { data: perfil } = useQuery(
    'paciente-perfil',
    () => api.get('/paciente/perfil').then(res => res.data),
    { 
      enabled: activeTab === 'perfil',
      onSuccess: (data) => {
        setPerfilData({
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          email: data.email || ''
        });
      }
    }
  );

  const { data: historicoMedico } = useQuery(
    'paciente-historico-medico',
    () => api.get('/paciente/historico-medico').then(res => res.data),
    { enabled: activeTab === 'historico' }
  );

  const { data: vacinas } = useQuery(
    'paciente-vacinas',
    () => api.get('/paciente/vacinas').then(res => res.data),
    { enabled: activeTab === 'vacinas' }
  );

  const { data: exames } = useQuery(
    'paciente-exames',
    () => api.get('/paciente/exames').then(res => res.data),
    { enabled: activeTab === 'exames' }
  );

  const { data: consultas } = useQuery(
    'paciente-consultas',
    () => api.get('/paciente/consultas').then(res => res.data),
    { enabled: activeTab === 'consultas' }
  );

  const { data: ubsList } = useQuery(
    'paciente-ubs',
    () => api.get('/paciente/ubs').then(res => res.data),
    { enabled: showSolicitarConsultaModal }
  );

  // Queries para funcionalidades hospitalares
  const { data: solicitacoesInternacao } = useQuery(
    'paciente-solicitacoes-internacao',
    () => api.get('/paciente/solicitacoes-internacao').then(res => res.data),
    { enabled: activeTab === 'internacoes' }
  );

  const { data: internacoes } = useQuery(
    'paciente-internacoes',
    () => api.get('/paciente/internacoes').then(res => res.data),
    { enabled: activeTab === 'internacoes' }
  );

  const { data: procedimentosHospitalares } = useQuery(
    'paciente-procedimentos-hospitalares',
    () => api.get('/paciente/procedimentos-hospitalares').then(res => res.data),
    { enabled: activeTab === 'procedimentos' }
  );

  const { data: medicacoesHospitalares } = useQuery(
    'paciente-medicacoes-hospitalares',
    () => api.get('/paciente/medicacoes-hospitalares').then(res => res.data),
    { enabled: activeTab === 'medicacoes' }
  );

  const { data: agendamentosHospitalares } = useQuery(
    'paciente-agendamentos-hospitalares',
    () => api.get('/paciente/agendamentos-hospitalares').then(res => res.data),
    { enabled: activeTab === 'agendamentos' }
  );

  const { data: historicoHospitalar } = useQuery(
    'paciente-historico-hospitalar',
    () => api.get('/paciente/historico-hospitalar').then(res => res.data),
    { enabled: activeTab === 'historico-hospitalar' }
  );

  // Mutations
  const confirmarAgendamentoMutation = useMutation(
    ({ id, observacoes }: { id: string; observacoes?: string }) => 
      api.put(`/paciente/solicitacoes-internacao/${id}/confirmar-agendamento`, { observacoes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paciente-solicitacoes-internacao');
        toast.success('Agendamento confirmado com sucesso!');
        setShowConfirmarModal(false);
        setSelectedItem(null);
        setConfirmacaoObservacoes('');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao confirmar agendamento');
      }
    }
  );

  const confirmarAgendamentoHospitalarMutation = useMutation(
    ({ id, observacoes }: { id: string; observacoes?: string }) => 
      api.put(`/paciente/agendamentos-hospitalares/${id}/confirmar`, { observacoes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paciente-agendamentos-hospitalares');
        toast.success('Agendamento hospitalar confirmado com sucesso!');
        setShowConfirmarModal(false);
        setSelectedItem(null);
        setConfirmacaoObservacoes('');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao confirmar agendamento');
      }
    }
  );

  const atualizarPerfilMutation = useMutation(
    (data: any) => api.put('/paciente/perfil', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paciente-perfil');
        toast.success('Perfil atualizado com sucesso!');
        setShowEditarPerfilModal(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
      }
    }
  );

  const solicitarConsultaMutation = useMutation(
    (data: any) => api.post('/paciente/solicitar-consulta', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paciente-consultas');
        toast.success('Consulta solicitada com sucesso!');
        setShowSolicitarConsultaModal(false);
        resetConsultaForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao solicitar consulta');
      }
    }
  );

  const confirmarConsultaMutation = useMutation(
    (id: string) => api.put(`/paciente/consultas/${id}/confirmar`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paciente-consultas');
        toast.success('Consulta confirmada com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao confirmar consulta');
      }
    }
  );

  // Handlers
  const openDetalhesModal = (item: any) => {
    setSelectedItem(item);
    setShowDetalhesModal(true);
  };

  const openConfirmarModal = (item: any, tipo: 'internacao' | 'agendamento') => {
    setSelectedItem({ ...item, tipoConfirmacao: tipo });
    setShowConfirmarModal(true);
  };

  const openEditarPerfilModal = () => {
    setShowEditarPerfilModal(true);
  };

  const openSolicitarConsultaModal = () => {
    setShowSolicitarConsultaModal(true);
  };

  const handleConfirmarAgendamento = () => {
    if (selectedItem) {
      if (selectedItem.tipoConfirmacao === 'internacao') {
        confirmarAgendamentoMutation.mutate({
          id: selectedItem.id,
          observacoes: confirmacaoObservacoes
        });
      } else {
        confirmarAgendamentoHospitalarMutation.mutate({
          id: selectedItem.id,
          observacoes: confirmacaoObservacoes
        });
      }
    }
  };

  const handleAtualizarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarPerfilMutation.mutate(perfilData);
  };

  const handleSolicitarConsulta = (e: React.FormEvent) => {
    e.preventDefault();
    solicitarConsultaMutation.mutate(consultaData);
  };

  const handleConfirmarConsulta = (consultaId: string) => {
    confirmarConsultaMutation.mutate(consultaId);
  };

  const resetConsultaForm = () => {
    setConsultaData({
      ubsId: '',
      motivo: '',
      especialidade: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-600 bg-yellow-100';
      case 'avaliando': return 'text-blue-600 bg-blue-100';
      case 'agendado': return 'text-purple-600 bg-purple-100';
      case 'realizado': return 'text-green-600 bg-green-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      case 'confirmada': return 'text-green-600 bg-green-100';
      case 'solicitada': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'gravissimo': return 'text-red-800 bg-red-200';
      case 'urgente': return 'text-red-600 bg-red-100';
      case 'grave': return 'text-orange-600 bg-orange-100';
      case 'medio': return 'text-yellow-600 bg-yellow-100';
      case 'leve': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const navigation = [
    { name: 'Perfil', key: 'perfil', icon: User },
    { name: 'Histórico Médico', key: 'historico', icon: Heart },
    { name: 'Vacinas', key: 'vacinas', icon: Shield },
    { name: 'Exames', key: 'exames', icon: FileText },
    { name: 'Consultas', key: 'consultas', icon: Stethoscope },
    { name: 'Internações', key: 'internacoes', icon: Building2 },
    { name: 'Procedimentos', key: 'procedimentos', icon: Activity },
    { name: 'Medicações', key: 'medicacoes', icon: Pill },
    { name: 'Agendamentos', key: 'agendamentos', icon: Calendar },
    { name: 'Histórico Hospitalar', key: 'historico-hospitalar', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Meu Portal de Saúde</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {user?.nome}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-2xl shadow-lg p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                          activeTab === item.key
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Perfil Tab */}
            {activeTab === 'perfil' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
                  <button
                    onClick={openEditarPerfilModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar Perfil</span>
                  </button>
                </div>
                {perfil && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
                      <div className="space-y-3">
                        <p><span className="font-medium">Nome:</span> {perfil.nome}</p>
                        <p><span className="font-medium">CPF:</span> {perfil.cpf}</p>
                        <p><span className="font-medium">CNS:</span> {perfil.cns}</p>
                        <p><span className="font-medium">Nascimento:</span> {format(new Date(perfil.nascimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
                      <div className="space-y-3">
                        <p><span className="font-medium">Telefone:</span> {perfil.telefone}</p>
                        <p><span className="font-medium">Email:</span> {perfil.email}</p>
                        <p><span className="font-medium">Endereço:</span> {perfil.endereco}</p>
                        <p><span className="font-medium">CEP:</span> {perfil.cep}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Consultas Tab */}
            {activeTab === 'consultas' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Minhas Consultas</h2>
                  <button
                    onClick={openSolicitarConsultaModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Solicitar Consulta</span>
                  </button>
                </div>
                {consultas && consultas.length > 0 ? (
                  <div className="space-y-4">
                    {consultas.map((consulta: any) => (
                      <div key={consulta.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{consulta.especialidade}</h3>
                            <p className="text-sm text-gray-600">{consulta.ubs.nome}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consulta.status)}`}>
                            {consulta.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Motivo:</span> {consulta.motivo}
                        </p>
                        {consulta.dataAgendada && (
                          <p className="text-sm text-gray-600 mb-3">
                            Agendada para: {format(new Date(consulta.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openDetalhesModal(consulta)}
                            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Detalhes</span>
                          </button>

                          {consulta.status === 'agendada' && (
                            <button
                              onClick={() => handleConfirmarConsulta(consulta.id)}
                              className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              <Check className="h-4 w-4" />
                              <span>Confirmar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma consulta encontrada.</p>
                  </div>
                )}
              </div>
            )}

            {/* Histórico Médico Tab */}
            {activeTab === 'historico' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico Médico</h2>
                {historicoMedico && historicoMedico.length > 0 ? (
                  <div className="space-y-4">
                    {historicoMedico.map((item: any) => (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{item.diagnostico}</h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(item.dataConsulta), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{item.funcionario.nome}</p>
                            <p className="text-sm text-gray-600">{item.funcionario.ubs.nome}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          <p><span className="font-medium">Laudo:</span> {item.laudo}</p>
                          {item.medicacao && <p><span className="font-medium">Medicação:</span> {item.medicacao}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum histórico médico encontrado.</p>
                  </div>
                )}
              </div>
            )}
            

            {/* Internações Tab */}
            {activeTab === 'internacoes' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Minhas Internações</h2>
                
                {/* Solicitações de Internação */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitações de Internação</h3>
                  {solicitacoesInternacao && solicitacoesInternacao.length > 0 ? (
                    <div className="space-y-4">
                      {solicitacoesInternacao.map((solicitacao: any) => (
                        <div key={solicitacao.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{solicitacao.hospital.nome}</h4>
                              <p className="text-sm text-gray-600">
                                Solicitado em: {format(new Date(solicitacao.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitacao.status)}`}>
                                {solicitacao.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(solicitacao.prioridade)}`}>
                                {solicitacao.prioridade}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Tipo:</p>
                              <p className="text-gray-600">{solicitacao.tipo}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Motivo:</p>
                              <p className="text-gray-600">{solicitacao.motivo}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Médico Solicitante:</p>
                              <p className="text-gray-600">{solicitacao.funcionario.nome}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">UBS:</p>
                              <p className="text-gray-600">{solicitacao.ubs.nome}</p>
                            </div>
                          </div>

                          {solicitacao.dataAgendada && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <p className="font-medium text-blue-800">Agendado para:</p>
                              <p className="text-blue-700">
                                {format(new Date(solicitacao.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })}
                                {solicitacao.horaAgendada && ` às ${solicitacao.horaAgendada}`}
                              </p>
                              {solicitacao.local && <p className="text-blue-700">Local: {solicitacao.local}</p>}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openDetalhesModal(solicitacao)}
                              className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Ver Detalhes</span>
                            </button>

                            {solicitacao.status === 'agendado' && (
                              <button
                                onClick={() => openConfirmarModal(solicitacao, 'internacao')}
                                className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                              >
                                <Check className="h-4 w-4" />
                                <span>Confirmar Agendamento</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Nenhuma solicitação de internação encontrada.</p>
                    </div>
                  )}
                </div>

                {/* Internações Realizadas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Internações Realizadas</h3>
                  {internacoes && internacoes.length > 0 ? (
                    <div className="space-y-4">
                      {internacoes.map((internacao: any) => (
                        <div key={internacao.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{internacao.hospital.nome}</h4>
                              <p className="text-sm text-gray-600">
                                Entrada: {format(new Date(internacao.dataEntrada), 'dd/MM/yyyy', { locale: ptBR })}
                                {internacao.dataSaida && ` - Saída: ${format(new Date(internacao.dataSaida), 'dd/MM/yyyy', { locale: ptBR })}`}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${internacao.dataSaida ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'}`}>
                              {internacao.dataSaida ? 'Finalizada' : 'Em andamento'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Motivo:</p>
                              <p className="text-gray-600">{internacao.motivo}</p>
                            </div>
                            {internacao.medicoResponsavel && (
                              <div>
                                <p className="font-medium text-gray-700">Médico Responsável:</p>
                                <p className="text-gray-600">{internacao.medicoResponsavel.nome}</p>
                              </div>
                            )}
                            {internacao.diagnostico && (
                              <div className="md:col-span-2">
                                <p className="font-medium text-gray-700">Diagnóstico:</p>
                                <p className="text-gray-600">{internacao.diagnostico}</p>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => openDetalhesModal(internacao)}
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Detalhes</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Nenhuma internação encontrada.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Outras abas mantidas do código anterior */}
            {activeTab === 'vacinas' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cartão de Vacinas</h2>
                {vacinas && vacinas.length > 0 ? (
                  <div className="space-y-4">
                    {vacinas.map((vacina: any) => (
                      <div key={vacina.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{vacina.nome}</h3>
                            <p className="text-sm text-gray-600">Lote: {vacina.lote}</p>
                            <p className="text-sm text-gray-600">
                              Aplicada em: {format(new Date(vacina.dataApl), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </div>
                          <button
                      onClick={() => generateVacinasPDF(vacinas, perfil)}
                      className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Printer className="w-5 h-5" />
                      <span>Imprimir PDF</span>
                    </button>
                          {vacina.proximaDose && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-600">Próxima dose:</p>
                              <p className="text-sm text-blue-800">
                                {format(new Date(vacina.proximaDose), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma vacina encontrada.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'exames' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Meus Exames</h2>
                {exames && exames.length > 0 ? (
                  <div className="space-y-4">
                    {exames.map((exame: any) => (
                      <div key={exame.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{exame.tipo}</h3>
                            <p className="text-sm text-gray-600">{exame.laboratorio.nome}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exame.status)}`}>
                            {exame.status}
                          </span>
                        </div>
                        {exame.dataRealizado && (
                          <p className="text-sm text-gray-600 mb-2">
                            Realizado em: {format(new Date(exame.dataRealizado), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                        {exame.resultado && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Resultado:</p>
                            <p className="text-sm text-green-700">{exame.resultado}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum exame encontrado.</p>
                  </div>
                )}
              </div>
            )}

            {/* Procedimentos, Medicações, Agendamentos e Histórico Hospitalar mantidos do código anterior */}
            {activeTab === 'procedimentos' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Procedimentos Hospitalares</h2>
                {procedimentosHospitalares && procedimentosHospitalares.length > 0 ? (
                  <div className="space-y-4">
                    {procedimentosHospitalares.map((procedimento: any) => (
                      <div key={procedimento.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{procedimento.tipo}</h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(procedimento.dataRealizacao), 'dd/MM/yyyy', { locale: ptBR })} - {procedimento.hospital.nome}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(procedimento.status)}`}>
                            {procedimento.status}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="font-medium text-gray-700 mb-1">Descrição:</p>
                          <p className="text-gray-600 text-sm">{procedimento.descricao}</p>
                        </div>

                        {procedimento.medicoRealizou && (
                          <div className="mb-4">
                            <p className="font-medium text-gray-700">Médico:</p>
                            <p className="text-gray-600 text-sm">{procedimento.medicoRealizou.nome} - {procedimento.medicoRealizou.funcao}</p>
                          </div>
                        )}

                        <button
                          onClick={() => openDetalhesModal(procedimento)}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver Detalhes</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum procedimento hospitalar encontrado.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medicacoes' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Medicações Hospitalares</h2>
                {medicacoesHospitalares && medicacoesHospitalares.length > 0 ? (
                  <div className="space-y-4">
                    {medicacoesHospitalares.map((medicacao: any) => (
                      <div key={medicacao.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{medicacao.nomeMedicacao}</h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(medicacao.dataHoraAdministracao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium text-gray-700">
                              {medicacao.internacao?.hospital?.nome || medicacao.procedimentoHospitalar?.hospital?.nome}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {medicacao.dosagem && (
                            <div>
                              <p className="font-medium text-gray-700">Dosagem:</p>
                              <p className="text-gray-600">{medicacao.dosagem}</p>
                            </div>
                          )}
                          {medicacao.viaAdministracao && (
                            <div>
                              <p className="font-medium text-gray-700">Via:</p>
                              <p className="text-gray-600">{medicacao.viaAdministracao}</p>
                            </div>
                          )}
                          {medicacao.administrador && (
                            <div>
                              <p className="font-medium text-gray-700">Administrado por:</p>
                              <p className="text-gray-600">{medicacao.administrador.nome}</p>
                            </div>
                          )}
                          {medicacao.observacoes && (
                            <div className="md:col-span-2">
                              <p className="font-medium text-gray-700">Observações:</p>
                              <p className="text-gray-600">{medicacao.observacoes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma medicação hospitalar encontrada.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'agendamentos' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Agendamentos Hospitalares</h2>
                {agendamentosHospitalares && agendamentosHospitalares.length > 0 ? (
                  <div className="space-y-4">
                    {agendamentosHospitalares.map((agendamento: any) => (
                      <div key={agendamento.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{agendamento.hospital.nome}</h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(agendamento.dataAgendamento), 'dd/MM/yyyy', { locale: ptBR })} às {agendamento.horaAgendamento}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                            {agendamento.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Tipo:</p>
                            <p className="text-gray-600">{agendamento.tipo}</p>
                          </div>
                          {agendamento.medico && (
                            <div>
                              <p className="font-medium text-gray-700">Médico:</p>
                              <p className="text-gray-600">{agendamento.medico.nome}</p>
                            </div>
                          )}
                          {agendamento.solicitacaoInternacao && (
                            <div className="md:col-span-2">
                              <p className="font-medium text-gray-700">Relacionado à:</p>
                              <p className="text-gray-600">{agendamento.solicitacaoInternacao.tipo} - {agendamento.solicitacaoInternacao.motivo}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openDetalhesModal(agendamento)}
                            className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Detalhes</span>
                          </button>

                          {agendamento.status === 'agendado' && (
                            <button
                              onClick={() => openConfirmarModal(agendamento, 'agendamento')}
                              className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              <Check className="h-4 w-4" />
                              <span>Confirmar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum agendamento hospitalar encontrado.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'historico-hospitalar' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico Hospitalar Completo</h2>
                
                {historicoHospitalar && (
                  <div className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{historicoHospitalar.resumo?.totalSolicitacoes || 0}</p>
                        <p className="text-sm text-blue-800">Solicitações</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{historicoHospitalar.resumo?.totalInternacoes || 0}</p>
                        <p className="text-sm text-green-800">Internações</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{historicoHospitalar.resumo?.totalProcedimentos || 0}</p>
                        <p className="text-sm text-purple-800">Procedimentos</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{historicoHospitalar.resumo?.totalMedicacoes || 0}</p>
                        <p className="text-sm text-yellow-800">Medicações</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{historicoHospitalar.resumo?.totalAgendamentos || 0}</p>
                        <p className="text-sm text-red-800">Agendamentos</p>
                      </div>
                    </div>

                    {historicoHospitalar.historico && historicoHospitalar.historico.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Linha do Tempo</h3>
                        {historicoHospitalar.historico.map((item: any, index: number) => (
                          <div key={`${item.tipo}-${item.id}`} className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="flex-1 border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {item.tipo === 'solicitacao' && 'Solicitação de Internação'}
                                    {item.tipo === 'internacao' && 'Internação'}
                                    {item.tipo === 'procedimento' && 'Procedimento'}
                                    {item.tipo === 'medicacao' && 'Medicação'}
                                    {item.tipo === 'agendamento' && 'Agendamento'}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {format(new Date(item.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                  </p>
                                </div>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  {item.tipo}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {item.tipo === 'solicitacao' && `${item.hospital?.nome} - ${item.motivo}`}
                                {item.tipo === 'internacao' && `${item.hospital?.nome} - ${item.motivo}`}
                                {item.tipo === 'procedimento' && `${item.hospital?.nome} - ${item.tipo}: ${item.descricao}`}
                                {item.tipo === 'medicacao' && `${item.nomeMedicacao} - ${item.dosagem || 'Dosagem não informada'}`}
                                {item.tipo === 'agendamento' && `${item.hospital?.nome} - ${item.tipo}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum histórico hospitalar encontrado.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Editar Perfil */}
      {showEditarPerfilModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Editar Perfil</h3>
              <button
                onClick={() => setShowEditarPerfilModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAtualizarPerfil} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={perfilData.endereco}
                  onChange={(e) => setPerfilData({ ...perfilData, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={perfilData.telefone}
                  onChange={(e) => setPerfilData({ ...perfilData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={perfilData.email}
                  onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditarPerfilModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={atualizarPerfilMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{atualizarPerfilMutation.isLoading ? 'Salvando...' : 'Salvar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Solicitar Consulta */}
      {showSolicitarConsultaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Solicitar Consulta</h3>
              <button
                onClick={() => setShowSolicitarConsultaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSolicitarConsulta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UBS *
                </label>
                <select
                  value={consultaData.ubsId}
                  onChange={(e) => setConsultaData({ ...consultaData, ubsId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma UBS</option>
                  {ubsList?.map((ubs: any) => (
                    <option key={ubs.id} value={ubs.id}>
                      {ubs.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidade *
                </label>
                <select
                  value={consultaData.especialidade}
                  onChange={(e) => setConsultaData({ ...consultaData, especialidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione uma especialidade</option>
                  <option value="Clínica Geral">Clínica Geral</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Ginecologia">Ginecologia</option>
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Dermatologia">Dermatologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Psicologia">Psicologia</option>
                  <option value="Nutrição">Nutrição</option>
                  <option value="Fisioterapia">Fisioterapia</option>
                  <option value="Odontologia">Odontologia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo da Consulta *
                </label>
                <textarea
                  value={consultaData.motivo}
                  onChange={(e) => setConsultaData({ ...consultaData, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva o motivo da consulta..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSolicitarConsultaModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={solicitarConsultaMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{solicitarConsultaMutation.isLoading ? 'Solicitando...' : 'Solicitar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetalhesModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Detalhes</h3>
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmarModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Confirmar Agendamento</h3>
              <button
                onClick={() => setShowConfirmarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">
                {selectedItem.hospital?.nome || 'Hospital'}
              </p>
              <p className="text-sm text-gray-600">
                {selectedItem.dataAgendada && format(new Date(selectedItem.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })}
                {selectedItem.dataAgendamento && format(new Date(selectedItem.dataAgendamento), 'dd/MM/yyyy', { locale: ptBR })}
                {selectedItem.horaAgendada && ` às ${selectedItem.horaAgendada}`}
                {selectedItem.horaAgendamento && ` às ${selectedItem.horaAgendamento}`}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações (opcional)
              </label>
              <textarea
                value={confirmacaoObservacoes}
                onChange={(e) => setConfirmacaoObservacoes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Alguma observação sobre a confirmação..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmarModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAgendamento}
                disabled={confirmarAgendamentoMutation.isLoading || confirmarAgendamentoHospitalarMutation.isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>
                  {(confirmarAgendamentoMutation.isLoading || confirmarAgendamentoHospitalarMutation.isLoading) 
                    ? 'Confirmando...' 
                    : 'Confirmar'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacienteDashboard;