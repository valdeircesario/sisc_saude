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
  Plus,
  Printer,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateVacinasPDF } from '../../utils/pdfGenerator';

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

   const getStatusIcon = (status: string) => {
    switch (status) {
      case 'realizado':
      case 'realizada':
        return <CheckCircle className="h-4 w-4" />;
      case 'agendado':
      case 'agendada':
        return <Clock className="h-4 w-4" />;
      case 'solicitada':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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

          {/* Home Tab */}
            {activeTab === 'home' && (
              <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      <Activity className="h-12 w-12 text-white" />
                      <div>
                        <h2 className="text-3xl font-bold">Olá, {user?.nome}!</h2>
                        <p className="text-blue-100 text-lg">Como está sua saúde hoje?</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                        <Calendar className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">Próxima Consulta</p>
                        <p className="text-xs text-blue-100">Em breve</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                        <Shield className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">Vacinas em Dia</p>
                        <p className="text-xs text-blue-100">Atualizado</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                        <FileText className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">Exames</p>
                        <p className="text-xs text-blue-100">Disponíveis</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Campanhas e Notícias</h2>
                  </div>
                  
                  {campanhas && campanhas.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {campanhas.map((campanha: any) => (
                        <div key={campanha.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                              {campanha.tipo}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                              {format(new Date(campanha.dataIni), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">
                            {campanha.titulo}
                          </h3>
                          <p className="text-gray-600 mb-4 leading-relaxed">{campanha.descricao}</p>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <p className="font-semibold text-gray-900">{campanha.ubs.nome}</p>
                            </div>
                            <p className="text-gray-600 text-sm">{campanha.ubs.endereco}</p>
                            </div>
                          </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhuma campanha ativa no momento</p>
                    </div>
                  )}
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Ações Rápidas</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                      onClick={() => setShowConsultaModal(true)}
                      className="group flex items-center space-x-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-blue-100"
                    >
                      <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-900">Solicitar</p>
                        <p className="text-sm text-blue-700">Consulta</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('exames')}
                      className="group flex items-center space-x-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-green-100"
                    >
                      <div className="p-3 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900">Ver</p>
                        <p className="text-sm text-green-700">Exames</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('vacinas')}
                      className="group flex items-center space-x-4 p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl hover:from-purple-100 hover:to-violet-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-purple-100"
                    >
                      <div className="p-3 bg-purple-500 rounded-xl group-hover:bg-purple-600 transition-colors">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-purple-900">Cartão de</p>
                        <p className="text-sm text-purple-700">Vacinas</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
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