import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Calendar, FileText, Stethoscope, Settings } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

interface Campanha {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  dataIni: string;
  dataFim?: string;
  ubs: {
    nome: string;
    endereco: string;
    telefone: string;
  };
}

const HomePage: React.FC = () => {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampanhas = async () => {
      try {
        const response = await api.get('/campanhas/ativas');
        setCampanhas(response.data);
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampanhas();
  }, []);

  const features = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Histórico Médico",
      description: "Acesse todo seu histórico médico em um só lugar",
      color: "bg-red-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Cartão de Vacinas",
      description: "Consulte suas vacinas e próximas doses",
      color: "bg-green-500"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Exames",
      description: "Visualize resultados e baixe laudos",
      color: "bg-blue-500"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Agendamentos",
      description: "Solicite consultas e acompanhe agendamentos",
      color: "bg-purple-500"
    }
  ];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'vacinacao':
        return <Shield className="h-5 w-5" />;
      case 'consulta':
        return <Stethoscope className="h-5 w-5" />;
      case 'exame':
        return <FileText className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'vacinacao':
        return 'bg-green-100 text-green-800';
      case 'consulta':
        return 'bg-blue-100 text-blue-800';
      case 'exame':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Sistema Integrado de
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Saúde do Cidadão
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Conectando pacientes, unidades de saúde e laboratórios em uma única plataforma. 
              Seu histórico médico sempre ao seu alcance.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/cadastro-paciente"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                Cadastre-se Gratuitamente
              </Link>
              
              <Link
                to="/login-sistema"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Settings className="h-5 w-5 mr-2" />
                Acesso Profissionais
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua saúde de forma digital e integrada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`${feature.color} text-white p-3 rounded-xl inline-block mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campanhas Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Campanhas e Notícias
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fique por dentro das campanhas de saúde e informações importantes
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando campanhas...</p>
            </div>
          ) : campanhas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campanhas.map((campanha, index) => (
                <motion.div
                  key={campanha.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(campanha.tipo)}`}>
                      {getTipoIcon(campanha.tipo)}
                      <span className="ml-1 capitalize">{campanha.tipo}</span>
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(campanha.dataIni).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {campanha.titulo}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {campanha.descricao}
                  </p>
                  
                  <div className="mt-4">
                    <Link
                      to={`/campanha/${campanha.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Inscrever-se na Campanha
                    </Link>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">{campanha.ubs.nome}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {campanha.ubs.endereco}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhuma campanha ativa no momento</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Cadastre-se agora e tenha acesso completo ao seu histórico de saúde
          </p>
          <Link
            to="/cadastro-paciente"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">SISC - Saúde</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link to="/login-sistema" className="text-gray-300 hover:text-white transition-colors">
                Acesso Profissionais
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300">
                © 2026 Sistema Integrado de Saúde do Cidadão
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;