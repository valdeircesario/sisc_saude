import jsPDF from "jspdf";

// Cores neutras e profissionais
const COLORS = {
  primary: [45, 55, 72], // Cinza azulado escuro
  secondary: [74, 85, 104], // Cinza médio
  accent: [59, 130, 246], // Azul suave
  success: [34, 197, 94], // Verde suave
  warning: [245, 101, 101], // Vermelho suave
  light: [248, 250, 252], // Cinza muito claro
  border: [226, 232, 240], // Cinza claro para bordas
  text: [51, 65, 85], // Cinza escuro para texto
  white: [255, 255, 255],
  background: [249, 250, 251], // Background off-white
};

// Função para normalizar texto e remover caracteres especiais problemáticos
const normalizeText = (text: string): string => {
  if (!text) return "";

  return text
    .toString()
    .replace(/[""]/g, '"') // Aspas curvas para retas
    .replace(/['']/g, "'") // Apostrofes curvos para retos
    .replace(/[–—]/g, "-") // Traços longos para hífens
    .replace(/[…]/g, "...") // Reticências especiais
    .replace(/[®©™]/g, "") // Remove símbolos de marca
    .replace(/[\u2000-\u206F]/g, " ") // Remove espaços especiais
    .replace(/[\u2070-\u209F]/g, "") // Remove sobrescritos/subscritos
    .replace(/[\u20A0-\u20CF]/g, "") // Remove símbolos de moeda especiais
    .trim();
};

// Função auxiliar para texto seguro
const safeText = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: any,
) => {
  const normalizedText = normalizeText(text);
  pdf.text(normalizedText, x, y, options);
};

// Função auxiliar para adicionar cabeçalho profissional
const addMainHeader = (pdf: jsPDF, title: string, subtitle?: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Background do cabeçalho com gradiente simulado
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageWidth, 28, "F");

  // Linha de destaque
  pdf.setFillColor(...COLORS.accent);
  pdf.rect(0, 28, pageWidth, 2, "F");

  // Título principal
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  safeText(pdf, title, pageWidth / 2, 18, { align: "center" });

  // Subtítulo se fornecido
  if (subtitle) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    safeText(pdf, subtitle, pageWidth / 2, 25, { align: "center" });
  }

  return 40; // Posição Y após o cabeçalho
};

// Função para adicionar informações do paciente de forma compacta
const addPatientInfo = (pdf: jsPDF, paciente: any, yPosition: number) => {
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Box com bordas arredondadas
  pdf.setFillColor(...COLORS.background);
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(1);
  pdf.roundedRect(15, yPosition, pageWidth - 30, 28, 4, 4, "FD");

  // Título da seção
  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  safeText(pdf, "DADOS DO PACIENTE", 20, yPosition + 8);

  // Informações em layout compacto
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...COLORS.text);

  // Primeira linha
  safeText(pdf, `Nome: ${normalizeText(paciente.nome)}`, 20, yPosition + 16);

  // Segunda linha
  const cpfText = paciente.cpf ? `CPF: ${normalizeText(paciente.cpf)}` : "";
  const dataEmissao = `Emissao: ${new Date().toLocaleDateString("pt-BR")}`;

  if (cpfText) {
    safeText(pdf, cpfText, 20, yPosition + 23);
  }
  safeText(pdf, dataEmissao, pageWidth - 80, yPosition + 23);

  return yPosition + 35;
};

// Função para adicionar rodapé discreto
const addLegacyFooter = (pdf: jsPDF) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Linha sutil
  pdf.setDrawColor(...COLORS.border);
  pdf.setLineWidth(0.5);
  pdf.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

  // Texto do rodapé
  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  safeText(
    pdf,
    "Documento gerado pelo Sistema Municipal de Saude",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" },
  );
};

// Função para adicionar número da página
const addPageNumber = (
  pdf: jsPDF,
  currentPage: number,
  totalPages?: number,
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");

  const pageText = totalPages
    ? `Pagina ${currentPage} de ${totalPages}`
    : `Pagina ${currentPage}`;
  safeText(pdf, pageText, pageWidth - 20, pageHeight - 8, { align: "right" });
};

