"use client"

import { useState } from "react"
import { Bell, Trash2, CheckCheck } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Datos de ejemplo para las notificaciones - Array vacío por defecto
const notificationsData: any[] = []

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(notificationsData)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {unreadCount} nuevas
              </span>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="max-h-[400px] overflow-y-auto bg-white">
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <button
                    className={cn(
                      "w-full text-left p-4 hover:bg-gray-50 transition-colors bg-white border-l-4",
                      !notification.read 
                        ? "border-l-blue-500 bg-blue-50/30" 
                        : "border-l-transparent"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.read && (
                        <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                      <div className={cn("flex-1", notification.read && "pl-5")}>
                        <p className={cn(
                          "text-sm leading-5", 
                          !notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 leading-5">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </button>
                  {index < notifications.length - 1 && (
                    <Separator className="bg-gray-100" />
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="p-12 text-center text-gray-500 bg-white">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell size={24} className="text-gray-400" />
              </div>
              <p className="font-medium text-gray-700 text-sm">No tienes notificaciones</p>
              <p className="text-xs text-gray-500 mt-1">Aquí aparecerán tus nuevas notificaciones</p>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 font-medium flex items-center gap-1"
                disabled={unreadCount === 0}
              >
                <CheckCheck size={14} />
                Marcar todas como leídas
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                title="Eliminar todas las notificaciones"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
} 