import * as pacienteService from "../services/pacienteService.js";
// server/controllers/pacienteController.js

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Lista as campanhas em que o paciente foi inscrito e tem agendamento
export const listarCampanhasInscritas = async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: req.user.id },
    });

    if (!paciente) {
      return res.status(404).json({ message: "Paciente não encontrado." });
    }

    // Busca inscricoes baseadas no CPF do paciente na tabela InscricaoCampanha
    const inscricoes = await prisma.inscricaoCampanha.findMany({
      where: {
        cpf: paciente.cpf,
      },
      include: {
        campanha: true,
        agendamento: {
          include: {
            ubs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mapear os dados combinando inscrições pendentes e agendamentos confirmados/agendados
    const campanhasPaciente = inscricoes.map((inscricao) => {
      if (inscricao.agendamento) {
        return {
          ...inscricao.agendamento,
          tipo: "agendamento",
          campanha: inscricao.campanha,
        };
      } else {
        return {
          id: inscricao.id,
          tipo: "inscricao",
          campanha: inscricao.campanha,
          status: "pendente",
          createdAt: inscricao.createdAt,
        };
      }
    });

    res.json(campanhasPaciente);
  } catch (error) {
    console.error("Erro ao listar campanhas do paciente:", error);
    res.status(500).json({ message: "Erro interno ao buscar campanhas." });
  }
};

// Confirma a presença no agendamento da campanha
export const confirmarAgendamentoCampanha = async (req, res) => {
  try {
    const { id } = req.params;

    const agendamento = await prisma.agendamentoCampanha.findUnique({
      where: { id },
      include: { inscricao: true },
    });

    if (!agendamento) {
      return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id: req.user.id },
    });

    if (agendamento.inscricao.cpf !== paciente.cpf) {
      return res
        .status(403)
        .json({
          message: "Acesso negado. Este agendamento pertence a outro CPF.",
        });
    }

    const atualizado = await prisma.agendamentoCampanha.update({
      where: { id },
      data: { status: "confirmada" },
    });

    res.json({
      message: "Agendamento confirmado com sucesso!",
      agendamento: atualizado,
    });
  } catch (error) {
    console.error("Erro ao confirmar agendamento de campanha:", error);
    res.status(500).json({ message: "Erro ao confirmar agendamento." });
  }
};

// Cancela o agendamento recebendo a justificativa
export const cancelarAgendamentoCampanha = async (req, res) => {
  try {
    const { id } = req.params;
    const { justificativa } = req.body;

    if (!justificativa || justificativa.trim() === "") {
      return res
        .status(400)
        .json({
          message: "A justificativa é obrigatória para cancelar o agendamento.",
        });
    }

    const agendamento = await prisma.agendamentoCampanha.findUnique({
      where: { id },
      include: { inscricao: true },
    });

    if (!agendamento) {
      return res.status(404).json({ message: "Agendamento não encontrado." });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id: req.user.id },
    });

    if (agendamento.inscricao.cpf !== paciente.cpf) {
      return res
        .status(403)
        .json({
          message: "Acesso negado. Este agendamento pertence a outro CPF.",
        });
    }

    const atualizado = await prisma.agendamentoCampanha.update({
      where: { id },
      data: {
        status: "cancelada",
        justificativa,
      },
    });

    res.json({
      message: "Agendamento cancelado com sucesso!",
      agendamento: atualizado,
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento de campanha:", error);
    res.status(500).json({ message: "Erro ao cancelar agendamento." });
  }
};

const handleError = (
  res,
  error,
  customMessage = "Erro interno do servidor",
) => {
  if (error.status && error.data) {
    return res.status(error.status).json(error.data);
  }
  console.error(customMessage, error);
  return res
    .status(500)
    .json({ message: customMessage, details: error.message });
};

export const obterPerfil = async (req, res) => {
  try {
    const paciente = await pacienteService.obterPerfil(req.user.id);
    res.json(paciente);
  } catch (error) {
    handleError(res, error, "Erro ao obter perfil:");
  }
};

export const atualizarPerfil = async (req, res) => {
  try {
    const paciente = await pacienteService.atualizarPerfil(
      req.user.id,
      req.body,
    );
    res.json(paciente);
  } catch (error) {
    handleError(res, error, "Erro ao atualizar perfil:");
  }
};

export const obterHistoricoMedico = async (req, res) => {
  try {
    const historico = await pacienteService.obterHistoricoMedico(req.user.id);
    res.json(historico);
  } catch (error) {
    handleError(res, error, "Erro ao obter histórico médico:");
  }
};

export const obterVacinas = async (req, res) => {
  try {
    const vacinas = await pacienteService.obterVacinas(req.user.id);
    res.json(vacinas);
  } catch (error) {
    handleError(res, error, "Erro ao obter vacinas:");
  }
};

export const obterExames = async (req, res) => {
  try {
    const exames = await pacienteService.obterExames(req.user.id);
    res.json(exames);
  } catch (error) {
    handleError(res, error, "Erro ao obter exames:");
  }
};

export const listarSolicitacoesExame = async (req, res) => {
  try {
    const solicitacoes = await pacienteService.listarSolicitacoesExame(
      req.user.id,
    );
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, "Erro ao obter solicitações de exame:");
  }
};

export const solicitarConsulta = async (req, res) => {
  try {
    const consulta = await pacienteService.solicitarConsulta(
      req.user.id,
      req.body,
    );
    res.status(201).json(consulta);
  } catch (error) {
    handleError(res, error, "Erro ao solicitar consulta:");
  }
};

export const listarConsultas = async (req, res) => {
  try {
    const consultas = await pacienteService.listarConsultas(req.user.id);
    res.json(consultas);
  } catch (error) {
    handleError(res, error, "Erro ao obter consultas:");
  }
};

export const confirmarConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await pacienteService.confirmarConsulta(id, req.user.id);
    res.json(consulta);
  } catch (error) {
    handleError(res, error, "Erro ao confirmar consulta:");
  }
};

export const cancelarConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = await pacienteService.cancelarConsulta(
      id,
      req.user.id,
      req.body,
    );
    res.json({ message: "Consulta cancelada com sucesso", consulta });
  } catch (error) {
    handleError(res, error, "Erro ao cancelar consulta:");
  }
};

export const listarUbs = async (req, res) => {
  try {
    const ubsList = await pacienteService.listarUbs();
    res.json(ubsList);
  } catch (error) {
    handleError(res, error, "Erro ao listar UBS:");
  }
};

export const listarSolicitacoesInternacao = async (req, res) => {
  try {
    const { status } = req.query;
    const solicitacoes = await pacienteService.listarSolicitacoesInternacao(
      req.user.id,
      status,
    );
    res.json(solicitacoes);
  } catch (error) {
    handleError(res, error, "Erro ao listar solicitações de internação:");
  }
};

export const obterDetalhesSolicitacaoInternacao = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitacao =
      await pacienteService.obterDetalhesSolicitacaoInternacao(id, req.user.id);
    res.json(solicitacao);
  } catch (error) {
    handleError(res, error, "Erro ao obter solicitação:");
  }
};

export const confirmarAgendamentoInternacao = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitacao = await pacienteService.confirmarAgendamentoInternacao(
      id,
      req.user.id,
      req.body,
    );
    res.json({ message: "Agendamento confirmado com sucesso", solicitacao });
  } catch (error) {
    handleError(res, error, "Erro ao confirmar agendamento:");
  }
};

export const listarInternacoes = async (req, res) => {
  try {
    const internacoes = await pacienteService.listarInternacoes(req.user.id);
    res.json(internacoes);
  } catch (error) {
    handleError(res, error, "Erro ao listar internações:");
  }
};

export const obterDetalhesInternacao = async (req, res) => {
  try {
    const { id } = req.params;
    const internacao = await pacienteService.obterDetalhesInternacao(
      id,
      req.user.id,
    );
    res.json(internacao);
  } catch (error) {
    handleError(res, error, "Erro ao obter internação:");
  }
};

export const listarProcedimentosHospitalares = async (req, res) => {
  try {
    const procedimentos = await pacienteService.listarProcedimentosHospitalares(
      req.user.id,
    );
    res.json(procedimentos);
  } catch (error) {
    handleError(res, error, "Erro ao listar procedimentos hospitalares:");
  }
};

export const listarMedicacoesAdministradas = async (req, res) => {
  try {
    const { internacaoId } = req.query;
    const medicacoes = await pacienteService.listarMedicacoesAdministradas(
      req.user.id,
      internacaoId,
    );
    res.json(medicacoes);
  } catch (error) {
    handleError(res, error, "Erro ao listar medicações administradas:");
  }
};

export const listarMedicacoesPaciente = async (req, res) => {
  try {
    const medicacoes = await pacienteService.listarMedicacoesPaciente(
      req.user.id,
    );
    res.json(medicacoes);
  } catch (error) {
    handleError(res, error, "Erro ao listar medicações do paciente:");
  }
};

export const listarAgendamentosHospitalares = async (req, res) => {
  try {
    const agendamentos = await pacienteService.listarAgendamentosHospitalares(
      req.user.id,
    );
    res.json(agendamentos);
  } catch (error) {
    handleError(res, error, "Erro ao listar agendamentos hospitalares:");
  }
};

export const confirmarAgendamentoHospitalar = async (req, res) => {
  try {
    const { id } = req.params;
    const agendamento = await pacienteService.confirmarAgendamentoHospitalar(
      id,
      req.user.id,
      req.body,
    );
    res.json({ message: "Agendamento confirmado com sucesso", agendamento });
  } catch (error) {
    handleError(res, error, "Erro ao confirmar agendamento hospitalar:");
  }
};

export const obterHistoricoHospitalar = async (req, res) => {
  try {
    const historico = await pacienteService.obterHistoricoHospitalar(
      req.user.id,
    );
    res.json(historico);
  } catch (error) {
    handleError(res, error, "Erro ao obter histórico hospitalar:");
  }
};