export const generateHistoricoMedicoPDF = async (
  historico: any[],
  paciente: any,
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentPage = 1;

  // Cabeçalho principal
  let yPosition = addMainHeader(
    pdf,
    "HISTORICO MEDICO",
    "Registro completo de atendimentos",
  );

  // Informações do paciente
  yPosition = addPatientInfo(pdf, paciente, yPosition);
  yPosition += 8;

  // Resumo estatístico compacto
  pdf.setFillColor(...COLORS.accent);
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.roundedRect(15, yPosition, 50, 10, 2, 2, "F");
  safeText(
    pdf,
    `Total: ${historico.length} consulta${historico.length !== 1 ? "s" : ""}`,
    18,
    yPosition + 7,
  );

  yPosition += 18;

  // Lista de consultas com layout otimizado
  historico.forEach((item, index) => {
    // Verifica necessidade de nova página
    const estimatedHeight =
      35 +
      (item.laudo ? 15 : 0) +
      (item.observacoes ? 10 : 0) +
      (item.doenca ? 5 : 0) +
      (item.medicacao ? 5 : 0);

    if (yPosition + estimatedHeight > pageHeight - 25) {
      addLegacyFooter(pdf);
      addPageNumber(pdf, currentPage);
      pdf.addPage();
      currentPage++;
      yPosition = addMainHeader(pdf, "HISTORICO MEDICO", "Continuacao");
      yPosition += 8;
    }

    // Card da consulta com design limpo
    const cardHeight = Math.max(30, estimatedHeight);

    // Background alternado para facilitar leitura
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.background);
      pdf.rect(15, yPosition, pageWidth - 30, cardHeight, "F");
    }

    // Borda esquerda colorida
    pdf.setFillColor(...COLORS.accent);
    pdf.rect(15, yPosition, 3, cardHeight, "F");

    // Número da consulta
    pdf.setFillColor(...COLORS.primary);
    pdf.setTextColor(...COLORS.white);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.circle(28, yPosition + 8, 5, "F");
    safeText(pdf, `${index + 1}`, 28, yPosition + 10, { align: "center" });

    // Diagnóstico principal
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    safeText(pdf, normalizeText(item.diagnostico), 38, yPosition + 10);

    // Data e profissional na mesma linha
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...COLORS.text);

    const dataConsulta = new Date(item.dataConsulta).toLocaleDateString(
      "pt-BR",
    );
    const profissional = `Dr(a). ${normalizeText(item.funcionario?.nome || "N/I")}`;

    safeText(pdf, `Data: ${dataConsulta}`, 38, yPosition + 18);
    safeText(pdf, profissional, 38, yPosition + 25);

    let detailY = yPosition + 32;

    // Detalhes clínicos em formato compacto
    const details = [];

    if (item.doenca) {
      details.push(`Doenca: ${normalizeText(item.doenca)}`);
    }

    if (item.medicacao) {
      details.push(`Medicacao: ${normalizeText(item.medicacao)}`);
    }

    // Renderizar detalhes
    if (details.length > 0) {
      pdf.setFontSize(8);
      pdf.setTextColor(...COLORS.secondary);
      details.forEach((detail) => {
        safeText(pdf, detail, 38, detailY);
        detailY += 5;
      });
    }

    // Laudo e observações se existirem
    if (item.laudo) {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...COLORS.primary);
      safeText(pdf, "Laudo:", 38, detailY);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLORS.text);
      const laudoLines = pdf.splitTextToSize(
        normalizeText(item.laudo),
        pageWidth - 70,
      );
      pdf.text(laudoLines, 38, detailY + 5);
      detailY += 5 + laudoLines.length * 3;
    }

    if (item.observacoes) {
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...COLORS.primary);
      safeText(pdf, "Observacoes:", 38, detailY);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...COLORS.text);
      const obsLines = pdf.splitTextToSize(
        normalizeText(item.observacoes),
        pageWidth - 70,
      );
      pdf.text(obsLines, 38, detailY + 5);
      detailY += 5 + obsLines.length * 3;
    }

    yPosition += cardHeight + 5;
  });

  // Rodapé final
  addLegacyFooter(pdf);
  addPageNumber(pdf, currentPage);

  pdf.save(
    `historico-medico-${normalizeText(paciente.nome).replace(/\s+/g, "-")}.pdf`,
  );
};

