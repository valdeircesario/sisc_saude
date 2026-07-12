import jsPDF from "jspdf";
import {
  addHeader,
  contentWidth,
  DARK,
  formatDate,
  hLine,
  LIGHT_GRAY,
  LINE_GRAY,
  ML,
  MR,
  MID_GRAY,
  normalizeText,
  pageHeight,
  pageWidth,
  safeText,
  sectionTitle,
  slug,
} from "./common";

const reportTitles: Record<string, string> = {
  estoque: "Estoque de Medicamentos",
  dispensacoes: "Medicamentos Dispensados",
  consultas: "Consultas Realizadas",
  vacinas: "Vacinações Registradas",
  campanhas: "Relatório de Campanhas",
};

const getReportTitle = (tipo: string) => reportTitles[tipo] || "Relatório UBS";

const drawTableHeader = (
  pdf: jsPDF,
  headers: string[],
  widths: number[],
  y: number,
) => {
  pdf.setFillColor(...LIGHT_GRAY);
  pdf.setDrawColor(...LINE_GRAY);
  pdf.setLineWidth(0.3);
  pdf.rect(
    ML,
    y,
    widths.reduce((sum, w) => sum + w, 0),
    10,
    "F",
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);

  let x = ML + 2;
  headers.forEach((header, index) => {
    safeText(pdf, header, x, y + 6.5);
    x += widths[index];
  });
  return y + 12;
};

const startNewPage = (pdf: jsPDF, title: string) => {
  pdf.addPage();
  const y = addHeader(pdf, `${title} (Continuação)`);
  return y + 10;
};

const renderCell = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
) => {
  const lines = pdf.splitTextToSize(normalizeText(text), width - 4);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  pdf.text(lines, x, y);
  return lines.length * 4.5;
};

