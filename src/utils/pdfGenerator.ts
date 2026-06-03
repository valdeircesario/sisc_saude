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

//pdf receitas e atestado

// ─── Utilitários ─────────────────────────────────────────────────────────────

const norm = (value: string | undefined | null): string =>
  String(value ?? "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim() || "—";

const slug = (name: string) => norm(name).toLowerCase().replace(/\s+/g, "-");

// ─── Primitivos de layout ─────────────────────────────────────────────────────

/** Linha horizontal fina */
const hRule = (
  pdf: jsPDF,
  y: number,
  weight: number = 0.3,
  color: [number, number, number] = [200, 200, 200],
) => {
  const W = pdf.internal.pageSize.getWidth();
  pdf.setDrawColor(...color);
  pdf.setLineWidth(weight);
  pdf.line(32, y, W - 32, y);
};

/** Label em versalete + linha underline */
const fieldUnderline = (
  pdf: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxW: number,
): number => {
  const lines = pdf.splitTextToSize(value, maxW);

  // Label versalete
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  pdf.text(label.toUpperCase(), x, y);

  // Valor
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(26, 26, 26);
  pdf.text(lines, x, y + 6);

  // Underline
  const lineY = y + 6 + (lines.length - 1) * 5.5 + 4;
  pdf.setDrawColor(224, 224, 224);
  pdf.setLineWidth(0.3);
  pdf.line(x, lineY, x + maxW, lineY);

  return lineY + 6; // próximo y disponível
};

/** Seção com título em versalete e régua */
const sectionTitle = (pdf: jsPDF, label: string, y: number): number => {
  const W = pdf.internal.pageSize.getWidth();
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text(label.toUpperCase(), 32, y);
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.line(32, y + 2, W - 32, y + 2);
  return y + 10;
};

/** Bloco de destaque neutro (medicamento / dias de repouso) */
const highlightBlock = (
  pdf: jsPDF,
  label: string,
  main: string,
  sub: string,
  y: number,
): number => {
  const W = pdf.internal.pageSize.getWidth();
  const bW = W - 64;

  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.4);
  pdf.rect(32, y, bW, 26, "S");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text(label.toUpperCase(), 38, y + 7);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(26, 26, 26);
  pdf.text(main, 38, y + 16);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(sub, 38, y + 23);

  return y + 32;
};

/** Caixa de texto com label (descrição / observações) */
const textBlock = (
  pdf: jsPDF,
  label: string,
  value: string,
  y: number,
): number => {
  const W = pdf.internal.pageSize.getWidth();
  const bW = W - 64;
  const lines = pdf.splitTextToSize(value, bW - 12);
  const bH = 14 + lines.length * 5.2;

  pdf.setFillColor(249, 249, 249);
  pdf.setDrawColor(224, 224, 224);
  pdf.setLineWidth(0.3);
  pdf.rect(32, y, bW, bH, "FD");

  // Borda esquerda discreta (cinza escuro)
  pdf.setFillColor(140, 140, 140);
  pdf.rect(32, y, 1.5, bH, "F");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  pdf.text(label.toUpperCase(), 38, y + 7);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(68, 68, 68);
  pdf.text(lines, 38, y + 13);

  return y + bH + 6;
};

// ─── Cabeçalho e rodapé ───────────────────────────────────────────────────────

const addHeader = (pdf: jsPDF, docTitle: string) => {
  const W = pdf.internal.pageSize.getWidth();

  // Nome do sistema — lado esquerdo
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(26, 26, 26);
  pdf.text("SaúdeDigital", 32, 20);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(130, 130, 130);
  pdf.text("Sistema Individual de Saude do Cidadão   ·  Documento oficial", 32, 27);

  // Badge SUS — lado direito
  pdf.setDrawColor(26, 26, 26);
  pdf.setLineWidth(0.5);
  pdf.rect(W - 52, 13, 20, 10, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(26, 26, 26);
  pdf.text("Sisc", W - 42, 19.5, { align: "center" });

  // Linha dupla separadora
  pdf.setDrawColor(26, 26, 26);
  pdf.setLineWidth(1.2);
  pdf.line(32, 34, W - 32, 34);
  pdf.setLineWidth(0.3);
  pdf.line(32, 36.5, W - 32, 36.5);

  // Título do documento
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(20);
  pdf.setTextColor(26, 26, 26);
  pdf.setCharSpace(2.5);
  pdf.text(docTitle.toUpperCase(), 32, 50);
  pdf.setCharSpace(0);
};

const addDocFooter = (pdf: jsPDF) => {
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  hRule(pdf, H - 36, 0.3, [200, 200, 200]);

  // Linha de assinatura
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.4);
  pdf.line(32, H - 22, 150, H - 22);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(130, 130, 130);
  pdf.text("Assinatura e carimbo do médico", 32, H - 16);

  // Info direita
  pdf.setFontSize(7.5);
  pdf.setTextColor(170, 170, 170);
  pdf.text("Sistema Individual de Saude do Cidadão", W - 32, H - 24, {
    align: "right",
  });
  pdf.text(`Emitido em ${new Date().toLocaleString("pt-BR")}`, W - 32, H - 17, {
    align: "right",
  });
};

const drawSignature = (
  pdf: jsPDF,
  assinatura?: {
    texto?: string;
    posX?: number;
    posY?: number;
    registro?: string;
    data?: string;
  },
) => {
  if (!assinatura?.texto || assinatura.posX == null || assinatura.posY == null) {
    return;
  }

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(11);
  safeText(pdf, assinatura.texto, assinatura.posX, assinatura.posY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  safeText(pdf, `Registro: ${assinatura.registro || "—"}`, assinatura.posX, assinatura.posY + 6);
  safeText(
    pdf,
    `Assinado em ${assinatura.data || new Date().toLocaleDateString("pt-BR")}`,
    assinatura.posX,
    assinatura.posY + 11,
  );
};

// ─── Campos em duas colunas ───────────────────────────────────────────────────

const twoColumns = (
  pdf: jsPDF,
  left: { label: string; value: string },
  right: { label: string; value: string },
  y: number,
): number => {
  const W = pdf.internal.pageSize.getWidth();
  const colW = (W - 64 - 10) / 2;

  const yL = fieldUnderline(pdf, left.label, left.value, 32, y, colW);
  const yR = fieldUnderline(
    pdf,
    right.label,
    right.value,
    32 + colW + 10,
    y,
    colW,
  );

  return Math.max(yL, yR) + 2;
};

// ─── Exportações ──────────────────────────────────────────────────────────────

export const generateReceitaPDF = (
  receita: any,
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

  addHeader(pdf, "Receita Médica");

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
      value: receita?.dataEmissao
        ? new Date(receita.dataEmissao).toLocaleDateString("pt-BR")
        : "—",
    },
    { label: "CID", value: norm(receita?.cid) },
    y,
  );

  y += 4;

  // ── Prescrição
  y = sectionTitle(pdf, "Prescrição", y);
  y = highlightBlock(
    pdf,
    "Medicamento",
    norm(receita?.medicamento),
    `Dosagem: ${norm(receita?.dosagem)}`,
    y,
  );
  y = textBlock(pdf, "Descrição", norm(receita?.descricao), y);
  y = textBlock(pdf, "Observações", norm(receita?.observacoes || "Nenhuma"), y);

  // Status discreto
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(130, 130, 130);
  pdf.text(`Status: ${norm(receita?.status || "Ativo")}`, 32, y + 4);

  drawSignature(pdf, assinatura);
  addDocFooter(pdf);
  pdf.save(`receita-${slug(paciente?.nome)}.pdf`);
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
