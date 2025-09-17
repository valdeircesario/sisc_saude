import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter,
  Search,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SolicitacaoInternacao {
  id: string;
  tipo: string;
  motivo: string;
  detalhes: string;
  laudoMedico: string;
  prioridade: string;
  status: string;
  dataAgendada?: string;
  horaAgendada?: string;
  local?: string;
  recomendacoes?: string;
  observacoes?: string;
  createdAt: string;
  paciente: {
    id: string;
    nome: string;
    cpf: string;
    cns: string;
    telefone: string;
    email: string;
    nascimento: string;
    endereco: string;
  };
  funcionario: {
    nome: string;
    funcao: string;
    crm?: string;
  };
  ubs: {
    nome: string;
    telefone: string;
    endereco: string;
  };
}

const SolicitacoesInternacao: React.FC = () => {
  const queryClient = useQueryClient();
  const [filtros, setFiltros] = useState({
    status: '',
    prioridade: '',
    tipo: ''
  });
  const [busca, setBusca] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoInternacao | null>(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false);
  const [showRejeicaoModal, setShowRejeicaoModal] = useState(false);

  const [agendamentoData, setAgendamentoData] = useState({
    dataAgendada: '',
    horaAgendada: '',
    local: '',
    recomendacoes: '',
    observacoes: ''
  });

  const [rejeicaoData, setRejeicaoData] = useState({
    motivoRejeicao: '',
    observacoes: ''
  });

  // Query para buscar solicitações
  const { data: solicitacoes, isLoading } = useQuery(
    ['solicitacoes-internacao', filtros, busca],
    () => {
      const params = new URLSearchParams();
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.prioridade) params.append('prioridade', filtros.prioridade);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (busca) params.append('busca', busca);
      
      return api.get(`/hospital/solicitacoes-internacao?${params}`).then(res => res.data);
    }
  );

  // Query para estatísticas
  const { data: stats } = useQuery(
    'dashboard-solicitacoes-internacao',
    () => api.get('/hospital/dashboard/solicitacoes-internacao').then(res => res.data)
  );

  // Mutations
  const aceitarSolicitacaoMutation = useMutation(
    (data: { id: string; observacoes?: string }) =>
      api.put(`/hospital/solicitacoes-internacao/${data.id}/aceitar`, { observacoes: data.observacoes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('solicitacoes-internacao');
        queryClient.invalidateQueries('dashboard-solicitacoes-internacao');
        toast.success('Solicitação aceita com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao aceitar solicitação');
      }
    }
  );

  const agendarSolicitacaoMutation = useMutation(
    (data: { id: string } & typeof agendamentoData) =>
      api.put(`/hospital/solicitacoes-internacao/${data.id}/agendar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('solicitacoes-internacao');
        queryClient.invalidateQueries('dashboard-solicitacoes-internacao');
        toast.success('Internação agendada com sucesso!');
        setShowAgendamentoModal(false);
        resetAgendamentoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao agendar internação');
      }
    }
  );

  const rejeitarSolicitacaoMutation = useMutation(
    (data: { id: string } & typeof rejeicaoData) =>
      api.put(`/hospital/solicitacoes-internacao/${data.id}/rejeitar`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('solicitacoes-internacao');
        queryClient.invalidateQueries('dashboard-solicitacoes-internacao');
        toast.success('Solicitação rejeitada');
        setShowRejeicaoModal(false);
        resetRejeicaoForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao rejeitar solicitação');
      }
    }
  );

  const resetAgendamentoForm = () => {
    setAgendamentoData({
      dataAgendada: '',
      horaAgendada: '',
      local: '',
      recomendacoes: '',
      observacoes: ''
    });
  };

  const resetRejeicaoForm = () => {
    setRejeicaoData({
      motivoRejeicao: '',
      observacoes: ''
    });
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'gravissimo': return 'bg-red-900 text-white';
      case 'urgente': return 'bg-red-600 text-white';
      case 'grave': return 'bg-orange-500 text-white';
      case 'medio': return 'bg-yellow-500 text-white';
      case 'leve': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'avaliando': return 'bg-blue-100 text-blue-800';
      case 'agendado': return 'bg-green-100 text-green-800';
      case 'realizado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAgendar = (solicitacao: SolicitacaoInternacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setShowAgendamentoModal(true);
  };

  const handleRejeitar = (solicitacao: SolicitacaoInternacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setShowRejeicaoModal(true);
  };

  const handleVerDetalhes = (solicitacao: SolicitacaoInternacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setShowDetalhesModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pendentes</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.porStatus?.pendente || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Agendadas</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.porStatus?.agendado || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Urgentes</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.urgentes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Realizadas</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.porStatus?.realizado || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente, CPF, CNS..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filtros.status}
            onChange={(e) => setFiltros({...filtros, status: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="avaliando">Avaliando</option>
            <option value="agendado">Agendado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={filtros.prioridade}
            onChange={(e) => setFiltros({...filtros, prioridade: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as prioridades</option>
            <option value="gravissimo">Gravíssimo</option>
            <option value="urgente">Urgente</option>
            <option value="grave">Grave</option>
            <option value="medio">Médio</option>
            <option value="leve">Leve</option>
          </select>

          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="internacao">Internação</option>
            <option value="cirurgia">Cirurgia</option>
            <option value="procedimento">Procedimento</option>
            <option value="emergencia">Emergência</option>
          </select>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="bg-white rounded-xl shadow-lg">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {solicitacoes?.length > 0 ? (
              solicitacoes.map((solicitacao: SolicitacaoInternacao) => (
                <div key={solicitacao.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {solicitacao.paciente.nome}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(solicitacao.prioridade)}`}>
                          {solicitacao.prioridade.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitacao.status)}`}>
                          {solicitacao.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          CPF: {solicitacao.paciente.cpf}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {solicitacao.paciente.telefone}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(solicitacao.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2" />
                          Tipo: {solicitacao.tipo}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          UBS: {solicitacao.ubs.nome}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Dr(a). {solicitacao.funcionario.nome}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-900">
                          <span className="font-medium">Motivo:</span> {solicitacao.motivo}
                        </p>
                      </div>

                      {solicitacao.dataAgendada && (
                        <div className="bg-green-50 p-3 rounded-lg mb-4">
                          <p className="text-green-800">
                            <span className="font-medium">Agendado para:</span> {' '}
                            {format(new Date(solicitacao.dataAgendada), 'dd/MM/yyyy', { locale: ptBR })} às {solicitacao.horaAgendada}
                            {solicitacao.local && ` - ${solicitacao.local}`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      <button
                        onClick={() => handleVerDetalhes(solicitacao)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalhes
                      </button>

                      {solicitacao.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => aceitarSolicitacaoMutation.mutate({ id: solicitacao.id })}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aceitar
                          </button>
                          <button
                            onClick={() => handleRejeitar(solicitacao)}
                            className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </button>
                        </>
                      )}

                      {(solicitacao.status === 'pendente' || solicitacao.status === 'avaliando') && (
                        <button
                          onClick={() => handleAgendar(solicitacao)}
                          className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Agendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma solicitação encontrada.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetalhesModal && solicitacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-4xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Detalhes da Solicitação</h3>
              <button
                onClick={() => setShowDetalhesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Dados do Paciente</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nome:</span> {solicitacaoSelecionada.paciente.nome}</p>
                  <p><span className="font-medium">CPF:</span> {solicitacaoSelecionada.paciente.cpf}</p>
                  <p><span className="font-medium">CNS:</span> {solicitacaoSelecionada.paciente.cns}</p>
                  <p><span className="font-medium">Telefone:</span> {solicitacaoSelecionada.paciente.telefone}</p>
                  <p><span className="font-medium">Email:</span> {solicitacaoSelecionada.paciente.email}</p>
                  <p><span className="font-medium">Endereço:</span> {solicitacaoSelecionada.paciente.endereco}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Dados da Solicitação</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Tipo:</span> {solicitacaoSelecionada.tipo}</p>
                  <p><span className="font-medium">Prioridade:</span> {solicitacaoSelecionada.prioridade}</p>
                  <p><span className="font-medium">Status:</span> {solicitacaoSelecionada.status}</p>
                  <p><span className="font-medium">Solicitante:</span> {solicitacaoSelecionada.funcionario.nome}</p>
                  <p><span className="font-medium">UBS:</span> {solicitacaoSelecionada.ubs.nome}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Motivo</h4>
                <p className="text-gray-700">{solicitacaoSelecionada.motivo}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Detalhes</h4>
                <p className="text-gray-700">{solicitacaoSelecionada.detalhes}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Laudo Médico</h4>
                <p className="text-gray-700">{solicitacaoSelecionada.laudoMedico}</p>
              </div>

              {solicitacaoSelecionada.observacoes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Observações</h4>
                  <p className="text-gray-700">{solicitacaoSelecionada.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamento */}
      {showAgendamentoModal && solicitacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Agendar Internação</h3>
            <p className="text-gray-600 mb-6">Paciente: {solicitacaoSelecionada.paciente.nome}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                agendarSolicitacaoMutation.mutate({
                  id: solicitacaoSelecionada.id,
                  ...agendamentoData
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={agendamentoData.dataAgendada}
                    onChange={(e) => setAgendamentoData({...agendamentoData, dataAgendada: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={agendamentoData.horaAgendada}
                    onChange={(e) => setAgendamentoData({...agendamentoData, horaAgendada: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <input
                  type="text"
                  value={agendamentoData.local}
                  onChange={(e) => setAgendamentoData({...agendamentoData, local: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ala A - Leito 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recomendações</label>
                <textarea
                  value={agendamentoData.recomendacoes}
                  onChange={(e) => setAgendamentoData({...agendamentoData, recomendacoes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Recomendações para o paciente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={agendamentoData.observacoes}
                  onChange={(e) => setAgendamentoData({...agendamentoData, observacoes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAgendamentoModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Rejeição */}
      {showRejeicaoModal && solicitacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Rejeitar Solicitação</h3>
            <p className="text-gray-600 mb-6">Paciente: {solicitacaoSelecionada.paciente.nome}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                rejeitarSolicitacaoMutation.mutate({
                  id: solicitacaoSelecionada.id,
                  ...rejeicaoData
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Rejeição</label>
                <select
                  value={rejeicaoData.motivoRejeicao}
                  onChange={(e) => setRejeicaoData({...rejeicaoData, motivoRejeicao: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um motivo</option>
                  <option value="Falta de leitos disponíveis">Falta de leitos disponíveis</option>
                  <option value="Não é caso para internação">Não é caso para internação</option>
                  <option value="Documentação incompleta">Documentação incompleta</option>
                  <option value="Especialidade não disponível">Especialidade não disponível</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={rejeicaoData.observacoes}
                  onChange={(e) => setRejeicaoData({...rejeicaoData, observacoes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Observações adicionais sobre a rejeição..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRejeicaoModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rejeitar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitacoesInternacao;