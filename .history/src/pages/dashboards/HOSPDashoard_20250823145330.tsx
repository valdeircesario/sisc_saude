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
        animate