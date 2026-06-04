import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Pill,
  Package,
  Clock,
  FileText,
} from "lucide-react";

// ─── Information Items Component ──────────────────────────────────────────────

interface InfoSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  items?: string[];
}

const InfoSection: React.FC<InfoSectionProps> = ({
  icon,
  title,
  description,
  items,
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.04]">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
        {React.cloneElement(icon as React.ReactElement, {
          size: 20,
          className: "text-white",
        })}
      </div>
      <div className="flex-1">
        <h3
          className="text-lg font-semibold text-indigo-950 mb-1"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {description}
        </p>
        {items && (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={`${title}-${item}`}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <CheckCircle2
                  size={14}
                  className="text-emerald-500 mt-0.5 flex-shrink-0"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const FarmaciaInformacoes: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      {/* ── Introdução ── */}
      <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <Info size={28} className="flex-shrink-0 mt-1" />
          <div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Central de Informações da Farmácia
            </h2>
            <p className="text-white/90 leading-relaxed">
              Este módulo foi desenvolvido para gerenciar dispensações de
              medicamentos, consultar receitas e manter o histórico de
              atendimentos. Abaixo você encontra informações importantes sobre
              como utilizar o sistema de forma eficiente.
            </p>
          </div>
        </div>
      </div>

      {/* ── Grid de Informações ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoSection
          icon={<Pill className="text-white" />}
          title="Consultar Receitas"
          description="Busque prescrições de medicamentos pelo número do registro de assinatura para visualizar os dados do paciente e do medicamento prescrito."
          items={[
            "Digite o número do registro de assinatura",
            "Visualize dados do paciente e da receita",
            "Consulte o histórico de dispensações anteriores",
            "Acesse diretamente de uma receita consultada",
          ]}
        />

        <InfoSection
          icon={<Package className="text-white" />}
          title="Registrar Dispensação"
          description="Registre uma dispensação de medicamento quando o paciente recebe o medicamento. Preencha todos os campos obrigatórios corretamente."
          items={[
            "Medicamento fornecido (preenchido automaticamente)",
            "Observações (obrigatório) - ex: medicamento indisponível, paciente retorna depois",
            "Status da dispensação: Completa ou Parcial",
            "Seu nome como atendente (obrigatório)",
          ]}
        />

        <InfoSection
          icon={<Clock className="text-white" />}
          title="Tipos de Dispensação"
          description="Existem dois tipos de dispensação disponíveis no sistema. Escolha o que melhor se aplica à situação."
          items={[
            "Dispensação Completa: o medicamento foi entregue na íntegra",
            "Dispensação Parcial: apenas parte do medicamento foi entregue, paciente retorna depois",
            "Sempre registre observações para justificar dispensações parciais",
          ]}
        />

        <InfoSection
          icon={<FileText className="text-white" />}
          title="Histórico de Dispensações"
          description="Consulte todas as dispensações realizadas na farmácia. Expanda qualquer receita para ver detalhes completos."
          items={[
            "Visualize todas as dispensações registradas",
            "Clique para expandir e ver informações detalhadas",
            "Veja nome do atendente que realizou a dispensação",
            "Acesse observações e informações adicionais",
          ]}
        />

        <InfoSection
          icon={<CheckCircle2 className="text-white" />}
          title="Campos Obrigatórios"
          description="Ao registrar uma dispensação, certifique-se de preencher todos os campos obrigatórios marcados com asterisco (*)."
          items={[
            "Observações (*) - Descrição sobre a dispensação",
            "Atendente Responsável (*) - Seu nome ou identificação",
            "Status da Dispensação - Indicar se é completa ou parcial",
            "Medicamento Fornecido - Pré-preenchido com o da receita",
          ]}
        />

        <InfoSection
          icon={<AlertCircle className="text-white" />}
          title="Validações do Sistema"
          description="O sistema possui validações para garantir a qualidade dos dados registrados."
          items={[
            "Máximo de dispensações permitidas por receita",
            "Campos obrigatórios não podem ficar vazios",
            "Histórico de dispensações não pode ser editado após confirmação",
            "Dados são salvos automaticamente no banco de dados",
          ]}
        />
      </div>

      {/* ── Dicas e Boas Práticas ── */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 Dicas e Boas Práticas
            </h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>
                • Sempre verifique a identidade do paciente antes de dispensar
              </li>
              <li>• Registre observações detalhadas sobre cada dispensação</li>
              <li>
                • Para dispensações parciais, oriente o paciente sobre o retorno
              </li>
              <li>• Verifique o medicamento e a dosagem antes de registrar</li>
              <li>• Mantenha o sistema atualizado com todas as dispensações</li>
              <li>
                • Use o histórico para acompanhar o padrão de dispensações dos
                pacientes
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Contato e Suporte ── */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-amber-600 mt-0.5 flex-shrink-0"
          />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">
              ⚠️ Dúvidas e Suporte
            </h3>
            <p className="text-sm text-amber-800 mb-2">
              Se encontrar problemas ou tiver dúvidas sobre como usar o sistema,
              entre em contato com o administrador do sistema.
            </p>
            <p className="text-xs text-amber-700">
              Versão 1.0 - Sistema de Gestão de Dispensações de Farmácia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmaciaInformacoes;
