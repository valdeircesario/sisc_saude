import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, FileText, Shield, Calendar, Mail, Phone, MapPin, Edit } from "lucide-react";

interface PacientePerfilTabProps {
  perfil: any;
  openEditarPerfilModal: () => void;
  SectionHeader: React.FC<{ icon: any; title: string; color?: string }>;
}

export const PacientePerfilTab: React.FC<PacientePerfilTabProps> = ({
  perfil,
  openEditarPerfilModal,
  SectionHeader,
}) => {
  if (!perfil) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader icon={User} title="Meu Perfil" />
          <button
            onClick={openEditarPerfilModal}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:-translate-y-0.5 transition-all duration-150"
          >
            <Edit className="h-4 w-4" /> Editar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: User,
              label: "Nome Completo",
              value: perfil.nome,
              span: false,
            },
            {
              icon: FileText,
              label: "CPF",
              value: perfil.cpf,
              span: false,
            },
            {
              icon: Shield,
              label: "CNS",
              value: perfil.cns,
              span: false,
            },
            {
              icon: Calendar,
              label: "Data de Nascimento",
              value: format(new Date(perfil.nascimento), "dd/MM/yyyy", {
                locale: ptBR,
              }),
              span: false,
            },
            {
              icon: Mail,
              label: "Email",
              value: perfil.email,
              span: false,
            },
            {
              icon: Phone,
              label: "Telefone",
              value: perfil.telefone,
              span: false,
            },
            {
              icon: MapPin,
              label: "Endereço",
              value: perfil.endereco,
              span: true,
            },
          ].map(({ icon: Icon, label, value, span }) => (
            <div
              key={label}
              className={`rounded-xl border border-gray-100 bg-slate-50 p-4 ${
                span ? "sm:col-span-2 lg:col-span-3" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-3.5 w-3.5 text-teal-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {label}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-800 break-words">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
