import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Settings,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { api } from "../services/api";

// ── Tipos (idênticos ao original) ────────────────────────────
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

interface Medicamento {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  ubsId?: string;
  ubsNome?: string | null;
  vencido?: boolean;
}

// ── Helpers de tipo (lógica 100% original) ───────────────────
const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case "vacinacao":
      return <Shield className="h-4 w-4" />;
    case "consulta":
      return <Stethoscope className="h-4 w-4" />;
    case "exame":
      return <FileText className="h-4 w-4" />;
    default:
      return <Heart className="h-4 w-4" />;
  }
};

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case "vacinacao":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "consulta":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "exame":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    default:
      return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
  }
};

// ── Accent bar por tipo (apenas visual, sem lógica nova) ──────
const getTipoAccent = (tipo: string) => {
  switch (tipo) {
    case "vacinacao":
      return "from-emerald-400 to-teal-500";
    case "consulta":
      return "from-sky-400 to-blue-500";
    case "exame":
      return "from-violet-400 to-purple-500";
    default:
      return "from-slate-300 to-slate-400";
  }
};

// ── Componente principal ─────────────────────────────────────
const HomePage: React.FC = () => {
  // ── Estado (idêntico ao original) ────────────────────────
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMedicamentosModal, setShowMedicamentosModal] = useState(false);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [medLoading, setMedLoading] = useState(false);
  const [medError, setMedError] = useState<string | null>(null);
  const [medSearch, setMedSearch] = useState("");

  // ── Efeito (idêntico ao original) ────────────────────────
  useEffect(() => {
    const fetchCampanhas = async () => {
      try {
        const response = await api.get("/campanhas/ativas");
        setCampanhas(response.data);
      } catch (error) {
        console.error("Erro ao carregar campanhas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampanhas();
  }, []);

  useEffect(() => {
    if (!showMedicamentosModal || medicamentos.length > 0 || medLoading) {
      return;
    }

    const fetchMedicamentos = async () => {
      setMedLoading(true);
      setMedError(null);

      try {
        const response = await api.get("/medicamentos");
        setMedicamentos(response.data);
      } catch (error) {
        console.error("Erro ao carregar medicamentos:", error);
        setMedError(
          "Não foi possível carregar os medicamentos. Tente novamente mais tarde.",
        );
      } finally {
        setMedLoading(false);
      }
    };

    fetchMedicamentos();
  }, [showMedicamentosModal, medicamentos.length, medLoading]);

  // ── Features (idêntico ao original) ──────────────────────
  const features = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Histórico Médico",
      description: "Acesse todo seu histórico médico em um só lugar",
      color: "bg-rose-500",
      bg: "bg-rose-50",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Cartão de Vacinas",
      description: "Consulte suas vacinas e próximas doses",
      color: "bg-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Exames",
      description: "Visualize resultados e baixe laudos",
      color: "bg-sky-500",
      bg: "bg-sky-50",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Agendamentos",
      description: "Solicite consultas e acompanhe agendamentos",
      color: "bg-violet-500",
      bg: "bg-violet-50",
    },
  ];

  const filteredMedicamentos = medicamentos.filter((med) =>
    med.nome.toLowerCase().includes(medSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-600 to-blue-700 pt-20 pb-28 px-4">
        {/* Padrão de fundo sutil */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v5h5v5H0v5h20v-9.5zm-2 4.5h-1v-1h1v1zm-3 0h-1v-1h1v1zm-2-3h1v1h-1v-1zm3 0h1v1h-1v-1zm-1-6h1v3h-1v-3zM0 .5h18.5V0H0v.5zm0 2h16.5V2H0v.5zM0 5h16.5V4.5H0V5z' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Tag de contexto */}
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Heart className="h-3.5 w-3.5 text-rose-300" />
            Plataforma Pública de Saúde
          </span>

          {/* Título — animação original mantida */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
          >
            Sistema Integrado de
            <span className="mt-1 block text-teal-200">Saúde do Cidadão</span>
          </motion.h1>

          {/* Subtítulo — animação original mantida */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-9 max-w-2xl text-lg leading-relaxed text-white/80"
          >
            Conectando pacientes, unidades de saúde e laboratórios em uma única
            plataforma. Seu histórico médico sempre ao seu alcance.
          </motion.p>

          {/* CTAs — animação original mantida */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Link
              to="/cadastro-paciente"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-teal-800 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50 hover:shadow-xl"
            >
              Cadastre-se Gratuitamente
            </Link>

            <Link
              to="/login-sistema"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
              Acesso Profissionais
            </Link>
            <button
              onClick={() => setShowMedicamentosModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-8 py-3.5 text-sm font-semibold text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200"
            >
              Consultar Medicamentos
            </button>
          </motion.div>

          {/* Stats visuais (novo elemento, sem lógica) */}
          <div className="mt-14 flex flex-wrap justify-center gap-10 border-t border-white/20 pt-10">
            {[
              ["120+", "Unidades de Saúde"],
              ["40 mil+", "Pacientes Cadastrados"],
              ["98%", "Satisfação"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-2xl font-bold text-white">{val}</div>
                <div className="mt-0.5 text-xs text-white/55">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPANHAS — primeira dobra após o hero ───────── */}
      {/* Mudança estrutural: seção subiu, agora é a 1ª após o hero */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
              Ativo agora
            </span>
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Campanhas e Notícias
            </h2>
            <p className="mx-auto max-w-md text-gray-500">
              Fique por dentro das campanhas de saúde e informações importantes
            </p>
          </div>

          {/* ── Loading (lógica original intacta) ── */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-600" />
              <p className="mt-4 text-sm text-gray-400">
                Carregando campanhas...
              </p>
            </div>
          ) : /* ── Grid de campanhas (lógica original intacta) ── */
          campanhas.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {campanhas.map((campanha, index) => (
                <motion.div
                  key={campanha.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
                >
                  {/* Accent bar colorida por tipo */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${getTipoAccent(campanha.tipo)}`}
                  />

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {/* Badge + data */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getTipoColor(campanha.tipo)}`}
                      >
                        {getTipoIcon(campanha.tipo)}
                        <span className="capitalize">{campanha.tipo}</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(campanha.dataIni).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-base font-semibold leading-snug text-gray-900">
                      {campanha.titulo}
                    </h3>

                    {/* Descrição */}
                    <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
                      {campanha.descricao}
                    </p>

                    {/* Botão de inscrição */}
                    <div>
                      <Link
                        to={`/campanha/${campanha.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-teal-700"
                      >
                        Inscrever-se na Campanha
                      </Link>
                    </div>
                  </div>

                  {/* Rodapé do card — UBS info */}
                  <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3.5">
                    <Users className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        {campanha.ubs.nome}
                      </p>
                      <p className="text-xs text-gray-400">
                        {campanha.ubs.endereco}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* ── Empty state (lógica original intacta) ── */
            <div className="py-20 text-center">
              <Users className="mx-auto mb-4 h-14 w-14 text-gray-200" />
              <p className="text-gray-400">Nenhuma campanha ativa no momento</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Consulta de Medicamentos — usuário público ───────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
                Consulta de Medicamentos
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Verifique os medicamentos disponíveis nas UBS
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Qualquer usuário pode consultar os medicamentos disponíveis,
                filtrar pelo nome e ver o status de estoque.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMedicamentosModal(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Abrir Consulta de Medicamentos
            </button>
          </div>
        </div>
      </section>

      {showMedicamentosModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 md:items-center">
          <div
            className="w-full max-w-5xl flex flex-col rounded-2xl bg-white shadow-xl border border-slate-200/60"
            style={{ maxHeight: "90vh" }}
          >
            {/* Header — fixo no topo */}
            <div className="flex-shrink-0 flex flex-wrap gap-3 items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 rounded-t-2xl">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Consulta de medicamentos
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Pesquise por nome e veja em qual UBS o medicamento está
                  disponível.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMedicamentosModal(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Barra de busca — fixa abaixo do header */}
            <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
              <div className="relative w-full sm:max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  ⌕
                </span>
                <label htmlFor="med-search" className="sr-only">
                  Buscar por nome do medicamento
                </label>
                <input
                  id="med-search"
                  type="search"
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  placeholder="Buscar por medicamento..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <span className="text-sm text-slate-500">
                {medLoading
                  ? "Carregando..."
                  : `${filteredMedicamentos.length} resultados`}
              </span>
            </div>

            {/* Erro */}
            {medError && (
              <div className="flex-shrink-0 mx-6 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {medError}
              </div>
            )}

            {/* Tabela com scroll */}
            <div className="overflow-y-auto overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Medicamento
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      UBS
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                      Qtd.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-sm text-slate-400"
                      >
                        Carregando medicamentos...
                      </td>
                    </tr>
                  ) : filteredMedicamentos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-sm text-slate-400"
                      >
                        Nenhum medicamento encontrado para essa pesquisa.
                      </td>
                    </tr>
                  ) : (
                    filteredMedicamentos.map((med) => (
                      <tr
                        key={med.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900 truncate">
                            {med.nome}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {med.descricao || "Sem descrição"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 truncate max-w-[180px]">
                          {med.ubs?.nome || med.ubsId || "UBS não informada"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              med.quantidade > 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {med.quantidade > 0
                              ? "✓ Disponível"
                              : "✕ Sem estoque"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                          {med.quantidade}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer — fixo na base */}
            <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-3 rounded-b-2xl">
              <p className="text-xs text-slate-400 text-center">
                {medLoading
                  ? "Carregando..."
                  : `${filteredMedicamentos.length} medicamento(s) encontrado(s)`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURES ────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal-700">
              Funcionalidades
            </span>
            <h2 className="mb-3 text-3xl font-bold text-gray-900">
              Funcionalidades Principais
            </h2>
            <p className="mx-auto max-w-md text-gray-500">
              Tudo que você precisa para gerenciar sua saúde de forma digital e
              integrada
            </p>
          </div>

          {/* Grid de features — lógica {features.map} original intacta */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
              >
                {/* Ícone — usa feature.color original */}
                <div
                  className={`${feature.color} mb-4 inline-flex rounded-xl p-2.5 text-white`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-teal-800 to-teal-600 py-20 px-4">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-white">
            Pronto para começar?
          </h2>
          <p className="mb-9 text-lg text-white/75">
            Cadastre-se agora e tenha acesso completo ao seu histórico de saúde
          </p>
          <Link
            to="/cadastro-paciente"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-teal-800 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-50"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-gray-950 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-rose-500" />
            <span className="text-base font-bold text-white">SISC — Saúde</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              to="/login-sistema"
              className="text-sm text-white/50 transition-colors hover:text-white"
            >
              Acesso Profissionais
            </Link>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/30">
              © 2026 Sistema Integrado de Saúde do Cidadão
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