// ─── generateReceitaPDF — Layout profissional P&B ────────────────────────────
// Requer: jspdf (npm i jspdf)
// Uso: import { generateReceitaPDF } from "./generateReceitaPDF";

import jsPDF from "jspdf";

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

// ─── Utilitários ─────────────────────────────────────────────────────────────

const norm = (v: string | undefined | null): string =>
  String(v ?? "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim() || "—";

const slug = (name: string) =>
  norm(name).toLowerCase().replace(/\s+/g, "-");

const formatDate = (d?: string | Date): string => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return String(d);
  }
};



// Texto seguro — evita crash com caracteres fora do latin1


// ─── Constantes de layout ────────────────────────────────────────────────────

const ML = 28;          // margem esquerda
const MR = 28;          // margem direita
const LINE_GRAY  = [180, 180, 180] as const;
const DARK       = [26, 26, 26]    as const;
const MID_GRAY   = [110, 110, 110] as const;
const LIGHT_GRAY = [240, 240, 240] as const;

// ─── Primitivos ───────────────────────────────────────────────────────────────

const pageWidth = (pdf: jsPDF) => pdf.internal.pageSize.getWidth();
const pageHeight = (pdf: jsPDF) => pdf.internal.pageSize.getHeight();
const contentWidth = (pdf: jsPDF) => pageWidth(pdf) - ML - MR;

const hLine = (
  pdf: jsPDF,
  y: number,
  weight = 0.3,
  color: readonly [number, number, number] = LINE_GRAY,
  x1?: number,
  x2?: number,
) => {
  const W = pageWidth(pdf);
  pdf.setDrawColor(color[0], color[1], color[2]);
  pdf.setLineWidth(weight);
  pdf.line(x1 ?? ML, y, x2 ?? W - MR, y);
};

// ─── Cabeçalho ────────────────────────────────────────────────────────────────

/**
 * @param logoBase64 — string base64 da imagem (sem prefixo data:image/…)
 *                     Se omitido, exibe apenas o nome do sistema
 */
const addHeader = (
  pdf: jsPDF,
  docTitle: string,
  logoBase64?: string,
  logoMime: string = "PNG",
) => {
  const W = pageWidth(pdf);
  const CX = W / 2; // centro horizontal

  let logoBottom = 14; // onde a logo termina

  // ── Logo centralizada
  if (logoBase64) {
    const logoW = 36;
    const logoH = 14;
    pdf.addImage(
      logoBase64,
      logoMime,
      CX - logoW / 2,
      10,
      logoW,
      logoH,
    );
    logoBottom = 10 + logoH + 2;
  } else {
    // Fallback: nome do sistema centralizado
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
    safeText(pdf, "SaúdeDigital", CX, 21, { align: "center" });
    logoBottom = 25;
  }

  // Subtítulo do sistema
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(
    pdf,
    "Sistema Individual de Saúde do Cidadão  ·  Documento oficial",
    CX,
    logoBottom + 4,
    { align: "center" },
  );

  // Linha dupla separadora
  const sepY = logoBottom + 8;
  hLine(pdf, sepY, 1.0, DARK);
  hLine(pdf, sepY + 2.5, 0.3, [140, 140, 140]);

  // Título do documento — centralizado, com letter-spacing
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  pdf.setCharSpace(3);
  safeText(pdf, docTitle.toUpperCase(), CX, sepY + 14, { align: "center" });
  pdf.setCharSpace(0);

  return sepY + 22; // y inicial para o conteúdo
};

// ─── Rodapé ───────────────────────────────────────────────────────────────────

