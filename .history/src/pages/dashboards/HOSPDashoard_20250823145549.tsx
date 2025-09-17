import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Megaphone, 
  Calendar, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart
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
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [newCampaignDate, setNewCampaignDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fetch campaigns
  const { data: campaigns, isLoading, isError } = useQuery('campaigns', async () => {
    const response = await api.get('/campaigns');
    return response.data;
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation(
    async (newCampaign: { title: string; description: string; date: string }) => {
      const response = await api.post('/campaigns', newCampaign);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('campaigns');
        toast.success('Campanha criada com sucesso!');
        setIsCampaignModalOpen(false);
        setNewCampaignTitle('');
        setNewCampaignDescription('');
        setNewCampaignDate('');
      },
      onError: () => {
        toast.error('Erro ao criar campanha. Tente novamente.');
      },
    }
  );

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle || !newCampaignDescription || !newCampaignDate) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    createCampaignMutation.mutate({
      title: newCampaignTitle,
      description: newCampaignDescription,
      date: newCampaignDate,
    });
  };

  // Filtered campaigns based on search term
  const filteredCampaigns = campaigns?.filter((campaign: any) =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

     return (
        <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div 
            animate={{ width: isSidebarOpen ? 250 : 80 }} 
            className="bg-blue-800 text-white flex flex-col"
        >
            <div className="flex items-center justify-between p-4 border-b border-blue-700">
            {isSidebarOpen && <h1 className="text-lg font-bold">Hospital Dashboard</h1>}
            <button onClick={toggleSidebar} className="focus:outline-none">
                <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-2">
                <li>
                <Link 
                    to="/hospital" 
                    className={`flex items-center p-2 rounded hover:bg-blue-700 ${location.pathname === '/hospital' ? 'bg-blue-700' : ''}`}
                >
                    <Building2 className="w-5 h-5 mr-3" />
                    {isSidebarOpen && <span>Visão Geral</span>}
                </Link>
                </li>
                <li>
                <Link 
                    to="/hospital/campaigns" 
                    className={`flex items-center p-2 rounded hover:bg-blue-700 ${location.pathname.startsWith('/hospital/campaigns') ? 'bg-blue-700' : ''}`}
                >
                    <Megaphone className="w-5 h-5 mr-3" />
                    {isSidebarOpen && <span>Campanhas</span>}
                </Link>
                </li>
                <li>
                <Link 
                    to="/hospital/patients" 
                    className={`flex items-center p-2 rounded hover:bg-blue-700 ${location.pathname.startsWith('/hospital/patients') ? 'bg-blue-700' : ''}`}
                >
                    <Users className="w-5 h-5 mr-3" />
                    {isSidebarOpen && <span>Pacientes</span>}   
                </Link>
                </li>
                <li>
                <Link 
                    to="/hospital/appointments" 
                    className={`flex items-center p-2 rounded hover:bg-blue-700 ${location.pathname.startsWith('/hospital/appointments') ? 'bg-blue-700' : ''}`}
                >
                    <Calendar className="w-5 h-5 mr-3" />
                    {isSidebarOpen && <span>Consultas</span>}
                </Link>
                </li>
                <li>
                <button 
                    onClick={logout} 
                    className="flex items-center p-2 rounded hover:bg-blue-700 w-full focus:outline-none"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    {isSidebarOpen && <span>Sair</span>}
                </button>
                </li>
            </ul>
            </nav>
            <div className="p-4 border-t border-blue-700">
            {isSidebarOpen && user && (
                <div>
                <p className="text-sm">Logado como:</p>
                <p className="font-bold">{user.name}</p>
                <p className="text-xs">{user.email}</p>
                </div>
            )}
                                                                                   