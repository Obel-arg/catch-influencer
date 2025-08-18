import { useState, useCallback } from "react";
import { reportService } from "@/lib/services/report";
import { Report, ReportTemplate, ReportSchedule, CreateReportDto, CreateReportTemplateDto, CreateReportScheduleDto } from "@/types/report";
import { PaginationParams } from "@/types/common";
import { useToast } from "../common/useToast";

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getReports = useCallback(async (params?: PaginationParams): Promise<Report[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReports(params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener reportes";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getReportById = useCallback(async (id: string): Promise<Report | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReportById(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener reporte";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createReport = useCallback(async (data: CreateReportDto): Promise<Report | null> => {
    try {
      setLoading(true);
      setError(null);
      const report = await reportService.createReport(data);
      showToast({
        title: "Éxito",
        description: "Reporte creado correctamente",
        status: "success"
      });
      return report;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear reporte";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getTemplates = useCallback(async (): Promise<ReportTemplate[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getTemplates();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener plantillas";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createTemplate = useCallback(async (template: CreateReportTemplateDto): Promise<ReportTemplate | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.createTemplate(template);
      showToast({
        title: "Éxito",
        description: "Plantilla creada correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear plantilla";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getSchedules = useCallback(async (): Promise<ReportSchedule[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getSchedules();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener programaciones";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createSchedule = useCallback(async (schedule: CreateReportScheduleDto): Promise<ReportSchedule | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.createSchedule(schedule);
      showToast({
        title: "Éxito",
        description: "Programación creada correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear programación";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateSchedule = useCallback(async (id: string, schedule: Partial<ReportSchedule>): Promise<ReportSchedule | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.updateSchedule(id, schedule);
      showToast({
        title: "Éxito",
        description: "Programación actualizada correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar programación";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteSchedule = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await reportService.deleteSchedule(id);
      showToast({
        title: "Éxito",
        description: "Programación eliminada correctamente",
        status: "success"
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar programación";
      setError(message);
      showToast({
        title: "Error",
        description: message,
        status: "error"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    loading,
    error,
    getReports,
    getReportById,
    createReport,
    getTemplates,
    createTemplate,
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}; 