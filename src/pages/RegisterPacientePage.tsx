import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Heart, User, Mail, Phone, MapPin, Calendar, CreditCard, Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface RegisterForm {
  nome: string;
  cpf: string;
  cns: string;
  endereco: string;
  cep: string;
  nascimento: string;
  telefone: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

const RegisterPacientePage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const senha = watch('senha');

  const onSubmit = async (data: RegisterForm) => {
    if (data.senha !== data.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const { confirmarSenha, ...dataToSend } = data;
      const response = await api.post('/auth/register-paciente', dataToSend);
      const { token, user } = response.data;
      
      login(token, user);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/paciente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
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

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center space-x-3 text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors mb-6">
            <Heart className="h-10 w-10 text-red-500" />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            SISC- Saúde
            </span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Paciente
          </h1>
          <p className="text-gray-600">
            Crie sua conta e tenha acesso completo ao seu histórico de saúde
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    type="text"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && (
                    <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    {...register('cpf', { 
                      required: 'CPF é obrigatório',
                      pattern: {
                        value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                        message: 'CPF inválido'
                      }
                    })}
                    type="text"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="000.000.000-00"
                    onChange={(e) => {
                      e.target.value = formatCPF(e.target.value);
                    }}
                  />
                  {errors.cpf && (
                    <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNS (Cartão Nacional de Saúde) *
                  </label>
                  <input
                    {...register('cns', { 
                      required: 'CNS é obrigatório',
                      minLength: {
                        value: 15,
                        message: 'CNS deve ter 15 dígitos'
                      }
                    })}
                    type="text"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="123456789012345"
                    maxLength={15}
                  />
                  {errors.cns && (
                    <p className="mt-1 text-sm text-red-600">{errors.cns.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('nascimento', { required: 'Data de nascimento é obrigatória' })}
                      type="date"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  {errors.nascimento && (
                    <p className="mt-1 text-sm text-red-600">{errors.nascimento.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço Completo *
                  </label>
                  <input
                    {...register('endereco', { required: 'Endereço é obrigatório' })}
                    type="text"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Rua, número, bairro, cidade"
                  />
                  {errors.endereco && (
                    <p className="mt-1 text-sm text-red-600">{errors.endereco.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    {...register('cep', { 
                      required: 'CEP é obrigatório',
                      pattern: {
                        value: /^\d{5}-\d{3}$/,
                        message: 'CEP inválido'
                      }
                    })}
                    type="text"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="00000-000"
                    onChange={(e) => {
                      e.target.value = formatCEP(e.target.value);
                    }}
                  />
                  {errors.cep && (
                    <p className="mt-1 text-sm text-red-600">{errors.cep.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-600" />
                Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    {...register('telefone', { required: 'Telefone é obrigatório' })}
                    type="text"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="(11) 99999-9999"
                    onChange={(e) => {
                      e.target.value = formatPhone(e.target.value);
                    }}
                  />
                  {errors.telefone && (
                    <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email', { 
                        required: 'Email é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                      type="email"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="seu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Segurança
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      {...register('senha', { 
                        required: 'Senha é obrigatória',
                        minLength: {
                          value: 6,
                          message: 'Senha deve ter pelo menos 6 caracteres'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="block w-full px-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.senha && (
                    <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmarSenha', { 
                        required: 'Confirmação de senha é obrigatória',
                        validate: value => value === senha || 'As senhas não coincidem'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="block w-full px-3 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirme sua senha"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmarSenha && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link 
                to="/login-paciente" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Faça login aqui
              </Link>
            </p>
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPacientePage;