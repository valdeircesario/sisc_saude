import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Heart, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../services/api";

interface RequestForm {
  email: string;
  tipoUsuario: string;
}

interface ResetForm {
  novaSenha: string;
  confirmarSenha: string;
}

const tiposUsuario = [
  { value: "paciente", label: "Paciente" },
  { value: "funcionario", label: "Funcionário" },
  { value: "admin", label: "Administrador" },
  { value: "ubs", label: "UBS" },
  { value: "hospital", label: "Hospital" },
  { value: "upa", label: "UPA" },
  { value: "farmacia", label: "Farmácia" },
  { value: "laboratorio", label: "Laboratório" },
];

const senhaValida = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [completed, setCompleted] = useState(false);
  const isReset = Boolean(resetToken);

  const requestForm = useForm<RequestForm>({
    defaultValues: { tipoUsuario: "paciente" },
  });
  const resetForm = useForm<ResetForm>();
  const novaSenha = resetForm.watch("novaSenha");
  const senhaRequirements = useMemo(() => ({
    length: (novaSenha || "").length >= 8,
    lower: /[a-z]/.test(novaSenha || ""),
    upper: /[A-Z]/.test(novaSenha || ""),
    number: /\d/.test(novaSenha || ""),
  }), [novaSenha]);

  const onRequest = async (data: RequestForm) => {
    setLoading(true);
    try {
      await api.post("/auth/solicitar-reset-senha", data);
      setSent(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Não foi possível solicitar a recuperação.");
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (data: ResetForm) => {
    if (!resetToken) return;
    setLoading(true);
    try {
      await api.post("/auth/redefinir-senha", {
        token: resetToken,
        novaSenha: data.novaSenha,
      });
      setCompleted(true);
      toast.success("Senha redefinida com sucesso.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Token inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-teal-950 via-teal-800 to-cyan-700" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-5 inline-flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-lg">
              <Heart className="h-7 w-7 text-rose-200" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">SISC Saúde</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{isReset ? "Criar nova senha" : "Recuperar senha"}</h1>
          <p className="mt-2 text-sm font-medium text-teal-100">
            {isReset ? "Defina uma nova senha para voltar a acessar sua conta." : "Informe seus dados e enviaremos as instruções de acesso."}
          </p>
        </div>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
          {sent ? (
            <div className="py-5 text-center">
              <CheckCircle className="mx-auto h-14 w-14 text-teal-600" />
              <h2 className="mt-4 text-lg font-bold text-slate-800">Verifique seu email</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">Se os dados forem válidos, você receberá um link para redefinir sua senha. O link expira em 1 hora.</p>
              <Link to="/login-paciente" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900"><ArrowLeft className="h-4 w-4" />Voltar ao login</Link>
            </div>
          ) : completed ? (
            <div className="py-5 text-center">
              <CheckCircle className="mx-auto h-14 w-14 text-teal-600" />
              <h2 className="mt-4 text-lg font-bold text-slate-800">Senha alterada</h2>
              <p className="mt-2 text-sm text-slate-500">Sua senha foi redefinida. Agora você já pode entrar novamente.</p>
              <Link to="/login-paciente" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"><ArrowLeft className="h-4 w-4" />Ir para o login</Link>
            </div>
          ) : isReset ? (
            <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-5">
              <div>
                <label htmlFor="novaSenha" className="mb-1.5 block text-sm font-bold text-slate-700">Nova senha</label>
                <div className="relative"><Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-teal-600" /><input id="novaSenha" type="password" {...resetForm.register("novaSenha", { required: "Nova senha é obrigatória", pattern: { value: senhaValida, message: "Use pelo menos 8 caracteres, com maiúscula, minúscula e número" } })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="Digite a nova senha" /></div>
                {resetForm.formState.errors.novaSenha && <p className="mt-1 text-xs text-rose-500">{resetForm.formState.errors.novaSenha.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span className={senhaRequirements.length ? "text-teal-700" : ""}>• 8 caracteres</span><span className={senhaRequirements.upper ? "text-teal-700" : ""}>• Letra maiúscula</span><span className={senhaRequirements.lower ? "text-teal-700" : ""}>• Letra minúscula</span><span className={senhaRequirements.number ? "text-teal-700" : ""}>• Número</span>
              </div>
              <div>
                <label htmlFor="confirmarSenha" className="mb-1.5 block text-sm font-bold text-slate-700">Confirmar nova senha</label>
                <div className="relative"><KeyRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-teal-600" /><input id="confirmarSenha" type="password" {...resetForm.register("confirmarSenha", { required: "Confirmação é obrigatória", validate: (value) => value === novaSenha || "As senhas não coincidem" })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="Repita a nova senha" /></div>
                {resetForm.formState.errors.confirmarSenha && <p className="mt-1 text-xs text-rose-500">{resetForm.formState.errors.confirmarSenha.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"><ShieldCheck className="h-4 w-4" />{loading ? "Salvando..." : "Redefinir senha"}</button>
            </form>
          ) : (
            <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-5">
              <div><label htmlFor="tipoUsuario" className="mb-1.5 block text-sm font-bold text-slate-700">Tipo de acesso</label><select id="tipoUsuario" {...requestForm.register("tipoUsuario", { required: true })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">{tiposUsuario.map((tipo) => <option key={tipo.value} value={tipo.value}>{tipo.label}</option>)}</select></div>
              <div><label htmlFor="email" className="mb-1.5 block text-sm font-bold text-slate-700">Email cadastrado</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-teal-600" /><input id="email" type="email" {...requestForm.register("email", { required: "Email é obrigatório", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" } })} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="seu@email.com" />{requestForm.formState.errors.email && <p className="mt-1 text-xs text-rose-500">{requestForm.formState.errors.email.message}</p>}</div></div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"><Mail className="h-4 w-4" />{loading ? "Enviando..." : "Enviar instruções"}</button>
            </form>
          )}
        </motion.section>
        {!sent && !completed && <Link to="/login-paciente" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"><ArrowLeft className="h-4 w-4" />Voltar ao login</Link>}
      </motion.div>
    </main>
  );
};

export default ResetPasswordPage;
