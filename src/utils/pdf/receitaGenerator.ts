import jsPDF from "jspdf";
import { 
  norm, 
  slug, 
  formatDate, 
  ML, 
  DARK, 
  LINE_GRAY, 
  MID_GRAY, 
  LIGHT_GRAY,
  pageWidth,
  contentWidth,
  addHeader,
  addFooter,
  drawSignature,
  sectionTitle,
  safeText,
  hLine
} from "./common";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface MedicamentoItem {
  medicamento: string;
  dosagem?: string;
  quantidade?: string | number;
  posologia?: string;
  observacoes?: string;
}

interface Assinatura {
  texto?: string;
  posX?: number;
  posY?: number;
  registro?: string;
  data?: string;
}

interface ReceitaData {
  dataEmissao?: string | Date;
  cid?: string;
  status?: string;
  medicamento?: string; // legado
  dosagem?: string;     // legado
  itens?: MedicamentoItem[];
}

interface Paciente {
  nome?: string;
  cpf?: string;
  cns?: string;
  dataNascimento?: string;
  endereco?: string;
}

interface Medico {
  nome?: string;
  crm?: string;
  especialidade?: string;
  ubs?: { nome?: string };
}

interface UBS {
  nome?: string;
  endereco?: string;
  cnpj?: string;
}

// ─── Primitivos Específicos ───────────────────────────────────────────────────

const addPatientBlock = (
  pdf: jsPDF,
  paciente: Paciente,
  receita: ReceitaData,
  medico: Medico,
  ubs: UBS,
  y: number,
): number => {
  const CW = contentWidth(pdf);
  const blockH = 28;

  // Fundo cinza claro
  pdf.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
  pdf.setLineWidth(0.3);
  pdf.rect(ML, y, CW, blockH, "FD");

  // Padding interno
  const px = ML + 5;
  const py = y + 5;

  // Coluna esquerda (60 %)
  const colL = CW * 0.6 - 5;
  const xR = ML + CW * 0.6 + 2;
  const colR = CW * 0.4 - 5;

  // ── Paciente
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, "PACIENTE", px, py);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  const nomeLines = pdf.splitTextToSize(norm(paciente.nome), colL);
  pdf.text(nomeLines, px, py + 5);

  // CPF · CNS
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(
    pdf,
    `CPF: ${norm(paciente.cpf)}   CNS: ${norm(paciente.cns)}`,
    px,
    py + 11,
  );

  // Data de emissão + CID
  pdf.setFontSize(8);
  safeText(
    pdf,
    `Emissão: ${formatDate(receita.dataEmissao)}   CID: ${norm(receita.cid)}`,
    px,
    py + 17,
  );

  // ── Médico / UBS (coluna direita)
  pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
  pdf.setLineWidth(0.3);
  pdf.line(xR - 3, y + 3, xR - 3, y + blockH - 3);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, "MÉDICO RESPONSÁVEL", xR, py);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  const medicoLines = pdf.splitTextToSize(norm(medico.nome), colR);
  pdf.text(medicoLines, xR, py + 5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, `CRM: ${norm(medico.crm)}`, xR, py + 11);

  const ubsNome = norm(ubs?.nome || medico?.ubs?.nome);
  const ubsLines = pdf.splitTextToSize(ubsNome, colR);
  pdf.setFontSize(7);
  pdf.text(ubsLines, xR, py + 16);

  return y + blockH + 8;
};

const medicamentoBlock = (
  pdf: jsPDF,
  numero: number,
  item: MedicamentoItem,
  y: number,
): number => {
  const CW = contentWidth(pdf);

  const nameLines = pdf.splitTextToSize(norm(item.medicamento), CW - 18);
  const posLines = item.posologia ? pdf.splitTextToSize(norm(item.posologia), CW - 18) : [];
  const obsLines = item.observacoes ? pdf.splitTextToSize(norm(item.observacoes), CW - 18) : [];

  const lineH = 4.5;
  const bH = 5 + nameLines.length * 5 + (posLines.length ? posLines.length * lineH + 2 : 0) + (obsLines.length ? obsLines.length * lineH + 1 : 0) + 6;

  pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
  pdf.rect(ML, y, 2, bH, "F");

  pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
  pdf.setLineWidth(0.3);
  pdf.rect(ML + 2, y, CW - 2, bH, "S");

  const px = ML + 9;
  let cy = y + 6;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, String(numero).padStart(2, "0"), ML + 4, cy - 1);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  pdf.text(nameLines, px, cy);
  cy += nameLines.length * 5;

  const tags: string[] = [];
  if (item.dosagem) tags.push(`Dosagem: ${norm(item.dosagem)}`);
  if (item.quantidade) tags.push(`Qtd.: ${item.quantidade}`);

  if (tags.length) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
    safeText(pdf, tags.join("   ·   "), px, cy);
    cy += lineH + 1;
  }

  if (posLines.length) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
    pdf.text(posLines, px, cy);
    cy += posLines.length * lineH + 2;
  }

  if (obsLines.length) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7.5);
    pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
    pdf.text(obsLines, px, cy);
    cy += obsLines.length * lineH;
  }

  return y + bH + 5;
};

// ─── Função Principal ─────────────────────────────────────────────────────────

export const generateReceitaPDF = (
  receita: ReceitaData,
  paciente: Paciente,
  medico: Medico,
  ubs: UBS,
  assinatura?: Assinatura,
  logoBase64?: string,
  logoMime: string = "PNG",
): void => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  let y = addHeader(pdf, "Receita Médica", logoBase64, logoMime);
  y += 2;

  y = addPatientBlock(pdf, paciente, receita, medico, ubs, y);
  y = sectionTitle(pdf, "Prescrição Médica", y);

  const itens: MedicamentoItem[] =
    Array.isArray(receita.itens) && receita.itens.length
      ? receita.itens
      : receita.medicamento
        ? [{ medicamento: receita.medicamento, dosagem: receita.dosagem }]
        : [];

  itens.forEach((item, idx) => {
    y = medicamentoBlock(pdf, idx + 1, item, y);
  });

  if (receita.status && receita.status !== "Ativo") {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7.5);
    pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
    safeText(pdf, `Status: ${norm(receita.status)}`, ML, y + 4);
    y += 10;
  }

  drawSignature(pdf, assinatura);
  addFooter(pdf);

  pdf.save(`receita-${slug(paciente.nome)}.pdf`);
};