const addFooter = (pdf: jsPDF) => {
  const W = pageWidth(pdf);
  const H = pageHeight(pdf);

  hLine(pdf, H - 42, 0.3, LINE_GRAY);

  // Área de assinatura
  pdf.setDrawColor(DARK[0], DARK[1], DARK[2]);
  pdf.setLineWidth(0.5);
  pdf.line(ML, H - 20, ML + 110, H - 20);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, "Assinatura e carimbo do médico", ML, H - 14);

  // Info rodapé — direita
  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  safeText(
    pdf,
    "Sistema Individual de Saúde do Cidadão",
    W - MR,
    H - 26,
    { align: "right" },
  );
  safeText(
    pdf,
    `Emitido em ${new Date().toLocaleString("pt-BR")}`,
    W - MR,
    H - 19,
    { align: "right" },
  );
};

// ─── Assinatura digital ───────────────────────────────────────────────────────

const drawSignature = (pdf: jsPDF, assinatura?: Assinatura) => {
  if (!assinatura?.texto || assinatura.posX == null || assinatura.posY == null)
    return;

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(11);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  safeText(pdf, assinatura.texto, assinatura.posX, assinatura.posY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(
    pdf,
    `CRM: ${norm(assinatura.registro)}`,
    assinatura.posX,
    assinatura.posY + 6,
  );
  safeText(
    pdf,
    `Assinado em ${assinatura.data || new Date().toLocaleDateString("pt-BR")}`,
    assinatura.posX,
    assinatura.posY + 12,
  );
};

// ─── Bloco de dados do paciente (compacto, 2 colunas) ────────────────────────

const addPatientBlock = (
  pdf: jsPDF,
  paciente: Paciente,
  receita: ReceitaData,
  medico: Medico,
  ubs: UBS,
  y: number,
): number => {
  const W = pageWidth(pdf);
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
  // Coluna direita (40 %)
  const colR = CW * 0.4 - 5;
  const xR = ML + CW * 0.6 + 2;

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
  // Divisor vertical
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

// ─── Título de seção ─────────────────────────────────────────────────────────

const sectionTitle = (pdf: jsPDF, label: string, y: number): number => {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, label.toUpperCase(), ML, y);
  hLine(pdf, y + 2, 0.5, DARK);
  return y + 10;
};

// ─── Novos utilitários para Atestado ──────────────────────────────────────────

const fieldUnderline = (
  pdf: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): number => {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, label.toUpperCase(), x, y);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  safeText(pdf, value, x, y + 5);

  hLine(pdf, y + 7, 0.2, LINE_GRAY, x, x + width);
  return y + 10;
};

const twoColumns = (
  pdf: jsPDF,
  col1: { label: string; value: string },
  col2: { label: string; value: string },
  y: number,
): number => {
  const CW = contentWidth(pdf);
  const half = CW / 2;
  fieldUnderline(pdf, col1.label, col1.value, ML, y, half - 5);
  fieldUnderline(pdf, col2.label, col2.value, ML + half + 5, y, half - 5);
  return y + 12;
};

const highlightBlock = (
  pdf: jsPDF,
  label: string,
  value: string,
  subValue: string,
  y: number,
): number => {
  const CW = contentWidth(pdf);
  pdf.setFillColor(LIGHT_GRAY[0], LIGHT_GRAY[1], LIGHT_GRAY[2]);
  pdf.roundedRect(ML, y, CW, 18, 2, 2, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, label.toUpperCase(), ML + 5, y + 6);

  pdf.setFontSize(12);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  safeText(pdf, value, ML + 5, y + 13);

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "italic");
  safeText(pdf, subValue, ML + CW - 5, y + 13, { align: "right" });

  return y + 24;
};

const textBlock = (
  pdf: jsPDF,
  label: string,
  text: string,
  y: number,
): number => {
  const CW = contentWidth(pdf);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, label.toUpperCase(), ML, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  const lines = pdf.splitTextToSize(text, CW);
  pdf.text(lines, ML, y + 5);

  return y + 5 + lines.length * 4 + 4;
};

