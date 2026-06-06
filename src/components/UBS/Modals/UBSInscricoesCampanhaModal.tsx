import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { Modal } from "./UBSModalBase";

export const UBSInscricoesCampanhaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedCampanha: any;
  inscricoesCampanha: any[];
  openAgendamentoCampanhaModal: (inscricao: any) => void;
}> = ({
  isOpen,
  onClose,
  selectedCampanha,
  inscricoesCampanha,
  openAgendamentoCampanhaModal,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inscrições - ${selectedCampanha?.titulo}`}
      size="xl"
    >
      {inscricoesCampanha && inscricoesCampanha.length > 0 ? (
        <div className="space-y-4">
          {inscricoesCampanha.map((inscricao: any) => (
            <div key={inscricao.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{inscricao.nome}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inscricao.status === "agendado"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {inscricao.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  <span className="font-medium">CPF:</span> {inscricao.cpf} |{" "}
                  <span className="font-medium">Telefone:</span>{" "}
                  {inscricao.telefone}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {inscricao.email}
                </p>
                {inscricao.idade && (
                  <p>
                    <span className="font-medium">Idade:</span>{" "}
                    {inscricao.idade}
                  </p>
                )}
                {inscricao.condicoesSaude && (
                  <p>
                    <span className="font-medium">Condições de Saúde:</span>{" "}
                    {inscricao.condicoesSaude}
                  </p>
                )}
                <p>
                  <span className="font-medium">Prioridade:</span>{" "}
                  {inscricao.prioridade} |{" "}
                  <span className="font-medium">Pontuação:</span>{" "}
                  {inscricao.pontuacao}
                </p>
                {inscricao.dataAgendada && (
                  <p>
                    <span className="font-medium">Agendado para:</span>{" "}
                    {format(new Date(inscricao.dataAgendada), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                    {inscricao.horaAgendada && ` às ${inscricao.horaAgendada}`}
                  </p>
                )}
                {inscricao.localAtendimento && (
                  <p>
                    <span className="font-medium">Local:</span>{" "}
                    {inscricao.localAtendimento}
                  </p>
                )}
                {inscricao.observacoes && (
                  <p>
                    <span className="font-medium">Observações:</span>{" "}
                    {inscricao.observacoes}
                  </p>
                )}
              </div>
              {inscricao.status === "inscrito" && (
                <button
                  onClick={() => openAgendamentoCampanhaModal(inscricao)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" /> Agendar
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          Nenhuma inscrição encontrada.
        </p>
      )}
    </Modal>
  );
};
