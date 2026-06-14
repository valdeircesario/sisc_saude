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
  Megaphone,
  FileText,
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
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all
                ${
                  !isCurrentMonth
                    ? "text-transparent pointer-events-none"
                    : isDisabled
                      ? "text-slate-300 bg-slate-50/50 cursor-not-allowed"
                      : isSelected
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20 scale-110 z-10"
                        : "text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:scale-105"
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
        <div className="flex w-full gap-1 mb-1" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div className="mt-4">{rows}</div>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Programação de Atendimento"
      size="xl"
    >
      <div className="space-y-8">
        {/* Patient & Campaign Header */}
        {selectedInscricao && (
          <div className="flex items-center gap-5 p-6 bg-slate-50 border border-slate-100 rounded-[28px]">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/10 flex-shrink-0">
              <User className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-none">Paciente Inscrito</p>
              <h4 className="text-lg font-black text-slate-900 mt-1.5 truncate">
                {selectedInscricao.nome}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                  <Megaphone className="w-2.5 h-2.5" /> {selectedCampanha?.titulo}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 1. CALENDÁRIO */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                    <CalendarIcon className="w-4.5 h-4.5 text-teal-600" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    1. Data da Ação
                  </h4>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-black text-slate-700 uppercase min-w-[80px] text-center">
                    {format(currentMonth, "MMM yyyy", { locale: ptBR })}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-[24px] border border-slate-100">
                <div className="flex w-full">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                    <div
                      key={d}
                      className="flex-1 text-center text-[9px] font-black text-slate-400 uppercase"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                {renderCalendar()}
              </div>
            </div>

            {/* 2. HORÁRIOS */}
            <div className="space-y-6 flex flex-col h-full">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                  <Clock className="w-4.5 h-4.5 text-teal-600" />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  2. Horário do Turno
                </h4>
              </div>

              {!selectedDate ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200 p-8 text-center">
                  <CalendarIcon className="w-10 h-10 text-slate-200 mb-3" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Aguardando seleção da data clínica<br />no calendário ao lado
                  </p>
                </div>
              ) : loadingAgendamentos ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm justify-center">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                      <div className="w-2.5 h-2.5 rounded-full bg-white border border-teal-200"></div> Livre
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-teal-600 uppercase">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div> Seleção
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-400 uppercase">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-100 border border-rose-200"></div> Reservado
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar p-1">
                    {timeSlots.map((slot) => {
                      const isOccupied = occupiedTimes.includes(slot);
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleTimeSelect(slot)}
                          className={`
                            py-3 rounded-xl text-[11px] font-black tracking-tighter transition-all border
                            ${isOccupied
                              ? "bg-rose-50 border-rose-100 text-rose-300 cursor-not-allowed"
                              : isSelected
                                ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-900/10 scale-105 z-10"
                                : "bg-white border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/30"
                            }
                          `}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DADOS ADICIONAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-500" /> Unidade / Local de Atendimento <span className="text-rose-500">*</span>
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
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                placeholder="Ex: Sala de Vacina, Unidade Móvel..."
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-teal-500" /> Observações Administrativas
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
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[18px] text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                placeholder="Notas internas ou lembretes..."
              />
            </div>
          </div>

          {(!selectedDate || !selectedTime) && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 animate-in fade-in duration-500">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-relaxed">
                Seleção Incompleta: Escolha uma data clínica e um horário disponível para habilitar o agendamento.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
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
              className="w-full sm:w-auto px-12 py-4 bg-teal-600 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
