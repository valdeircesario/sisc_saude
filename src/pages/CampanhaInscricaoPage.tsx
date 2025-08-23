import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { Heart, User, Mail, Phone, MapPin, UserPlus, ArrowLeft, Calendar, MapPin as Location, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InscricaoForm {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  idade: string;
  condicoesSaude: string;
  observacoes: string;
}

type RiskLevel = 'critico' | 'grave' | 'medio' | 'leve';

interface RiskClassification {
  level: RiskLevel;
  priority: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  description: string;
}

const CampanhaInscricaoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [showRiskClassification, setShowRiskClassification] = useState(false);
  const [riskClassification, setRiskClassification] = useState<RiskClassification | null>(null);
  const [filtroRisco, setFiltroRisco] = useState<string | null>(null);
  
  const [inscricaoData, setInscricaoData] = useState<InscricaoForm>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    idade: '',
    condicoesSaude: '',
    observacoes: ''
  });

  // Query para obter dados da campanha
  const { data: campanha, isLoading: loadingCampanha } = useQuery(
    ['campanha', id],
    () => api.get(`/campanhas/${id}`).then(res => res.data),
    { enabled: !!id }
  );

  // Função para classificar o risco
  const classifyRisk = (idade: number, condicoesSaude: string): RiskClassification => {
    const condicoesAltoRisco = ['diabetes', 'hipertensao', 'imunossuprimido', 'multiplas'];
    const temCondicaoAltoRisco = condicoesAltoRisco.includes(condicoesSaude);

    // CRÍTICO: Idade > 80 anos OU condições de alto risco independente da idade
    if (idade > 80 || (temCondicaoAltoRisco && idade > 80)) {
      return {
        level: 'critico',
        priority: 1,
        color: 'text-red-800',
        bgColor: 'bg-red-100 border-red-300',
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
        description: 'Risco crítico - Prioridade máxima no atendimento'
      };
    }

    // GRAVE: 50-80 anos com condições de alto risco
    if (idade >= 50 && idade <= 80 && temCondicaoAltoRisco) {
      return {
        level: 'grave',
        priority: 2,
        color: 'text-orange-800',
        bgColor: 'bg-orange-100 border-orange-300',
        icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
        description: 'Risco grave - Alta prioridade no atendimento'
      };
    }

    // MÉDIO: 30-49 anos com condições de alto risco
    if (idade >= 30 && idade <= 49 && temCondicaoAltoRisco) {
      return {
        level: 'medio',
        priority: 3,
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100 border-yellow-300',
        icon: <Info className="h-5 w-5 text-yellow-600" />,
        description: 'Risco médio - Prioridade moderada no atendimento'
      };
    }

    // LEVE: Todos os demais casos
    return {
      level: 'leve',
      priority: 4,
      color: 'text-green-800',
      bgColor: 'bg-green-100 border-green-300',
      icon: <Info className="h-5 w-5 text-green-600" />,
      description: 'Risco leve - Atendimento conforme agenda regular'
    };
  };

  // Mutation para inscrição
  const inscricaoMutation = useMutation(
    (data: InscricaoForm & { classificacaoRisco: RiskClassification }) => 
      api.post(`/campanhas/${id}/inscrever`, data),
    {
      onSuccess: () => {
        toast.success('Inscrição realizada com sucesso! A UBS entrará em contato para agendamento.');
        setInscricaoData({
          nome: '',
          cpf: '',
          telefone: '',
          email: '',
          endereco: '',
          idade: '',
          condicoesSaude: '',
          observacoes: ''
        });
        setShowRiskClassification(false);
        setRiskClassification(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erro ao realizar inscrição');
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validar dados obrigatórios
    if (!inscricaoData.nome || !inscricaoData.cpf || !inscricaoData.telefone || 
        !inscricaoData.email || !inscricaoData.idade) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    // Classificar risco
    const idade = parseInt(inscricaoData.idade);
    if (isNaN(idade) || idade < 0 || idade > 120) {
      toast.error('Por favor, informe uma idade válida');
      setLoading(false);
      return;
    }

    const risk = classifyRisk(idade, inscricaoData.condicoesSaude);
    setRiskClassification(risk);
    setShowRiskClassification(true);
    setLoading(false);
  };

  const confirmInscricao = () => {
    if (riskClassification) {
      inscricaoMutation.mutate({
        ...inscricaoData,
        classificacaoRisco: riskClassification
      });
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'vacinacao':
        return '💉';
      case 'consulta':
        return '🩺';
      case 'exame':
        return '🔬';
      default:
        return '📋';
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

  if (loadingCampanha) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Carregando campanha...</p>
        </div>
      </div>
    );
  }

  if (!campanha) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campanha não encontrada</h1>
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao início</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
    {/* Header */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8 lg:mb-12"
    >
      <Link to="/" className="inline-flex items-center justify-center space-x-3 text-2xl sm:text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors mb-6 lg:mb-8">
        <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
        <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          SUS Digital
        </span>
      </Link>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">
          Inscrição na Campanha
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Preencha seus dados para se inscrever na campanha
        </p>
      </div>
    </motion.div>

    {/* Modal de Classificação de Risco */}
    {showRiskClassification && riskClassification && (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full mx-4 p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
              Classificação de Risco
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Com base nos dados informados, foi realizada a classificação de risco
            </p>
          </div>

          <div className={`p-4 sm:p-6 rounded-xl border-2 ${riskClassification.bgColor} mb-6`}>
            <div className="flex items-center justify-center mb-4">
              {riskClassification.icon}
              <span className={`ml-3 font-bold text-lg sm:text-xl uppercase ${riskClassification.color}`}>
                {riskClassification.level}
              </span>
            </div>
            <p className={`text-center text-sm sm:text-base leading-relaxed ${riskClassification.color}`}>
              {riskClassification.description}
            </p>
          </div>

          <div className="space-y-3 mb-6 text-sm sm:text-base">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">Idade:</span>
              <span className="text-gray-900 font-semibold">{inscricaoData.idade} anos</span>
            </div>
            <div className="flex justify-between items-start py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">Condição:</span>
              <span className="text-gray-900 text-right max-w-[60%]">
                {inscricaoData.condicoesSaude || 'Nenhuma informada'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-700">Prioridade:</span>
              <span className="text-gray-900 font-semibold">{riskClassification.priority}ª</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            
            <button
              onClick={confirmInscricao}
              disabled={inscricaoMutation.isLoading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
            >
              {inscricaoMutation.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mx-auto" />
              ) : (
                'Confirmar Inscrição'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    )}

    {/* Main Content Grid */}
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
        {/* Informações da Campanha */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 lg:p-8">
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getTipoColor(campanha.tipo)} w-fit`}>
                  <span className="mr-2">{getTipoIcon(campanha.tipo)}</span>
                  {campanha.tipo.charAt(0).toUpperCase() + campanha.tipo.slice(1)}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {format(new Date(campanha.dataIni), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6 leading-tight">
                {campanha.titulo}
              </h2>
              
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                {campanha.descricao}
              </p>
            </div>

            {/* Informações da UBS */}
            <div className="border-t border-gray-200 pt-6 lg:pt-8 mb-6 lg:mb-8">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                <Location className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-blue-600" />
                Local de Atendimento
              </h3>
              
              <div className="space-y-3 lg:space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 lg:p-5">
                  <p className="font-semibold text-gray-900 text-base lg:text-lg mb-2">{campanha.ubs.nome}</p>
                  <p className="text-gray-600 mb-2 leading-relaxed">{campanha.ubs.endereco}</p>
                  <p className="text-gray-600 font-medium">{campanha.ubs.telefone}</p>
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="border-t border-gray-200 pt-6 lg:pt-8">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 flex items-center">
                <Calendar className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-green-600" />
                Período da Campanha
              </h3>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 lg:p-5">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="font-medium text-gray-700">Início:</span>
                    <span className="text-gray-900 font-semibold">
                      {format(new Date(campanha.dataIni), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  {campanha.dataFim && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-medium text-gray-700">Fim:</span>
                      <span className="text-gray-900 font-semibold">
                        {format(new Date(campanha.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formulário de Inscrição */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 lg:p-8">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8 flex items-center">
              <UserPlus className="h-6 w-6 lg:h-7 lg:w-7 mr-3 text-green-600" />
              Dados para Inscrição
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nome Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={inscricaoData.nome}
                    onChange={(e) => setInscricaoData({ ...inscricaoData, nome: e.target.value })}
                    className="block w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  CPF *
                </label>
                <input
                  type="text"
                  value={inscricaoData.cpf}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value);
                    setInscricaoData({ ...inscricaoData, cpf: formatted });
                  }}
                  className="block w-full px-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Telefone *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={inscricaoData.telefone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setInscricaoData({ ...inscricaoData, telefone: formatted });
                    }}
                    className="block w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={inscricaoData.email}
                    onChange={(e) => setInscricaoData({ ...inscricaoData, email: e.target.value })}
                    className="block w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Endereço
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={inscricaoData.endereco}
                    onChange={(e) => setInscricaoData({ ...inscricaoData, endereco: e.target.value })}
                    className="block w-full pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </div>

              {/* Idade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Idade * 
                  <span className="text-xs text-yellow-600 font-normal ml-2">
                    (importante para classificação de risco)
                  </span>
                </label>
                <input
                  type="number"
                  value={inscricaoData.idade}
                  onChange={(e) => setInscricaoData({ ...inscricaoData, idade: e.target.value })}
                  className="block w-full px-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                  placeholder="Sua idade"
                  min="0"
                  max="120"
                  required
                />
              </div>

              {/* Condições de Saúde */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Condições de Saúde 
                  <span className="text-xs text-yellow-600 font-normal ml-2">
                    (importante para classificação de risco)
                  </span>
                </label>
                <select
                  value={inscricaoData.condicoesSaude}
                  onChange={(e) => setInscricaoData({ ...inscricaoData, condicoesSaude: e.target.value })}
                  className="block w-full px-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base bg-white"
                >
                  <option value="">Selecione (se aplicável)</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="hipertensao">Hipertensão</option>
                  <option value="cardiopatia">Cardiopatia</option>
                  <option value="asma">Asma</option>
                  <option value="obesidade">Obesidade</option>
                  <option value="cancer">Câncer</option>
                  <option value="imunossuprimido">Imunossuprimido</option>
                  <option value="gestante">Gestante</option>
                  <option value="multiplas">Múltiplas condições</option>
                  <option value="outras">Outras</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Observações
                </label>
                <textarea
                  value={inscricaoData.observacoes}
                  onChange={(e) => setInscricaoData({ ...inscricaoData, observacoes: e.target.value })}
                  className="block w-full px-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base resize-none"
                  rows={4}
                  placeholder="Informações adicionais (opcional)"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-4 lg:py-5 border border-transparent text-base lg:text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 mr-3" />
                      Classificar Risco e Continuar
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Info Footer */}
            <div className="mt-6 lg:mt-8 p-4 lg:p-5 bg-blue-50 rounded-xl">
              <p className="text-sm lg:text-base text-gray-700 text-center leading-relaxed">
                Após a inscrição, será realizada a classificação de risco e a UBS entrará em contato para agendamento conforme a prioridade
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Back Link */}
    <div className="text-center mt-8 lg:mt-12">
      <Link 
        to="/" 
        className="inline-flex items-center space-x-2 text-sm lg:text-base text-blue-600 hover:text-blue-700 transition-colors font-medium"
      >
        <span>← Voltar para campanhas</span>
      </Link>
    </div>
  </div>
</div>


    
  );
};

export default CampanhaInscricaoPage;