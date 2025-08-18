"use client";

import { FiBell } from 'react-icons/fi';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  read: boolean;
}

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {/* <FiBell className="h-5 w-5" /> */}
          {/* {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center rounded-full"
            >
              {unreadCount}
            </Badge>
          )} */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">Notificaciones</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>
          <Separator className="mb-2" />
          <div className="flex flex-col space-y-2">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                className={cn(
                  "flex flex-col items-start p-2",
                  !notification.read && "bg-blue-50 dark:bg-blue-900"
                )}
              >
                <div className="flex items-center space-x-2">
                  <Badge className={getNotificationColor(notification.type)}>
                    {notification.type}
                  </Badge>
                  <span className="text-sm font-medium">
                    {notification.title}
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {notification.message}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {notification.createdAt.toLocaleTimeString()}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 