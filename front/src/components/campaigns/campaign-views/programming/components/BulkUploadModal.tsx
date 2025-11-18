"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { campaignScheduleService, ParsedScheduleItem } from '@/lib/services/campaign/campaign-schedule.service';
import { toast } from 'sonner';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSuccess: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedScheduleItem[] | null>(null);
  const [summary, setSummary] = useState<{ total: number; valid: number; invalid: number; validPercentage: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Formato de archivo inválido. Solo se permiten archivos Excel (.xls, .xlsx)');
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Tamaño máximo: 10MB');
      return;
    }

    setFile(selectedFile);

    // Upload and parse file
    setIsUploading(true);
    try {
      const result = await campaignScheduleService.bulkUploadSchedules(selectedFile, campaignId);
      setParsedData(result.parsed);
      setSummary(result.summary);

      toast.success(`Archivo procesado: ${result.summary.valid} válidos, ${result.summary.invalid} inválidos`);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Error al procesar el archivo');
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData) return;

    const validSchedules = parsedData
      .filter(item => item.isValid)
      .map(item => item.data);

    if (validSchedules.length === 0) {
      toast.error('No hay contenidos válidos para importar');
      return;
    }

    setIsConfirming(true);
    try {
      const result = await campaignScheduleService.confirmBulkUpload(campaignId, validSchedules);

      toast.success(`Se importaron ${result.created.length} contenidos exitosamente`);

      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} contenidos no pudieron ser importados`);
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error confirming import:', error);
      toast.error(error.message || 'Error al confirmar la importación');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setSummary(null);
    setIsUploading(false);
    setIsConfirming(false);
    onClose();
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/plantilla-contenidos.xlsx';
    link.download = 'plantilla-contenidos.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Plantilla descargada');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold">Importar Contenidos desde Excel</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Descargue la plantilla de Excel haciendo clic en el botón inferior</li>
                  <li>Complete los campos obligatorios: Título, Fecha, Influencer, Plataforma y Tipo de Contenido</li>
                  <li>Los nombres de influencers deben coincidir exactamente con los registrados en la campaña</li>
                  <li>Suba el archivo completado y revise la vista previa antes de confirmar</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Download Template Button */}
          <div className="mb-6">
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Plantilla Excel
            </Button>
          </div>

          {/* File Upload Area */}
          {!parsedData && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileInput}
                className="hidden"
              />

              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />

              {file && !isUploading ? (
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : isUploading ? (
                <div>
                  <p className="text-lg font-medium text-gray-700">Procesando archivo...</p>
                  <div className="mt-4 w-64 mx-auto bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Arrastra tu archivo Excel aquí
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    o haz clic para seleccionar
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="default"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar Archivo
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Formatos permitidos: .xls, .xlsx (máx. 10MB)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Summary Statistics */}
          {summary && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Válidos</p>
                <p className="text-2xl font-bold text-green-700">{summary.valid}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 mb-1">Inválidos</p>
                <p className="text-2xl font-bold text-red-700">{summary.invalid}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">% Válidos</p>
                <p className="text-2xl font-bold text-blue-700">{summary.validPercentage}%</p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedData && (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Fila</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Título</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Influencer</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Plataforma</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Tipo</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Errores</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedData.map((item, index) => (
                      <tr
                        key={index}
                        className={item.isValid ? 'bg-white' : 'bg-red-50'}
                      >
                        <td className="px-4 py-3 text-gray-600">{item.row}</td>
                        <td className="px-4 py-3">
                          {item.isValid ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </td>
                        <td className="px-4 py-3">{item.data.title || '-'}</td>
                        <td className="px-4 py-3">
                          {item.data.start_date
                            ? new Date(item.data.start_date).toLocaleDateString('es-ES')
                            : '-'}
                        </td>
                        <td className="px-4 py-3">{item.data.influencer_name || '-'}</td>
                        <td className="px-4 py-3 capitalize">{item.data.platform || '-'}</td>
                        <td className="px-4 py-3 capitalize">{item.data.content_type || '-'}</td>
                        <td className="px-4 py-3">
                          {item.errors.length > 0 ? (
                            <div className="space-y-1">
                              {item.errors.map((error, idx) => (
                                <p key={idx} className="text-xs text-red-600">
                                  {error.field}: {error.message}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 text-xs">Sin errores</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div>
            {parsedData && summary && (
              <p className="text-sm text-gray-600">
                Se importarán <strong>{summary.valid}</strong> contenidos válidos.
                {summary.invalid > 0 && (
                  <span className="text-red-600 ml-1">
                    ({summary.invalid} serán omitidos)
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleClose} variant="outline">
              Cancelar
            </Button>
            {parsedData && (
              <Button
                onClick={handleConfirmImport}
                disabled={isConfirming || summary?.valid === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isConfirming ? (
                  <>Importando...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirmar Importación
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
