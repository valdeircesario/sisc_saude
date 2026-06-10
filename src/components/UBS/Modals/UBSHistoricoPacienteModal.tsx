import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "./UBSModalBase";

export const UBSHistoricoPacienteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedPaciente: any;
  historicoPaciente: any[];
  consultasPaciente: any[];
}> = ({
  isOpen,
  onClose,
  selectedPaciente,
  historicoPaciente,
  consultasPaciente,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Histórico Médico - ${selectedPaciente?.nome}`}
      size="xl"
    >
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Histórico Médico
          </h4>
          {historicoPaciente && historicoPaciente.length > 0 ? (
            <div className="space-y-4">
              {historicoPaciente.map((item: any) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-900">
                      {item.diagnostico}
                    </h5>
                    <span className="text-sm text-gray-500">
                      {format(new Date(item.dataConsulta), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Médico:</span>{" "}
                      {item.funcionario.nome} ({item.funcionario.funcao})
                    </p>
                    <p>
                      <span className="font-medium">UBS:</span>{" "}
                      {item.funcionario.ubs.nome}
                    </p>
                    <p>
                      <span className="font-medium">Laudo:</span> {item.laudo}
                    </p>
                    {item.doenca && (
                      <p>
                        <span className="font-medium">Doença:</span>{" "}
                        {item.doenca}
                      </p>
                    )}
                    {item.medicacao && (
                      <p>
                        <span className="font-medium">Medicação:</span>{" "}
                        {item.medicacao}
                      </p>
                    )}
                    {item.observacoes && (
                      <p>
                        <span className="font-medium">Observações:</span>{" "}
                        {item.observacoes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum histórico médico encontrado.
            </p>
          )}
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Consultas
          </h4>
          {consultasPaciente && consultasPaciente.length > 0 ? (
            <div className="space-y-4">
              {consultasPaciente.map((consulta: any) => (
                <div key={consulta.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-900">
                      {consulta.especialidade}
                    </h5>
                    <span className="text-sm text-gray-500">
                      {format(new Date(consulta.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Motivo:</span>{" "}
                      {consulta.motivo}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {consulta.status}
                    </p>
                    {consulta.dataAgendada && (
                      <p>
                        <span className="font-medium">Data Agendada:</span>{" "}
                        {format(
                          new Date(consulta.dataAgendada),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR },
                        )}
                      </p>
                    )}
                    {consulta.funcionario && (
                      <p>
                        <span className="font-medium">Médico:</span>{" "}
                        {consulta.funcionario.nome}
                      </p>
                    )}
                    {consulta.observacoes && (
                      <p>
                        <span className="font-medium">Observações:</span>{" "}
                        {consulta.observacoes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhuma consulta encontrada.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