const addDocFooter = (pdf: jsPDF) => {
  addFooter(pdf);
};

// ─── Bloco de medicamento ────────────────────────────────────────────────────

const medicamentoBlock = (
  pdf: jsPDF,
  numero: number,
  item: MedicamentoItem,
  y: number,
): number => {
  const W = pageWidth(pdf);
  const CW = contentWidth(pdf);

  // Linhas de conteúdo
  const nameLines = pdf.splitTextToSize(norm(item.medicamento), CW - 18);
  const posLines  = item.posologia
    ? pdf.splitTextToSize(norm(item.posologia), CW - 18)
    : [];
  const obsLines  = item.observacoes
    ? pdf.splitTextToSize(norm(item.observacoes), CW - 18)
    : [];

  // Altura do bloco
  const lineH = 4.5;
  const bH =
    5 +
    nameLines.length * 5 +
    (posLines.length  ? posLines.length  * lineH + 2 : 0) +
    (obsLines.length  ? obsLines.length  * lineH + 1 : 0) +
    6;

  // Borda esquerda negra (destaque)
  pdf.setFillColor(DARK[0], DARK[1], DARK[2]);
  pdf.rect(ML, y, 2, bH, "F");

  // Borda exterior fina
  pdf.setDrawColor(LINE_GRAY[0], LINE_GRAY[1], LINE_GRAY[2]);
  pdf.setLineWidth(0.3);
  pdf.rect(ML + 2, y, CW - 2, bH, "S");

  const px = ML + 9;
  let cy = y + 6;

  // Número
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
  safeText(pdf, String(numero).padStart(2, "0"), ML + 4, cy - 1);

  // Nome do medicamento
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
  pdf.text(nameLines, px, cy);
  cy += nameLines.length * 5;

  // Dosagem · Quantidade (tags inline)
  const tags: string[] = [];
  if (item.dosagem)   tags.push(`Dosagem: ${norm(item.dosagem)}`);
  if (item.quantidade) tags.push(`Qtd.: ${item.quantidade}`);

  if (tags.length) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
    safeText(pdf, tags.join("   ·   "), px, cy);
    cy += lineH + 1;
  }

  // Posologia
  if (posLines.length) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(DARK[0], DARK[1], DARK[2]);
    pdf.text(posLines, px, cy);
    cy += posLines.length * lineH + 2;
  }

  // Observações
  if (obsLines.length) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7.5);
    pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
    pdf.text(obsLines, px, cy);
    cy += obsLines.length * lineH;
  }

  return y + bH + 5;
};

// ─── Função principal ─────────────────────────────────────────────────────────

/**
 * Gera e salva a receita médica em PDF (preto e branco, layout profissional).
 *
 * @param receita     — dados da receita (itens[] ou legado medicamento/dosagem)
 * @param paciente    — dados do paciente
 * @param medico      — dados do médico (incluindo crm)
 * @param ubs         — dados da UBS
 * @param assinatura  — assinatura digital opcional
 * @param logoBase64  — imagem da logo em base64 puro (sem prefixo data:)
 * @param logoMime    — formato da logo: "PNG" | "JPEG" (default "PNG")
 */
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

  // ── Cabeçalho
  let y = addHeader(pdf, "Receita Médica", logoBase64, logoMime);

  y += 2;

  // ── Bloco do paciente (compacto, uma linha)
  y = addPatientBlock(pdf, paciente, receita, medico, ubs, y);

  // ── Prescrição (centro vertical da folha)
  y = sectionTitle(pdf, "Prescrição Médica", y);

  // Medicamentos
  const itens: MedicamentoItem[] =
    Array.isArray(receita.itens) && receita.itens.length
      ? receita.itens
      : receita.medicamento
        ? [{ medicamento: receita.medicamento, dosagem: receita.dosagem }]
        : [];

  itens.forEach((item, idx) => {
    y = medicamentoBlock(pdf, idx + 1, item, y);
  });

  // Status discreto
  if (receita.status && receita.status !== "Ativo") {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7.5);
    pdf.setTextColor(MID_GRAY[0], MID_GRAY[1], MID_GRAY[2]);
    safeText(pdf, `Status: ${norm(receita.status)}`, ML, y + 4);
    y += 10;
  }

  // ── Assinatura digital (se houver)
  drawSignature(pdf, assinatura);

  // ── Rodapé
  addFooter(pdf);

  // ── Salva
  pdf.save(`receita-${slug(paciente.nome)}.pdf`);
};