export const generateUBSReportPDF = (
  tipo: string,
  relatorio: any,
  periodo: { dataInicio?: string; dataFim?: string },
) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const title = getReportTitle(tipo);
  let y = addHeader(pdf, `Relatório UBS - ${title}`);
  y += 6;

  const rangeLabel =
    periodo.dataInicio || periodo.dataFim
      ? `Período: ${periodo.dataInicio || "-"} até ${periodo.dataFim || "-"}`
      : "Período: Todos os registros";

  const summaryText = `Tipo: ${title}`;
  const countText = `Registros: ${relatorio?.resultado?.length ?? 0}`;

  pdf.setFillColor(...LIGHT_GRAY);
  pdf.setDrawColor(...LINE_GRAY);
  pdf.roundedRect(ML, y, contentWidth(pdf), 24, 4, 4, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  safeText(pdf, summaryText, ML + 4, y + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  safeText(pdf, rangeLabel, ML + 4, y + 14);
  safeText(pdf, countText, ML + 4, y + 20);

  y += 34;
  y = sectionTitle(pdf, "Dados do Relatório", y);
  y += 4;

  const rows = relatorio?.resultado || [];

  let headers: string[] = [];
  let widths: number[] = [];

  switch (tipo) {
    case "estoque":
      headers = ["Medicamento", "Lote", "Quantidade", "Validade", "Vencido"];
      widths = [70, 30, 25, 30, 30];
      break;
    case "dispensacoes":
      headers = [
        "Medicamento",
        "Paciente",
        "Quantidade",
        "Data",
        "Profissional",
      ];
      widths = [50, 40, 25, 35, 40];
      break;
    case "consultas":
      headers = [
        "Paciente",
        "Especialidade",
        "Data Agendada",
        "Status",
        "Data Consulta",
        "Diagnóstico",
        "Laudo",
      ];
      widths = [40, 30, 25, 20, 25, 30, 30];
      break;
    case "vacinas":
      headers = ["Paciente", "Vacina", "Data", "Lote", "Próxima Dose"];
      widths = [50, 45, 30, 30, 30];
      break;
    case "campanhas":
      headers = ["Nome", "CPF", "Status", "Agendamento", "Observações"];
      widths = [50, 35, 30, 40, 35];
      break;
    default:
      headers = ["Registro"];
      widths = [contentWidth(pdf)];
      break;
  }

  if (!rows.length) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    safeText(pdf, "Nenhum registro encontrado para esse filtro.", ML, y + 6);
  } else {
    y = drawTableHeader(pdf, headers, widths, y);

    rows.forEach((item: any) => {
      const rowHeight = 10;
      if (y + rowHeight > pageHeight(pdf) - 30) {
        y = startNewPage(pdf, title);
        y = drawTableHeader(pdf, headers, widths, y);
      }

      let x = ML + 2;
      switch (tipo) {
        case "estoque":
          renderCell(pdf, item.nome || "-", x, y + 6, widths[0]);
          x += widths[0];
          renderCell(pdf, item.lote || "-", x, y + 6, widths[1]);
          x += widths[1];
          renderCell(pdf, String(item.quantidade ?? "-"), x, y + 6, widths[2]);
          x += widths[2];
          renderCell(pdf, formatDate(item.dataValidade), x, y + 6, widths[3]);
          x += widths[3];
          renderCell(pdf, item.vencido ? "Sim" : "Não", x, y + 6, widths[4]);
          break;
        case "dispensacoes":
          renderCell(pdf, item.medicamento || "-", x, y + 6, widths[0]);
          x += widths[0];
          renderCell(pdf, item.pacienteNome || "-", x, y + 6, widths[1]);
          x += widths[1];
          renderCell(pdf, String(item.quantidade ?? "-"), x, y + 6, widths[2]);
          x += widths[2];
          renderCell(pdf, formatDate(item.dataRetirada), x, y + 6, widths[3]);
          x += widths[3];
          renderCell(pdf, item.funcionarioNome || "-", x, y + 6, widths[4]);
          break;
        case "consultas":
          renderCell(pdf, item.pacienteNome || "-", x, y + 6, widths[0]);
          x += widths[0];
          renderCell(pdf, item.especialidade || "-", x, y + 6, widths[1]);
          x += widths[1];
          renderCell(pdf, formatDate(item.dataAgendada), x, y + 6, widths[2]);
          x += widths[2];
          renderCell(pdf, item.status || "-", x, y + 6, widths[3]);
          x += widths[3];
          renderCell(
            pdf,
            item.historico?.dataConsulta ? formatDate(item.historico.dataConsulta) : "-",
            x,
            y + 6,
            widths[4],
          );
          x += widths[4];
          renderCell(pdf, item.historico?.diagnostico || "-", x, y + 6, widths[5]);
          x += widths[5];
          renderCell(pdf, item.historico?.laudo || "-", x, y + 6, widths[6]);
          break;
        case "vacinas":
          renderCell(pdf, item.pacienteNome || "-", x, y + 6, widths[0]);
          x += widths[0];
          renderCell(pdf, item.vacinaNome || "-", x, y + 6, widths[1]);
          x += widths[1];
          renderCell(pdf, formatDate(item.dataApl), x, y + 6, widths[2]);
          x += widths[2];
          renderCell(pdf, item.lote || "-", x, y + 6, widths[3]);
          x += widths[3];
          renderCell(
            pdf,
            item.proximaDose ? formatDate(item.proximaDose) : "-",
            x,
            y + 6,
            widths[4],
          );
          break;
        case "campanhas":
          renderCell(pdf, item.nome || "-", x, y + 6, widths[0]);
          x += widths[0];
          renderCell(pdf, item.cpf || "-", x, y + 6, widths[1]);
          x += widths[1];
          renderCell(pdf, item.status || "-", x, y + 6, widths[2]);
          x += widths[2];
          renderCell(
            pdf,
            item.agendamento
              ? `${formatDate(item.agendamento.dataAgendada)} ${item.agendamento.horaAgendada || ""}`
              : "Sem agendamento",
            x,
            y + 6,
            widths[3],
          );
          x += widths[3];
          renderCell(
            pdf,
            item.observacoes || item.agendamento?.observacoes || "-",
            x,
            y + 6,
            widths[4],
          );
          break;
        default:
          renderCell(pdf, JSON.stringify(item), x, y + 6, widths[0]);
          break;
      }
      y += rowHeight;
      pdf.setDrawColor(...LINE_GRAY);
      pdf.setLineWidth(0.15);
      pdf.line(ML, y, pageWidth(pdf) - MR, y);
    });
  }

  const footerY = pageHeight(pdf) - 20;
  hLine(pdf, footerY, 0.3, LINE_GRAY, ML, pageWidth(pdf) - MR);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(
    pdf,
    `Emitido em ${new Date().toLocaleString("pt-BR")}`,
    ML,
    footerY + 8,
  );
  safeText(
    pdf,
    `SISC - Sistema Individual de Saúde do Cidadão`,
    pageWidth(pdf) - MR,
    footerY + 8,
    {
      align: "right",
    },
  );

  pdf.save(`relatorio-ubs-${tipo}-${slug(rangeLabel)}.pdf`);
};
