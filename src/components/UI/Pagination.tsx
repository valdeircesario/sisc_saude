import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E4EDF7] bg-[#F8FAFD] rounded-b-xl gap-4">
      <div className="text-xs font-medium text-[#8FA8C4]">
        Mostrando <span className="text-[#3A5B82]">{startItem}</span> a{" "}
        <span className="text-[#3A5B82]">{endItem}</span> de{" "}
        <span className="text-[#3A5B82]">{totalItems}</span> registros
      </div>
      
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg border transition-all ${
            currentPage === 1
              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
              : "bg-white text-[#5C7A9B] border-[#D9E4F0] hover:border-[#1A3F72] hover:text-[#1A3F72] shadow-sm"
          }`}
          title="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Mostrar apenas algumas páginas se houver muitas
            if (
              totalPages > 7 &&
              page !== 1 &&
              page !== totalPages &&
              Math.abs(page - currentPage) > 1
            ) {
              if (page === 2 || page === totalPages - 1) {
                return <span key={page} className="px-1 text-[#8FA8C4]">...</span>;
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? "bg-[#1A3F72] text-white shadow-md shadow-[#1A3F72]/20"
                    : "bg-white text-[#5C7A9B] border border-[#D9E4F0] hover:border-[#1A3F72] hover:text-[#1A3F72]"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg border transition-all ${
            currentPage === totalPages
              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
              : "bg-white text-[#5C7A9B] border-[#D9E4F0] hover:border-[#1A3F72] hover:text-[#1A3F72] shadow-sm"
          }`}
          title="Próximo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