export const generateAtestadoPDF = (
  atestado: any,
  paciente: any,
  medico: any,
  ubs: any,
  assinatura?: {
    texto?: string;
    posX?: number;
    posY?: number;
    registro?: string;
    data?: string;
  },
) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const W = pdf.internal.pageSize.getWidth();
  const colFull = W - 64;

  addHeader(pdf, "Atestado Médico");

  let y = 60;

  // ── Paciente
  y = sectionTitle(pdf, "Dados do Paciente", y);
  y =
    fieldUnderline(pdf, "Nome completo", norm(paciente?.nome), 32, y, colFull) +
    4;
  y = twoColumns(
    pdf,
    { label: "CPF", value: norm(paciente?.cpf) },
    { label: "CNS", value: norm(paciente?.cns) },
    y,
  );

  y += 4;

  // ── Atendimento
  y = sectionTitle(pdf, "Dados do Atendimento", y);
  y = twoColumns(
    pdf,
    { label: "Médico responsável", value: norm(medico?.nome) },
    { label: "UBS", value: norm(ubs?.nome || medico?.ubs?.nome) },
    y,
  );
  y = twoColumns(
    pdf,
    {
      label: "Data de emissão",
      value: atestado?.dataEmissao
        ? new Date(atestado.dataEmissao).toLocaleDateString("pt-BR")
        : "—",
    },
    { label: "CID", value: norm(atestado?.cid) },
    y,
  );

  y += 4;

  // ── Afastamento
  y = sectionTitle(pdf, "Afastamento", y);
  y = highlightBlock(
    pdf,
    "Período de repouso",
    `${atestado?.diasRepouso ?? 0} dias`,
    `A contar da data de emissão`,
    y,
  );
  y = textBlock(pdf, "Descrição", norm(atestado?.descricao), y);
  y = textBlock(
    pdf,
    "Observações",
    norm(atestado?.observacoes || "Nenhuma"),
    y,
  );

  drawSignature(pdf, assinatura);
  addDocFooter(pdf);
  pdf.save(`atestado-${slug(paciente?.nome)}.pdf`);
};

///vacinas

