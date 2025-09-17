import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Building2, 
  FlaskConical, 
  Users, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('ubs');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    cnpj: '',
    email: '',
    senha: ''
  });

  // Queries
  const { data: ubsList, isLoading: loadingUBS } = useQuery(
    'admin-ubs',
    () => api.get('/admin/ubs').then(res => res.data),
    { enabled: activeTab === 'ubs' }
  );

  const { data: hospList, isLoading: loadingHOSP } = useQuery(
    'admin-hospitais',
    () => api.get('/admin/hospitais').then(res => res.data),
    { enabled: activeTab === 'hospitais' }
  );

  const { data: laboratorios, isLoading: loadingLabs } = useQuery(
    'admin-laboratorios',
    () => api.get('/admin/laboratorios').then(res => res.data),
    { enabled: activeTab === 'laboratorios' }
  );

  // Mutations
  const createUBSMutation = useMutation(
    (data: any) => api.post('/admin/ubs', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-ubs');
        toast.success('UBS cadastrada com sucesso!');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao cadastrar UBS');
      }
    }
  );

    // Mutations
  const createHOSPMutation = useMutation(
    (data: any) => api.post('/admin/ubs', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-ubs');
        toast.success('UBS cadastrada com sucesso!');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao cadastrar UBS');
      }
    }
  );

  const updateUBSMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/admin/ubs/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-ubs');
        toast.success('UBS atualizada com sucesso!');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar UBS');
      }
    }
  );

  const deleteUBSMutation = useMutation(
    (id: string) => api.delete(`/admin/ubs/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-ubs');
        toast.success('UBS deletada com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao deletar UBS');
      }
    }
  );

  const createLabMutation = useMutation(
    (data: any) => api.post('/admin/laboratorios', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-laboratorios');
        toast.success('Laboratório cadastrado com sucesso!');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao cadastrar laboratório');
      }
    }
  );

  const updateLabMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => api.put(`/admin/laboratorios/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-laboratorios');
        toast.success('Laboratório atualizado com sucesso!');
        setShowModal(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao atualizar laboratório');
      }
    }
  );

  const deleteLabMutation = useMutation(
    (id: string) => api.delete(`/admin/laboratorios/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-laboratorios');
        toast.success('Laboratório deletado com sucesso!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao deletar laboratório');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      nome: '',
      endereco: '',
      telefone: '',
      cnpj: '',
      email: '',
      senha: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'ubs') {
      if (editingItem) {
        updateUBSMutation.mutate({ id: editingItem.id, data: formData });
      } else {
        createUBSMutation.mutate(formData);
      }
    } else {
      if (editingItem) {
        updateLabMutation.mutate({ id: editingItem.id, data: formData });
      } else {
        createLabMutation.mutate(formData);
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      endereco: item.endereco,
      telefone: item.telefone,
      cnpj: item.cnpj,
      email: item.email,
      senha: ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este item?')) {
      if (activeTab === 'ubs') {
        deleteUBSMutation.mutate(id);
      } else {
        deleteLabMutation.mutate(id);
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
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
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('ubs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ubs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="h-5 w-5 inline mr-2" />
                Unidades de Saúde
              </button>
              <button
                onClick={() => setActiveTab('laboratorios')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'laboratorios'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FlaskConical className="h-5 w-5 inline mr-2" />
                Laboratórios
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'ubs' ? 'Unidades de Saúde' : 'Laboratórios'}
            </h2>
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar {activeTab === 'ubs' ? 'UBS' : 'Laboratório'}</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'ubs' && ubsList?.map((ubs: any) => (
                  <tr key={ubs.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ubs.nome}</div>
                      <div className="text-sm text-gray-500">{ubs.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ubs.endereco}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ubs.telefone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ubs.cnpj}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(ubs)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ubs.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'laboratorios' && laboratorios?.map((lab: any) => (
                  <tr key={lab.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lab.nome}</div>
                      <div className="text-sm text-gray-500">{lab.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lab.endereco}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lab.telefone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lab.cnpj}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(lab)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lab.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {((activeTab === 'ubs' && loadingUBS) || (activeTab === 'laboratorios' && loadingLabs)) && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? 'Editar' : 'Adicionar'} {activeTab === 'ubs' ? 'UBS' : 'Laboratório'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {editingItem && '(deixe em branco para manter a atual)'}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingItem}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingItem ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;