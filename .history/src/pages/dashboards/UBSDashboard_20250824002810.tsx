import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, Guitar as Hospital, FileText, Search, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  cns: string;
  telefone: string;
  email: string;
  endereco: string;
  nascimento: string;
}

interface Funcionario {
  id: string;
  nome: string;
  funcao: string;
  crm?: string;
  cpf: string;
  telefone: string;
  email: string;
}

interface Hospital {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  cnpj: string;
}

interface SolicitacaoInternacao {
  id: string;
  tipo: string;
  motivo: string;
  detalhes: string;
  laudoMedico: string;
  prioridade: string;
  status: string;
  createdAt: string;
  paciente: {
    nome: string;
    cpf: string;
    cns: string;
  };
  hospital: {
    nome: string;
  };
  funcionario: {
    nome: string;
    funcao: string;
  };
}

const UBSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pacientes');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoInternacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'internacao' | 'funcionario' | null>(null);

  // Estados do formulário de internação
  const [formInternacao, setFormInternacao] = useState({
    pacienteId: '',
    hospitalId: '',
    funcionarioId: '',
    tipo: '',
    motivo: '',
    detalhes: '',
    laudoMedico: '',
    prioridade: 'medio'
  });

  // Estados do formulário de funcionário
  const [formFuncionario, setFormFuncionario] = useState({
    nome: '',
    funcao: '',
    crm: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'pacientes':
          await loadPacientes();
          break;
        case 'funcionarios':
          await loadFuncionarios();
          break;
        case 'internacoes':
          await loadSolicitacoes();
          await loadHospitais();
          await loadFuncionarios();
          await loadPacientes();
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPacientes = async () => {
    try {
      const response = await fetch('/api/ubs/pacientes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPacientes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const loadFuncionarios = async () => {
    try {
      const response = await fetch('/api/ubs/funcionarios', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFuncionarios(data);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  const loadHospitais = async () => {
    try {
      const response = await fetch('/api/ubs/hospitais', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHospitais(data);
      }
    } catch (error) {
      console.error('Erro ao carregar hospitais:', error);
    }
  };

  const loadSolicitacoes = async () => {
    try {
      const response = await fetch('/api/ubs/solicitacoes-internacao', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSolicitacoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  };

  const handleSubmitInternacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/ubs/solicitar-internacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formInternacao)
      });

      if (response.ok) {
        alert('Solicitação de internação enviada com sucesso!');
        setShowModal(false);
        setFormInternacao({
          pacienteId: '',
          hospitalId: '',
          funcionarioId: '',
          tipo: '',
          motivo: '',
          detalhes: '',
          laudoMedico: '',
          prioridade: 'medio'
        });
        await loadSolicitacoes();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação de internação');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/ubs/funcionarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formFuncionario)
      });

      if (response.ok) {
        alert('Funcionário cadastrado com sucesso!');
        setShowModal(false);
        setFormFuncionario({
          nome: '',
          funcao: '',
          crm: '',
          cpf: '',
          telefone: '',
          email: '',
          senha: ''
        });
        await loadFuncionarios();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      alert('Erro ao cadastrar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'internacao' | 'funcionario') => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'text-yellow-600 bg-yellow-100';
      case 'aprovada':
        return 'text-green-600 bg-green-100';
      case 'rejeitada':
        return 'text-red-600 bg-red-100';
      case 'cancelada':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'text-red-600 bg-red-100';
      case 'medio':
        return 'text-yellow-600 bg-yellow-100';
      case 'baixa':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.cpf.includes(searchTerm) ||
    paciente.cns.includes(searchTerm)
  );

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard UBS</h1>
              <p className="text-gray-600">Sistema de Gestão da Unidade Básica de Saúde</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => openModal('funcionario')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Novo Funcionário</span>
              </button>
              <button
                onClick={() => openModal('internacao')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Hospital className="w-5 h-5" />
                <span>Solicitar Internação</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'pacientes', label: 'Pacientes', icon: Users },
              { id: 'funcionarios', label: 'Funcionários', icon: UserPlus },
              { id: 'internacoes', label: 'Solicitações de Internação', icon: Hospital }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Pacientes Tab */}
        {activeTab === 'pacientes' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Pacientes Cadastrados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPacientes.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{paciente.nome}</div>
                        <div className="text-sm text-gray-500">{paciente.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paciente.cpf}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paciente.cns}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paciente.telefone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Funcionários Tab */}
        {activeTab === 'funcionarios' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Funcionários da UBS</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CRM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFuncionarios.map((funcionario) => (
                    <tr key={funcionario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{funcionario.nome}</div>
                        <div className="text-sm text-gray-500">{funcionario.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {funcionario.funcao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {funcionario.crm || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {funcionario.telefone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Solicitações de Internação Tab */}
        {activeTab === 'internacoes' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Solicitações de Internação</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{solicitacao.paciente.nome}</div>
                        <div className="text-sm text-gray-500">CPF: {solicitacao.paciente.cpf}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {solicitacao.hospital.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {solicitacao.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadeColor(solicitacao.prioridade)}`}>
                          {solicitacao.prioridade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(solicitacao.status)}`}>
                          {solicitacao.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {modalType === 'internacao' ? 'Solicitar Internação' : 'Cadastrar Funcionário'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalType === 'internacao' && (
              <form onSubmit={handleSubmitInternacao} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paciente
                    </label>
                    <select
                      value={formInternacao.pacienteId}
                      onChange={(e) => setFormInternacao({...formInternacao, pacienteId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um paciente</option>
                      {pacientes.map((paciente) => (
                        <option key={paciente.id} value={paciente.id}>
                          {paciente.nome} - {paciente.cpf}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital
                    </label>
                    <select
                      value={formInternacao.hospitalId}
                      onChange={(e) => setFormInternacao({...formInternacao, hospitalId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um hospital</option>
                      {hospitais.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Funcionário Responsável
                    </label>
                    <select
                      value={formInternacao.funcionarioId}
                      onChange={(e) => setFormInternacao({...formInternacao, funcionarioId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um funcionário</option>
                      {funcionarios.map((funcionario) => (
                        <option key={funcionario.id} value={funcionario.id}>
                          {funcionario.nome} - {funcionario.funcao}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Internação
                    </label>
                    <select
                      value={formInternacao.tipo}
                      onChange={(e) => setFormInternacao({...formInternacao, tipo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="urgencia">Urgência</option>
                      <option value="eletiva">Eletiva</option>
                      <option value="emergencia">Emergência</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={formInternacao.prioridade}
                      onChange={(e) => setFormInternacao({...formInternacao, prioridade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="medio">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo da Internação
                  </label>
                  <input
                    type="text"
                    value={formInternacao.motivo}
                    onChange={(e) => setFormInternacao({...formInternacao, motivo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalhes do Caso
                  </label>
                  <textarea
                    value={formInternacao.detalhes}
                    onChange={(e) => setFormInternacao({...formInternacao, detalhes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Laudo Médico
                  </label>
                  <textarea
                    value={formInternacao.laudoMedico}
                    onChange={(e) => setFormInternacao({...formInternacao, laudoMedico: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar Solicitação'}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'funcionario' && (
              <form onSubmit={handleSubmitFuncionario} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formFuncionario.nome}
                      onChange={(e) => setFormFuncionario({...formFuncionario, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Função
                    </label>
                    <select
                      value={formFuncionario.funcao}
                      onChange={(e) => setFormFuncionario({...formFuncionario, funcao: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione a função</option>
                      <option value="medico">Médico</option>
                      <option value="enfermeiro">Enfermeiro</option>
                      <option value="tecnico_enfermagem">Técnico em Enfermagem</option>
                      <option value="dentista">Dentista</option>
                      <option value="psicologo">Psicólogo</option>
                      <option value="assistente_social">Assistente Social</option>
                      <option value="farmaceutico">Farmacêutico</option>
                      <option value="recepcionista">Recepcionista</option>
                      <option value="agente_saude">Agente de Saúde</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CRM (se aplicável)
                    </label>
                    <input
                      type="text"
                      value={formFuncionario.crm}
                      onChange={(e) => setFormFuncionario({...formFuncionario, crm: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={formFuncionario.cpf}
                      onChange={(e) => setFormFuncionario({...formFuncionario, cpf: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formFuncionario.telefone}
                      onChange={(e) => setFormFuncionario({...formFuncionario, telefone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formFuncionario.email}
                      onChange={(e) => setFormFuncionario({...formFuncionario, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={formFuncionario.senha}
                    onChange={(e) => setFormFuncionario({...formFuncionario, senha: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Cadastrando...' : 'Cadastrar Funcionário'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UBSDashboard;