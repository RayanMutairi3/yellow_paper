import { useEffect } from "react";

export type ToastState = {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastProps = {
  toast: ToastState | null;
  onClose: () => void;
};

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;

    const timerId = window.setTimeout(onClose, 3200);

    return () => window.clearTimeout(timerId);
  }, [onClose, toast]);

  if (!toast) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 sm:right-1/2 sm:max-w-sm sm:translate-x-1/2">
      <div className="animate-toast-in flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white shadow-xl dark:bg-stone-100 dark:text-stone-950">
        <span>{toast.message}</span>
        {toast.actionLabel && toast.onAction ? (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              onClose();
            }}
            className="rounded-full bg-white/[0.15] px-3 py-2 text-xs transition active:scale-95 dark:bg-stone-950/10"
          >
            {toast.actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
