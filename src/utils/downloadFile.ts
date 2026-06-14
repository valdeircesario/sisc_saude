import { api } from "../services/api";
import { toast } from "react-toastify";

export const downloadExamePDF = async (filename: string) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await api.get(`/exames/download/${filename}`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Erro ao baixar arquivo:", error);
    
    // Se for um blob, precisamos ler o conteúdo para ver a mensagem de erro
    if (error.response?.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result as string);
          toast.error(errorData.message || "Erro ao baixar o arquivo.");
        } catch (e) {
          toast.error("Erro ao baixar o arquivo.");
        }
      };
      reader.readAsText(error.response.data);
    } else {
      toast.error(error.response?.data?.message || "Erro ao baixar o arquivo. Verifique sua conexão.");
    }
  }
};
