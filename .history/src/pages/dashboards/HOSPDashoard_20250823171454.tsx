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
            </div>
        </motion.div>
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
            <Route path="/hospital" element={
                <div>
                <h2 className="text-2xl font-bold mb-4">Visão Geral do Hospital</h2>
                <p>Bem-vindo ao painel do hospital. Use a barra lateral para navegar.</p>
                </div>
            } />
            <Route path="/hospital/campaigns" element={
                <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Campanhas</h2>
                    <button 
                    onClick={() => setIsCampaignModalOpen(true)} 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                    >
                    <Plus className="w-4 h-4 mr-2" /> {isSidebarOpen && 'Nova Campanha'}
                    </button>
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar campanhas..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                {isLoading ? (
                    <p>Carregando campanhas...</p>
                ) : isError ? (
                    <p>Erro ao carregar campanhas.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCampaigns.length === 0 ? (
                        <p>Nenhuma campanha encontrada.</p>
                    ) : (
                        filteredCampaigns.map((campaign: any) => (
                        <div key={campaign.id} className="border border-gray-300 rounded p-4 shadow">
                            <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{format(new Date(campaign.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                            <p className="mb-4">{campaign.description}</p>
                            <div className="flex space-x-2">
                            <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                                <Edit className="w-4 h-4 mr-1" /> Editar
                            </button>
                            <button className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                                <Trash2 className="w-4 h-4 mr-1" /> Excluir
                            </button>
                            </div>
                        </div>
                        ))
                    )}
                    </div>
                )}
                {/* Create Campaign Modal */}
                {isCampaignModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Nova Campanha</h3>
                        <form onSubmit={handleCreateCampaign} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-bold">Título</label>
                            <input 
                            type="text" 
                            value={newCampaignTitle}
                            onChange={(e) => setNewCampaignTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-bold">Descrição</label>
                            <textarea 
                            value={newCampaignDescription}
                            onChange={(e) => setNewCampaignDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-bold">Data</label>
                            <input 
                            type="date" 
                            value={newCampaignDate}
                            onChange={(e) => setNewCampaignDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button 
                            type="button" 
                            onClick={() => setIsCampaignModalOpen(false)} 
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                            Cancelar
                            </button>
                            <button 
                            type="submit" 
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                            Criar
                            </button>
                        </div>
                        </form>
                    </div>
                    </div>
                )}
                </div>
            } />
            <Route path="/hospital/patients" element={
                <div>
                <h2 className="text-2xl font-bold mb-4">Gerenciamento de Pacientes</h2>
                <p>Aqui você pode gerenciar os pacientes do hospital.</p>
                </div>
            } />
            <Route path="/hospital/appointments" element={
                <div>
                <h2 className="text-2xl font-bold mb-4">Gerenciamento de Consultas</h2>
                <p>Aqui você pode gerenciar as consultas do hospital.</p>
                </div>
            } />
            </Routes>
        </div>
        </div>
        );
}
export default HOSPDashboard;                                                                       