
'use client';

import { useState } from 'react';
import { useUser, useCollection } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell, CheckCheck, CircleAlert, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { useMemo } from 'react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  type?: 'warning' | 'reminder' | 'update';
}

const notificationIcons = {
  warning: <CircleAlert className="h-5 w-5 text-red-500" />,
  reminder: <CalendarClock className="h-5 w-5 text-blue-500" />,
  update: <CheckCheck className="h-5 w-5 text-green-500" />,
  default: <Bell className="h-5 w-5 text-gray-500" />,
};

export function Notifications() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const notificationsQuery = useMemo(() => {
    if (!user) return null;
    return collection(db, `users/${user.uid}/notifications`);
  }, [user]);

  const { data: notifications, error } = useCollection<Notification>(
    notificationsQuery,
    { orderBy: ['createdAt', 'desc'] }
  );

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    const notificationRef = doc(
      db,
      `users/${user.uid}/notifications`,
      id
    );
    const payload = { read: true };

    try {
      const batch = writeBatch(db);
      batch.update(notificationRef, payload);
      await batch.commit();
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: notificationRef.path,
        operation: 'update',
        requestResourceData: payload,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !notifications || unreadCount === 0) return;
    const batch = writeBatch(db);
    notifications.forEach(notification => {
      if (!notification.read) {
        const ref = doc(
          db,
          `users/${user.uid}/notifications`,
          notification.id
        );
        batch.update(ref, { read: true });
      }
    });

    try {
      await batch.commit();
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}/notifications`,
        operation: 'update',
        requestResourceData: { read: true }, // This is a representative payload
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  if (!user) {
    return null;
  }
  if (error) {
    // You can render a small error indicator if you want
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-96">
          {notifications && notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="mt-1">
                  {notificationIcons[notification.type || 'default']}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(
                      new Date(notification.createdAt.seconds * 1000),
                      { addSuffix: true }
                    )}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No new notifications.
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
