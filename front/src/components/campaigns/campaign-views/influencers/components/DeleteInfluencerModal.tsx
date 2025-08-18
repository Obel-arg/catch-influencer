import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteInfluencerModalProps {
  isOpen: boolean;
  influencerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteInfluencerModal = ({ isOpen, influencerName, onConfirm, onCancel }: DeleteInfluencerModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Confirmar eliminación
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar a <strong>{influencerName}</strong> de esta campaña?
            <div className="mt-3 p-3 bg-gray-50 rounded-md border-l-4 border-red-200">
              <p className="text-sm text-gray-700 font-medium">
                Esta acción eliminará al influencer de la campaña y todos sus posts asociados.
              </p>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Esta acción no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Eliminar influencer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 