import React, { useState } from 'react';
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
  Users,
  MapPin,
  Phone,
  Mail,
  Activity,
  History,
  Edit,
  Save,
  Printer,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateHistoricoMedicoPDF, generateVacinasPDF } from '../../utils/pdfGenerator';

const PacienteDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('home');
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [showEditarPerfilModal, setShowEditarPerfilModal] = useState(false);
  const [showSolicitarConsultaModal, ] = useState(false);
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
    () => api.get('/paciente/perfil').then(res => res.data)
  );

  const { data: campanhas } = useQuery(
    'campanhas-ativas',
    () => api.get('/campanhas/ativas').then(res => res.data),
    { enabled: activeTab === 'home' }
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

  

  

   const { data: ubsList} = useQuery(
    'ubs-list',
    () => api.get('/paciente/ubs').then(res => res.data),
    { enabled: showConsultaModal }
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
        setShowConsultaModal(false);
        setConsultaData({ ubsId: '', motivo: '', especialidade: '' });
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
        toast.success('Consulta confirmada!');
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

  const handleConsultaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    solicitarConsultaMutation.mutate(consultaData);
  };

  const openConfirmarModal = (item: any, tipo: 'internacao' | 'agendamento') => {
    setSelectedItem({ ...item, tipoConfirmacao: tipo });
    setShowConfirmarModal(true);
  };

  const openEditarPerfilModal = () => {
    setShowEditarPerfilModal(true);
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
    { name: 'Consultas', key: 'consultas', icon: Stethoscope },
    { name: 'Vacinas', key: 'vacinas', icon: Shield },
    { name: 'Exames', key: 'exames', icon: FileText },
    { name: 'Internações', key: 'internacoes', icon: Building2 },
    { name: 'Procedimentos', key: 'procedimentos', icon: Activity },
    { name: 'Medicações', key: 'medicacoes', icon: Pill },
    { name: 'Agendamentos', key: 'agendamentos', icon: Calendar },
    { name: 'Histórico Médico', key: 'historico', icon: Heart },
    { name: 'Histórico Hospitalar', key: 'historico-hospitalar', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-orange-800" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Meu Portal de Saúde</h1>
                <p className="text-sm text-gray-600">Bem-vindo, {user?.nome}</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-800 transition-colors"
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
                            ? 'bg-green-500 text-white'
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

             {/* Home Tab */}
            {activeTab === 'home' && (
              <div className="space-y-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-green-500 via-green-900 to-green-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
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
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
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
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
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
                        <p className="text-sm text-green-500">Consulta</p>
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
                      <div className="p-3 bg-orange-400 rounded-xl group-hover:bg-orange-600 transition-colors">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-orange-600">Cartão de</p>
                        <p className="text-sm text-orange-400">Vacinas</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}   

            {/* Perfil Tab */}
            {activeTab === 'perfil' && perfil && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Meu Perfil</h2>
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                  </div>
                  <button
                    onClick={openEditarPerfilModal}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Editar Perfil</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Nome Completo</label>
                    </div>
                    <p className="text-gray-800 text-lg font-medium">{perfil.nome}</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">CPF</label>
                    </div>
                    <p className="text-gray-800 text-lg font-medium">{perfil.cpf}</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">CNS</label>
                    </div>
                    <p className="text-gray-800 text-lg font-medium">{perfil.cns}</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Data de Nascimento</label>
                    </div>
                    <p className="text-gray-800 text-lg font-medium">
                      {format(new Date(perfil.nascimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Email</label>
                    </div>
                    <p className="text-gray-800 text-lg font-medium break-words">{perfil.email}</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Telefone</label>
                    </div>
                    <p className="text-gray-800 text-lg font-medium">{perfil.telefone}</p>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <label className="text-sm font-bold text-blue-800 uppercase tracking-wide">Endereço</label>
                    </div>
                    <p className="text-gray-800 text-lg font-medium">{perfil.endereco}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Consultas Tab */}
            {activeTab === 'consultas' && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-2xl">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Minhas Consultas</h2>
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full"></div>
                  </div>
                  <button
                    onClick={() => setShowConsultaModal(true)}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-300 to-indigo-400 text-white rounded-2xl hover:from-blue-500 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Solicitar Consulta</span>
                  </button>
                </div>
                
                {consultas && consultas.length > 0 ? (
                  <div className="space-y-6">
                    {consultas.map((consulta: any) => (
                      <div key={consulta.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{consulta.especialidade}</h3>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <p className="text-gray-600 font-medium">{consulta.ubs.nome}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(consulta.status)}`}>
                              {getStatusIcon(consulta.status)}
                              <span className="ml-1 capitalize">{consulta.status}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Motivo</label>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-gray-900 font-medium">{consulta.motivo}</p>
                            </div>
                          </div>
                          
                          {consulta.dataAgendada && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Data Agendada</label>
                              <p className="text-gray-900 font-medium">
                                {format(new Date(consulta.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          )}
                          
                          {consulta.funcionario && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Profissional</label>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-gray-900 font-semibold">{consulta.funcionario.nome}</p>
                                <p className="text-gray-600">{consulta.funcionario.funcao}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6">
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Local</label>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <p className="text-gray-900 font-medium">{consulta.ubs.endereco}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <p className="text-gray-600">{consulta.ubs.telefone}</p>
                            </div>
                          </div>
                        </div>
                        
                        {consulta.status === 'agendada' && (
                          <div className="mt-6">
                            <button
                              onClick={() => confirmarConsultaMutation.mutate(consulta.id)}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                            >
                              Confirmar Consulta
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <Calendar className="w-16 h-16 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-3">Nenhuma consulta encontrada</h3>
                    <p className="text-gray-500 max-w-md mx-auto text-lg">
                      Não há consultas registradas para este paciente no momento.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Modal Solicitar Consulta */}
      {showSolicitarConsultaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-300 to-blue-500 rounded-2xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Solicitar Consulta</h3>
            </div>
            
            <form onSubmit={handleConsultaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">UBS</label>
                <select
                  value={consultaData.ubsId}
                  onChange={(e) => setConsultaData({ ...consultaData, ubsId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  required
                >
                  <option value="">Selecione uma UBS</option>
                  {ubsList?.map((ubs: any) => (
                    <option key={ubs.id} value={ubs.id}>{ubs.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Especialidade</label>
                <input
                  type="text"
                  value={consultaData.especialidade}
                  onChange={(e) => setConsultaData({ ...consultaData, especialidade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Ex: Clínico Geral, Cardiologia..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Motivo</label>
                <textarea
                  value={consultaData.motivo}
                  onChange={(e) => setConsultaData({ ...consultaData, motivo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg resize-none"
                  rows={4}
                  placeholder="Descreva o motivo da consulta..."
                  required
                />
              </div>
              
              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-300 to-indigo-400 text-white py-4 px-6 rounded-2xl hover:from-blue-500 hover:to-indigo-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Solicitar
                </button>
                <button
                  type="button"
                  onClick={() => setShowConsultaModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Histórico Médico Tab */}
            {activeTab === 'historico' && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Histórico Médico</h2>
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full"></div>
                  </div>
                  {historicoMedico && historicoMedico.length > 0 && (
                    <button
                      onClick={() => generateHistoricoMedicoPDF(historicoMedico, perfil)}
                      className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Printer className="w-5 h-5" />
                      <span>Imprimir PDF</span>
                    </button>
                  )}
                </div>
                
                {historicoMedico && historicoMedico.length > 0 ? (
                  <div className="space-y-6">
                    {historicoMedico.map((item: any) => (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
                      >
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 text-white">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-3 leading-tight">{item.diagnostico}</h3>
                              <div className="flex items-center gap-2 text-blue-100">
                                <Calendar className="w-5 h-5" />
                                <span className="font-semibold text-lg">
                                  {format(new Date(item.dataConsulta), 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="lg:text-right bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Stethoscope className="w-5 h-5" />
                                <p className="font-bold">{item.funcionario.nome}</p>
                            </div>
                              <p className="text-sm text-blue-100 mb-1">{item.funcionario.funcao}</p>
                              <p className="text-sm text-blue-100">{item.funcionario.ubs.nome}</p>
                          </div>
                        </div>
                        </div>

                        <div className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {item.doenca && (
                              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 p-5 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                  <AlertCircle className="w-6 h-6 text-red-500" />
                                  <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Doença</p>
                                </div>
                                <p className="text-red-800 font-semibold text-lg">{item.doenca}</p>
                              </div>
                            )}
                            
                            {item.medicacao && (
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-5 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                  <CheckCircle className="w-6 h-6 text-green-500" />
                                  <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Medicação</p>
                                </div>
                                <p className="text-green-800 font-semibold text-lg">{item.medicacao}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-6">
                            {item.laudo && (
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                <div className="flex items-center gap-3 mb-4">
                                  <FileText className="w-6 h-6 text-blue-600" />
                                  <h4 className="font-bold text-blue-800 uppercase tracking-wide">Laudo Médico</h4>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
                                  <p className="text-gray-800 leading-relaxed text-lg">{item.laudo}</p>
                                </div>
                              </div>
                            )}
                            
                            {item.observacoes && (
                              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                                <div className="flex items-center gap-3 mb-4">
                                  <AlertCircle className="w-6 h-6 text-amber-600" />
                                  <h4 className="font-bold text-amber-800 uppercase tracking-wide">Observações</h4>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-amber-100 shadow-sm">
                                  <p className="text-gray-800 leading-relaxed text-lg">{item.observacoes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
      
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <Heart className="w-16 h-16 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-3">Nenhum histórico encontrado</h3>
                    <p className="text-gray-500 max-w-md mx-auto text-lg">
                      Não há registros médicos disponíveis para este paciente no momento.
                    </p>
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
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-300 to-violet-600 rounded-2xl">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Cartão de Vacinas</h2>
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"></div>
                  </div>
                  {vacinas && vacinas.length > 0 && (
                    <button
                      onClick={() => generateVacinasPDF(vacinas, perfil)}
                      className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Printer className="w-5 h-5" />
                      <span>Imprimir PDF</span>
                    </button>
                  )}
                </div>
                
                {vacinas && vacinas.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                      <thead className="bg-gradient-to-r from-purple-50 to-violet-50">
                        <tr>
                          <th className="px-8 py-4 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                            Vacina
                          </th>
                          <th className="px-8 py-4 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                            Data de Aplicação
                          </th>
                          <th className="px-8 py-4 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                            Lote
                          </th>
                          <th className="px-8 py-4 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                            Próxima Dose
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {vacinas.map((vacina: any) => (
                          <tr key={vacina.id} className="hover:bg-purple-50 transition-colors duration-200">
                            <td className="px-8 py-5 whitespace-nowrap text-base font-semibold text-gray-900">
                              {vacina.nome}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-base text-gray-700">
                              {format(new Date(vacina.dataApl), 'dd/MM/yyyy', { locale: ptBR })}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-base text-gray-700">
                              {vacina.lote}
                            </td>
                            <td className="px-8 py-5 whitespace-nowrap text-base text-gray-700">
                              {vacina.proximaDose 
                                ? format(new Date(vacina.proximaDose), 'dd/MM/yyyy', { locale: ptBR })
                                : 'Não aplicável'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mb-6">
                      <Shield className="w-16 h-16 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-3">Nenhuma vacina registrada</h3>
                    <p className="text-gray-500 max-w-md mx-auto text-lg">
                      Não há vacinas registradas para este paciente no momento.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'exames' && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Meus Exames</h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mt-2"></div>
                  </div>
                </div>
                
                {exames && exames.length > 0 ? (
                  <div className="space-y-6">
                    {exames.map((exame: any) => (
                      <div key={exame.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{exame.tipo}</h3>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <p className="text-gray-600 font-medium">{exame.laboratorio.nome}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(exame.status)}`}>
                              {getStatusIcon(exame.status)}
                              <span className="ml-1 capitalize">{exame.status}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {exame.dataAgendada && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Data Agendada</label>
                              <p className="text-gray-900 font-medium">
                                {format(new Date(exame.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                </div>
                          )}
                          
                          {exame.dataRealizado && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Data Realizada</label>
                              <p className="text-gray-900 font-medium">
                                {format(new Date(exame.dataRealizado), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {exame.resultado && (
                          <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Resultado</label>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-gray-900 font-medium">{exame.resultado}</p>
                            </div>
                          </div>
                        )}
                        
                        {exame.arquivoPdf && (
                          <div className="mt-6">
                            <a
                              href={`http://localhost:3001/api/exames/download/${exame.arquivoPdf}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                            >
                              <Download className="h-5 w-5" />
                              <span>Baixar Laudo</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-16 h-16 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-3">Nenhum exame encontrado</h3>
                    <p className="text-gray-500 max-w-md mx-auto text-lg">
                      Não há exames registrados para este paciente no momento.
                    </p>
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
      {activeTab === 'consultas' && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Minhas Consultas</h2>
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                  </div>
                  <button
                    onClick={() => setShowConsultaModal(true)}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Solicitar Consulta</span>
                  </button>
                </div>
                
                {consultas && consultas.length > 0 ? (
                  <div className="space-y-6">
                    {consultas.map((consulta: any) => (
                      <div key={consulta.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{consulta.especialidade}</h3>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <p className="text-gray-600 font-medium">{consulta.ubs.nome}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(consulta.status)}`}>
                              {getStatusIcon(consulta.status)}
                              <span className="ml-1 capitalize">{consulta.status}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Motivo</label>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-gray-900 font-medium">{consulta.motivo}</p>
                            </div>
                          </div>
                          
                          {consulta.dataAgendada && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Data Agendada</label>
                              <p className="text-gray-900 font-medium">
                                {format(new Date(consulta.dataAgendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          )}
                          
                          {consulta.funcionario && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Profissional</label>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-gray-900 font-semibold">{consulta.funcionario.nome}</p>
                                <p className="text-gray-600">{consulta.funcionario.funcao}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6">
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Local</label>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <p className="text-gray-900 font-medium">{consulta.ubs.endereco}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <p className="text-gray-600">{consulta.ubs.telefone}</p>
                            </div>
                          </div>
                        </div>
                        
                        {consulta.status === 'agendada' && (
                          <div className="mt-6">
                            <button
                              onClick={() => confirmarConsultaMutation.mutate(consulta.id)}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                            >
                              Confirmar Consulta
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                      <Calendar className="w-16 h-16 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-3">Nenhuma consulta encontrada</h3>
                    <p className="text-gray-500 max-w-md mx-auto text-lg">
                      Não há consultas registradas para este paciente no momento.
                    </p>
                  </div>
                )}
              </div>
      )}

      {showConsultaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Solicitar Consulta</h3>
            </div>
            
            <form onSubmit={handleConsultaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">UBS</label>
                <select
                  value={consultaData.ubsId}
                  onChange={(e) => setConsultaData({ ...consultaData, ubsId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  required
                >
                  <option value="">Selecione uma UBS</option>
                  {ubsList?.map((ubs: any) => (
                    <option key={ubs.id} value={ubs.id}>{ubs.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Especialidade</label>
                <input
                  type="text"
                  value={consultaData.especialidade}
                  onChange={(e) => setConsultaData({ ...consultaData, especialidade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Ex: Clínico Geral, Cardiologia..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Motivo</label>
                <textarea
                  value={consultaData.motivo}
                  onChange={(e) => setConsultaData({ ...consultaData, motivo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg resize-none"
                  rows={4}
                  placeholder="Descreva o motivo da consulta..."
                  required
                />
              </div>
              
              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Solicitar
                </button>
                <button
                  type="button"
                  onClick={() => setShowConsultaModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                >
                  Cancelar
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