export const generateVacinasPDF = async (vacinas: any[], paciente: any) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentPage = 1;

  // Cabeçalho principal
  let yPosition = addMainHeader(
    pdf,
    "CARTAO DE VACINACAO",
    "Registro de imunizacoes",
  );

  // Informações do paciente
  yPosition = addPatientInfo(pdf, paciente, yPosition);
  yPosition += 8;

  // Estatísticas compactas
  const vacinasCompletas = vacinas.filter((v) => !v.proximaDose).length;
  const vacinasPendentes = vacinas.length - vacinasCompletas;

  // Cards de estatísticas lado a lado
  const cardWidth = 70;

  // Card vacinas completas
  pdf.setFillColor(...COLORS.success);
  pdf.roundedRect(15, yPosition, cardWidth, 12, 2, 2, "F");
  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  safeText(pdf, `Completas: ${vacinasCompletas}`, 18, yPosition + 8);

  // Card vacinas pendentes
  pdf.setFillColor(...COLORS.warning);
  pdf.roundedRect(90, yPosition, cardWidth, 12, 2, 2, "F");
  pdf.setTextColor(...COLORS.white);
  safeText(pdf, `Pendentes: ${vacinasPendentes}`, 93, yPosition + 8);

  yPosition += 20;

  // Cabeçalho da tabela
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(15, yPosition, pageWidth - 30, 12, "F");

  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");

  const headers = ["VACINA", "DATA", "LOTE", "PROXIMA", "STATUS"];
  const colWidths = [55, 25, 25, 25, 30];
  let xPos = 18;

  headers.forEach((header, index) => {
    safeText(pdf, header, xPos, yPosition + 8);
    xPos += colWidths[index];
  });

  yPosition += 15;

  // Linhas das vacinas
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);

  vacinas.forEach((vacina, index) => {
    if (yPosition > pageHeight - 30) {
      addLegacyFooter(pdf);
      addPageNumber(pdf, currentPage);
      pdf.addPage();
      currentPage++;
      yPosition = addMainHeader(pdf, "CARTAO DE VACINACAO", "Continuacao");

      // Re-adicionar cabeçalho da tabela
      pdf.setFillColor(...COLORS.primary);
      pdf.rect(15, yPosition, pageWidth - 30, 12, "F");
      pdf.setTextColor(...COLORS.white);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");

      let xHeaderPos = 18;
      headers.forEach((header, headerIndex) => {
        safeText(pdf, header, xHeaderPos, yPosition + 8);
        xHeaderPos += colWidths[headerIndex];
      });

      yPosition += 15;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
    }

    // Background alternado
    if (index % 2 === 0) {
      pdf.setFillColor(...COLORS.background);
      pdf.rect(15, yPosition, pageWidth - 30, 10, "F");
    }

    pdf.setTextColor(...COLORS.text);

    // Dados da linha
    const dataAplicacao = vacina.dataApl
      ? new Date(vacina.dataApl).toLocaleDateString("pt-BR")
      : "N/I";
    const proximaDose = vacina.proximaDose
      ? new Date(vacina.proximaDose).toLocaleDateString("pt-BR")
      : "-";
    const status = vacina.proximaDose ? "Pendente" : "Completa";

    const rowData = [
      normalizeText(vacina.nome || ""),
      dataAplicacao,
      normalizeText(vacina.lote || "N/I"),
      proximaDose,
      status,
    ];

    let xPosition = 18;
    rowData.forEach((data, colIndex) => {
      // Cor especial para status
      if (colIndex === 4) {
        if (vacina.proximaDose) {
          pdf.setTextColor(...COLORS.warning);
          pdf.setFont("helvetica", "bold");
        } else {
          pdf.setTextColor(...COLORS.success);
          pdf.setFont("helvetica", "bold");
        }
      } else {
        pdf.setTextColor(...COLORS.text);
        pdf.setFont("helvetica", "normal");
      }

      // Truncar texto se necessário
      let displayText = data;
      if (colIndex === 0 && data.length > 20) {
        // Nome da vacina
        displayText = data.substring(0, 17) + "...";
      }

      safeText(pdf, displayText, xPosition, yPosition + 7);
      xPosition += colWidths[colIndex];
    });

    yPosition += 10;
  });

  // Legenda compacta
  if (yPosition + 20 > pageHeight - 25) {
    addLegacyFooter(pdf);
    addPageNumber(pdf, currentPage);
    pdf.addPage();
    currentPage++;
    yPosition = addMainHeader(pdf, "CARTAO DE VACINACAO", "Legenda");
  }

  yPosition += 8;
  pdf.setFillColor(...COLORS.light);
  pdf.rect(15, yPosition, pageWidth - 30, 18, "F");

  pdf.setTextColor(...COLORS.primary);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  safeText(pdf, "LEGENDA:", 18, yPosition + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...COLORS.text);
  safeText(
    pdf,
    "Completa: Vacinacao finalizada para esta dose",
    18,
    yPosition + 14,
  );
  safeText(pdf, "Pendente: Proxima dose agendada", 120, yPosition + 14);

  // Rodapé final
  addLegacyFooter(pdf);
  addPageNumber(pdf, currentPage);

  pdf.save(
    `cartao-vacinas-${normalizeText(paciente.nome).replace(/\s+/g, "-")}.pdf`,
  );
};
