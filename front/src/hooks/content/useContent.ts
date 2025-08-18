import { useState, useCallback } from "react";
import { contentService } from "@/lib/services/content";
import { Content, ContentTemplate, ContentSchedule, CreateContentDto, UpdateContentDto, ContentFilters } from "@/types/content";
import { useToast } from "../common/useToast";

export const useContent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getContents = useCallback(async (filters?: ContentFilters): Promise<Content[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.getContents(filters);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener los contenidos";
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

  const getContentById = useCallback(async (id: string): Promise<Content | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.getContentById(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al obtener el contenido";
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

  const createContent = useCallback(async (content: CreateContentDto): Promise<Content | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.createContent(content);
      showToast({
        title: "Éxito",
        description: "Contenido creado correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear el contenido";
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

  const updateContent = useCallback(async (id: string, content: UpdateContentDto): Promise<Content | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.updateContent(id, content);
      showToast({
        title: "Éxito",
        description: "Contenido actualizado correctamente",
        status: "success"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar el contenido";
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

  const deleteContent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await contentService.deleteContent(id);
      showToast({
        title: "Éxito",
        description: "Contenido eliminado correctamente",
        status: "success"
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar el contenido";
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

  const getTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.getTemplates();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener plantillas");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<ContentTemplate, "id" | "createdAt" | "updatedAt">) => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.createTemplate(template);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear plantilla");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, template: Partial<ContentTemplate>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.updateTemplate(id, template);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar plantilla");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await contentService.deleteTemplate(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar plantilla");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.getSchedules();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener programaciones");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (schedule: Omit<ContentSchedule, "id" | "createdAt" | "updatedAt">) => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.createSchedule(schedule);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear programación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (id: string, schedule: Partial<ContentSchedule>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentService.updateSchedule(id, schedule);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar programación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await contentService.deleteSchedule(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar programación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getContents,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}; 