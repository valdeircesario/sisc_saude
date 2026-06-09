import React, { useState, useMemo, useEffect } from "react";
import { Modal } from "./UBSModalBase";
import { useQuery } from "react-query";
import { api } from "../../../services/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  parseISO,
  addDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";

const ajustarData = (dataStr: string) => {
  if (!dataStr) return new Date();
  const data = new Date(dataStr);
  return new Date(data.getTime() + data.getTimezoneOffset() * 60000);
};

export const UBSAgendamentoCampanhaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedInscricao: any;
  selectedCampanha: any;
  agendamentoCampanhaData: any;
  setAgendamentoCampanhaData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({
  isOpen,
  onClose,
  selectedInscricao,
  selectedCampanha,
  agendamentoCampanhaData,
  setAgendamentoCampanhaData,
  onSubmit,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sincroniza o estado local com o estado do form pai
  const selectedDate = agendamentoCampanhaData.dataAgendada
    ? parseISO(agendamentoCampanhaData.dataAgendada.split("T")[0])
    : null;
  const selectedTime = agendamentoCampanhaData.horaAgendada || null;

  // Busca as inscrições já existentes para esta campanha para bloquear horários
  const { data: inscricoesExistentes, isLoading: loadingAgendamentos } =
    useQuery(
      ["campanha-agendamentos-horarios", selectedCampanha?.id],
      () =>
        api
          .get(`/ubs/campanhas/${selectedCampanha?.id}/inscricoes`)
          .then((res) => res.data),
      { enabled: !!selectedCampanha?.id && isOpen },
    );

  // Gera os horários das 08:00 às 17:00 de 10 em 10 minutos
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let h = 8; h <= 17; h++) {
      for (let m = 0; m < 60; m += 10) {
        slots.push(
          `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
        );
      }
    }
    return slots;
  }, []);

  // Filtra os horários que já estão ocupados na data selecionada
  const occupiedTimes = useMemo(() => {
    const lista = Array.isArray(inscricoesExistentes) ? inscricoesExistentes : [];
    if (!lista || !selectedDate) return [];

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    return lista
      .filter((a: any) => {
        // Ignora a própria inscrição caso o paciente já esteja agendado e estejamos editando
        if (selectedInscricao && a.id === selectedInscricao.id) return false;

        if (
          !a.dataAgendada ||
          a.status === "cancelada" ||
          a.status === "cancelado" ||
          a.status === "pendente"
        )
          return false;
        // Pega a data exata como salva no banco para evitar saltos de fuso horário na comparação
        const aDate =
          typeof a.dataAgendada === "string" && a.dataAgendada.includes("T")
            ? a.dataAgendada.split("T")[0]
            : format(ajustarData(a.dataAgendada), "yyyy-MM-dd");
        return aDate === dateStr;
      })
      .map((a: any) => {
        if (!a.horaAgendada) return "";
        // Garante que o formato extraído seja sempre HH:mm (Ex: 08:00) para cruzar perfeitamente com os botões
        const parts = a.horaAgendada.split(":");
        if (parts.length >= 2) return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
        return a.horaAgendada.substring(0, 5);
      });
  }, [inscricoesExistentes, selectedDate, selectedInscricao]);

  const handleDateSelect = (day: Date) => {
    setAgendamentoCampanhaData({
      ...agendamentoCampanhaData,
      dataAgendada: format(day, "yyyy-MM-dd"),
      horaAgendada: "", // Reseta o horário ao trocar de dia
    });
  };

  const handleTimeSelect = (time: string) => {
    setAgendamentoCampanhaData({
      ...agendamentoCampanhaData,
      horaAgendada: time,
    });
  };

  // Funções de navegação do calendário
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Renderiza a grade de dias do calendário
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    const campanhaStart = selectedCampanha?.dataIni
      ? parseISO(selectedCampanha.dataIni)
      : null;
    const campanhaEnd = selectedCampanha?.dataFim
      ? parseISO(selectedCampanha.dataFim)
      : null;
    const today = startOfDay(new Date());

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;

        // Regras para desabilitar o dia (passado ou fora do período da campanha)
        let isDisabled = false;
        if (isBefore(day, today)) isDisabled = true;
        if (campanhaStart && isBefore(day, startOfDay(campanhaStart)))
          isDisabled = true;
        if (campanhaEnd && isAfter(day, endOfDay(campanhaEnd)))
          isDisabled = true;

        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div className="flex-1 flex justify-center" key={day.toString()}>
            <button
              type="button"
              disabled={isDisabled || !isCurrentMonth}
              onClick={() => handleDateSelect(cloneDay)}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all
                ${
                  !isCurrentMonth
                    ? "text-transparent pointer-events-none"
                    : isDisabled
                      ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                      : isSelected
                        ? "bg-blue-600 text-white font-bold shadow-md transform scale-105"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                }
              `}
            >
              {formattedDate}
            </button>
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex w-full mt-2" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Atendimento"
      size="xl"
    >
      {selectedInscricao && (
        <div className="flex items-center gap-4 bg-blue-50/50 rounded-2xl p-4 mb-6 border border-blue-100">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600 tracking-wide uppercase">
              Paciente Selecionado
            </p>
            <h4 className="text-xl font-bold text-gray-900">
              {selectedInscricao.nome}
            </h4>
            <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
              <CalendarIcon className="w-3.5 h-3.5" /> Campanha:{" "}
              {selectedCampanha?.titulo}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLUNA ESQUERDA - CALENDÁRIO */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                1. Selecione a Data
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-gray-700 w-32 text-center capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex w-full mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div
                  key={d}
                  className="flex-1 text-center text-xs font-bold text-gray-400 uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {renderCalendar()}
          </div>

          {/* COLUNA DIREITA - HORÁRIOS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm h-full">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              2. Selecione o Horário
            </h3>

            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm text-center px-4">
                  Selecione uma data no calendário ao lado para ver os horários
                  disponíveis.
                </p>
              </div>
            ) : loadingAgendamentos ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>{" "}
                    Disponível
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>{" "}
                    Selecionado
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>{" "}
                    Ocupado
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {timeSlots.map((slot) => {
                    const isOccupied = occupiedTimes.includes(slot);
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => handleTimeSelect(slot)}
                        className={`py-2 rounded-lg text-sm transition-all border
                          ${
                            isOccupied
                              ? "bg-red-50 border-red-200 text-red-500 cursor-not-allowed line-through"
                              : isSelected
                                ? "bg-blue-600 border-blue-600 text-white font-bold shadow-md"
                                : "bg-white border-blue-100 text-blue-700 hover:bg-blue-50 font-medium"
                          }
                        `}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* DADOS ADICIONAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" /> Local de Atendimento
              *
            </label>
            <input
              type="text"
              value={agendamentoCampanhaData.localAtendimento}
              onChange={(e) =>
                setAgendamentoCampanhaData({
                  ...agendamentoCampanhaData,
                  localAtendimento: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Ex: Sala 1, Auditório, etc."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Observações
            </label>
            <input
              type="text"
              value={agendamentoCampanhaData.observacoes}
              onChange={(e) =>
                setAgendamentoCampanhaData({
                  ...agendamentoCampanhaData,
                  observacoes: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Observações sobre o atendimento"
            />
          </div>
        </div>

        {(!selectedDate || !selectedTime) && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
              Por favor, selecione uma data e um horário no calendário acima
              para prosseguir.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              !selectedDate ||
              !selectedTime ||
              !agendamentoCampanhaData.localAtendimento
            }
            className="px-6 py-2.5 rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Agendar
          </button>
        </div>
      </form>
    </Modal>
  );
};
