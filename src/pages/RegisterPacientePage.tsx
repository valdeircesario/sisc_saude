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
          <Link
            to="/"
            className="inline-flex items-center space-x-3 text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors mb-6"
          >
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* ── DADOS PESSOAIS ─────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-teal-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
                  <User className="h-4 w-4 text-teal-600" />
                </span>
                Dados Pessoais
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register("nome", { required: "Nome é obrigatório" })}
                    type="text"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.nome.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    CPF <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register("cpf", {
                      required: "CPF é obrigatório",
                      pattern: {
                        value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                        message: "CPF inválido",
                      },
                    })}
                    type="text"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                    placeholder="000.000.000-00"
                    onChange={(e) => {
                      e.target.value = formatCPF(e.target.value);
                    }}
                  />
                  {errors.cpf && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.cpf.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    CNS — Cartão Nacional de Saúde{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register("cns", {
                      required: "CNS é obrigatório",
                      minLength: {
                        value: 15,
                        message: "CNS deve ter 15 dígitos",
                      },
                    })}
                    type="text"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                    placeholder="123456789012345"
                    maxLength={15}
                  />
                  {errors.cns && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.cns.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Data de Nascimento <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      {...register("nascimento", {
                        required: "Data de nascimento é obrigatória",
                      })}
                      type="date"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                    />
                  </div>
                  {errors.nascimento && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.nascimento.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── ENDEREÇO ───────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-teal-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
                  <MapPin className="h-4 w-4 text-teal-600" />
                </span>
                Endereço
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Endereço Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register("endereco", {
                      required: "Endereço é obrigatório",
                    })}
                    type="text"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                    placeholder="Rua, número, bairro, cidade"
                  />
                  {errors.endereco && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.endereco.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    CEP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register("cep", {
                      required: "CEP é obrigatório",
                      pattern: {
                        value: /^\d{5}-\d{3}$/,
                        message: "CEP inválido",
                      },
                    })}
                    type="text"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                    placeholder="00000-000"
                    onChange={(e) => {
                      e.target.value = formatCEP(e.target.value);
                    }}
                  />
                  {errors.cep && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.cep.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── CONTATO ────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-teal-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
                  <Phone className="h-4 w-4 text-teal-600" />
                </span>
                Contato
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Telefone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register("telefone", {
                      required: "Telefone é obrigatório",
                    })}
                    type="text"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                    placeholder="(11) 99999-9999"
                    onChange={(e) => {
                      e.target.value = formatPhone(e.target.value);
                    }}
                  />
                  {errors.telefone && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.telefone.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      {...register("email", {
                        required: "Email é obrigatório",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido",
                        },
                      })}
                      type="email"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                      placeholder="seu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── SEGURANÇA ──────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-teal-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
                  <CreditCard className="h-4 w-4 text-teal-600" />
                </span>
                Segurança
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Senha <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("senha", {
                        required: "Senha é obrigatória",
                        minLength: {
                          value: 6,
                          message: "Senha deve ter pelo menos 6 caracteres",
                        },
                      })}
                      type={showPassword ? "text" : "password"}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.senha && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.senha.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Confirmar Senha <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmarSenha", {
                        required: "Confirmação de senha é obrigatória",
                        validate: (value) =>
                          value === senha || "As senhas não coincidem",
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                      placeholder="Confirme sua senha"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmarSenha && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <span>⚠</span> {errors.confirmarSenha.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── BOTÃO SUBMIT ───────────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-teal-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
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