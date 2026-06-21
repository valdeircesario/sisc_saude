import { useQuery, useMutation, useQueryClient } from "react-query";
import { api } from "../services/api";

export interface Notificacao {
  id: string;
  pacienteId: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  acao?: string | null;
  lida: boolean;
  referenciaId?: string | null;
  createdAt: string;
}

export const TAB_POR_TIPO: Record<string, string> = {
  CONSULTA: "consultas",
  HISTORICO: "historico",
  EXAME: "exames",
  RECEITA: "receitas",
  DISPENSACAO: "receitas",
  VACINA: "vacinas",
  INTERNACAO: "internacoes",
  CAMPANHA: "home",
  SISTEMA: "home",
};

export const useNotificacoes = () => {
  const queryClient = useQueryClient();

  const contagemQuery = useQuery<{ naoLidas: number }>(
    "paciente-notificacoes-contagem",
    () => api.get("/paciente/notificacoes/contagem").then((r) => r.data),
    { refetchInterval: 60000 }
  );

  const listagemQuery = useQuery<{
    notificacoes: Notificacao[];
    total: number;
    page: number;
    limit: number;
  }>("paciente-notificacoes", () =>
    api.get("/paciente/notificacoes?limit=15").then((r) => r.data)
  );

  const marcarLidaMutation = useMutation(
    (id: string) => api.put(`/paciente/notificacoes/${id}/lida`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-notificacoes");
        queryClient.invalidateQueries("paciente-notificacoes-contagem");
      },
    }
  );

  const marcarTodasLidasMutation = useMutation(
    () => api.put("/paciente/notificacoes/marcar-todas-lidas"),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("paciente-notificacoes");
        queryClient.invalidateQueries("paciente-notificacoes-contagem");
      },
    }
  );

  return {
    naoLidas: contagemQuery.data?.naoLidas ?? 0,
    notificacoes: listagemQuery.data?.notificacoes ?? [],
    isLoading: listagemQuery.isLoading || contagemQuery.isLoading,
    marcarLida: marcarLidaMutation.mutateAsync,
    marcarTodasLidas: marcarTodasLidasMutation.mutateAsync,
    refetch: () => {
      listagemQuery.refetch();
      contagemQuery.refetch();
    },
  };
};
