'use client';

import Link from 'next/link';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useTimedConfirm } from '../hooks/useTimedConfirm';
import { NotificationItem } from './NotificationItem';

function SkeletonItem() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.05]">
      <div className="w-9 h-9 rounded-xl bg-white/[0.05] animate-pulse shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex justify-between gap-4">
          <div className="h-2.5 bg-white/[0.05] rounded-full animate-pulse w-1/2" />
          <div className="h-2 bg-white/[0.04] rounded-full animate-pulse w-8" />
        </div>
        <div className="h-8 bg-white/[0.04] rounded-lg animate-pulse w-full" />
        <div className="h-2 bg-white/[0.03] rounded-full animate-pulse w-1/3" />
      </div>
    </div>
  );
}

export function NotificationPanel() {
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();
    const { confirming: confirmingClear, request: handleClearAllClick, confirm: handleClearAllConfirm, cancel: handleClearAllCancel } = useTimedConfirm(deleteAllNotifications);

  return (
    <div className="w-[420px] bg-[#0c1018] border border-white/[0.08] rounded-2xl
                    shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(139,92,246,0.06)]
                    overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/15 ring-1 ring-violet-500/25">
            <Bell size={13} className="text-violet-400" />
          </div>
          <span className="text-[13px] font-semibold text-white/90 tracking-tight">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full
                             bg-violet-500 text-[10px] font-bold text-white tabular-nums">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium
                         text-white/40 hover:text-violet-300 hover:bg-violet-500/10
                         transition-all duration-150 border border-transparent hover:border-violet-500/20"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            confirmingClear ? (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-white/40 px-1">Clear all?</span>
                <button
                  onClick={handleClearAllCancel}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-white/40
                             hover:text-white/70 hover:bg-white/[0.06]
                             transition-all duration-150 border border-transparent hover:border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllConfirm}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium
                             text-red-400 bg-red-500/10 border border-red-500/20
                             hover:bg-red-500/20 transition-all duration-150"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button
                onClick={handleClearAllClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium
                           text-white/40 hover:text-red-400 hover:bg-red-500/10
                           transition-all duration-150 border border-transparent hover:border-red-500/20"
              >
                <Trash2 size={12} />
                Clear all
              </button>
            )
          )}
        </div>
      </div>

      <div className="h-px bg-white/[0.06] mx-4" />

      {/* Body */}
      <div className="max-h-[520px] overflow-y-auto overscroll-contain
                      scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {isLoading ? (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07]">
              <Bell size={24} className="text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-medium text-white/40">All caught up</p>
              <p className="text-[11px] text-white/20 mt-0.5">No notifications yet</p>
            </div>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isLast={index === notifications.length - 1}
              onClick={() => {
                if (!notification.isRead) {
                  markAsRead(notification.id);
                }
              }}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {!isLoading && notifications.length > 0 && (
        <>
          <div className="h-px bg-white/[0.06] mx-4" />
          <div className="px-4 py-3">
            <Link
              href="/notifications"
              className="flex items-center justify-center w-full py-2 rounded-lg
                         text-[11px] font-medium text-white/40 hover:text-violet-300
                         hover:bg-violet-500/[0.08] border border-transparent hover:border-violet-500/15
                         transition-all duration-150"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
