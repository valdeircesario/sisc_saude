import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Settings, Mail, Lock, Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface LoginForm {
  email: string;
  senha: string;
}

const LoginSistemaPage: React.FC = () => {
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
      const response = await api.post("/auth/login-sistema", data);
      const { token, user } = response.data;
      // permitir UPA também
      if (
        ![
          "admin",
          "ubs",
          "funcionario",
          "laboratorio",
          "hospital",
          "upa",
          "farmacia",
        ].includes(user.tipo)
      ) {
        toast.error(
          "Acesso negado. Este portal é exclusivo para profissionais de saúde.",
        );
        setLoading(false);
        return;
      }

      login(token, user);
      toast.success(`Bem-vindo, ${user.nome}!`);

      console.log(user);

      // Helper: tenta navegar via react-router e faz fallback para window.location
      const redirectTo = (path: string) => {
        try {
          navigate(path, { replace: true });
        } catch (e) {
          // ignore
        }
        setTimeout(() => {
          if (window.location.pathname !== path) {
            window.location.href = path;
          }
        }, 250);
      };

      // Redirecionar baseado no tipo de usuário
      switch (user.tipo) {
        case "admin":
          redirectTo("/admin");
          break;
        case "ubs":
          redirectTo("/ubs");
          break;
        case "upa":
          redirectTo("/upa");
          break;
        case "funcionario":
          redirectTo("/funcionario");
          break;
        case "laboratorio":
          redirectTo("/laboratorio");
          break;
        case "hospital":
          redirectTo("/hospital");
          break;
        case "farmacia":
          console.log("Redirecionando para /farmacia");
          redirectTo("/farmacia");
          break;
        default:
          redirectTo("/");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7f5] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo e título */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-5 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-[#0F6E56] rounded-xl flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-[#085041] tracking-tight">
              Sistema de Gestão
            </span>
          </Link>

          <h2 className="text-2xl font-semibold text-[#085041] mb-2">
            Acesso profissional
          </h2>
          <p className="text-sm text-[#0F6E56] leading-relaxed">
            Área exclusiva para administradores e profissionais de saúde — UBS,
            UPA, hospitais, laboratórios.
          </p>
        </div>

        {/* Card do formulário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#9FE1CB] p-7 space-y-5"
        >
          {/* Badge área restrita */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-[#E1F5EE] border border-[#9FE1CB] rounded-full px-4 py-1.5">
              <Shield className="h-4 w-4 text-[#0F6E56]" />
              <span className="text-xs font-medium text-[#085041]">
                Área restrita
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#085041] mb-1.5"
              >
                Email institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#5DCAA5]" />
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
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#9FE1CB] rounded-xl bg-[#f7fdfb] text-[#085041] text-sm placeholder:text-[#5DCAA5]/60 focus:ring-2 focus:ring-[#5DCAA5] focus:border-transparent transition-all"
                  placeholder="usuario@instituicao.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-[#085041] mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#5DCAA5]" />
                </div>
                <input
                  {...register("senha", { required: "Senha é obrigatória" })}
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 border border-[#9FE1CB] rounded-xl bg-[#f7fdfb] text-[#085041] text-sm placeholder:text-[#5DCAA5]/60 focus:ring-2 focus:ring-[#5DCAA5] focus:border-transparent transition-all"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#5DCAA5] hover:text-[#0F6E56] transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#5DCAA5] hover:text-[#0F6E56] transition-colors" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.senha.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <Link to="/recuperar-senha" className="text-xs font-semibold text-[#0F6E56] hover:text-[#085041]">
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0F6E56] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#085041] focus:outline-none focus:ring-2 focus:ring-[#5DCAA5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Acessar sistema
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Divisor segurança */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#9FE1CB]" />
          <span className="text-[11px] text-[#0F6E56] flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Conexão segura e criptografada
          </span>
          <div className="flex-1 h-px bg-[#9FE1CB]" />
        </div>

        {/* Voltar */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-[#0F6E56] hover:text-[#085041] transition-colors inline-flex items-center gap-1"
          >
            ← Voltar ao início
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSistemaPage;
