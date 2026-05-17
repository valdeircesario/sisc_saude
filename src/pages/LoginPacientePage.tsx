import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface LoginForm {
  email: string;
  senha: string;
}

const LoginPacientePage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login-paciente", data);
      const { token, user } = response.data;
      login(token, user);
      toast.success(`Bem-vindo, ${user.nome}!`);
      navigate("/paciente");
    } catch (error: any) {
  console.log('🔴 ERRO COMPLETO:', error);
  console.log('🔴 error.response:', error?.response);
  console.log('🔴 error.response?.data:', error?.response?.data);
  console.log('🔴 error.response?.status:', error?.response?.status);

  const mensagem =
    error?.response?.data?.message ||
    error?.message ||
    'Email ou senha incorretos.';

  toast.error(typeof mensagem === 'string' ? mensagem : 'Email ou senha incorretos.');
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Fundo com arco superior */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-teal-900 via-teal-700 to-blue-800"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-68 h-24"
        style={{
          background: "#f8fafc",
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
        }}
      />

      {/* Padrão de pontos */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
          backgroundSize: "22px 22px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo + cabeçalho sobre o fundo colorido */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="mb-5 inline-flex flex-col items-center gap-3 group"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 border border-white/30 shadow-lg transition-transform duration-200 group-hover:scale-105">
              <Heart className="h-8 w-8 text-rose-200" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">
              SISC Saúde
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-sm">
            Área do Paciente
          </h2>
          <p className="text-sm font-medium text-teal-100">
            Acesse seu histórico médico e informações de saúde
          </p>
        </div>

        {/* Card do formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-slate-200/60"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-4 w-4 text-teal-500" />
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
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Senha
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4 w-4 text-teal-500" />
                </div>
                <input
                  {...register("senha", { required: "Senha é obrigatória" })}
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:outline-none"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-teal-600"
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
                <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                  <span>⚠</span> {errors.senha.message}
                </p>
              )}
            </div>

            {/* Botão submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs font-semibold text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Link cadastro */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              Não tem uma conta?{" "}
              <Link
                to="/cadastro-paciente"
                className="font-bold text-teal-600 transition-colors hover:text-teal-700 underline underline-offset-2"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-gray-500 transition-colors hover:text-gray-800"
          >
            ← Voltar ao início
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPacientePage;
