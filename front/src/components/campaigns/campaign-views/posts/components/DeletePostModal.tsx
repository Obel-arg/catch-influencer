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

interface DeletePostModalProps {
  isOpen: boolean;
  postCaption: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeletePostModal = ({ isOpen, postCaption, onConfirm, onCancel }: DeletePostModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Confirmar eliminación
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar este post?
            {postCaption && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md border-l-4 border-red-200">
                <p className="text-sm text-gray-700 font-medium">
                  "{postCaption.substring(0, 100)}
                  {postCaption.length > 100 ? '...' : ''}"
                </p>
              </div>
            )}
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
            Eliminar post
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 