type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 h-full w-full bg-stone-950/55 backdrop-blur-[3px] transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onCancel}
        aria-label={cancelLabel}
      />

      <section
        className={`absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] rounded-[1.5rem] bg-[#fffaf0] p-4 text-right shadow-2xl transition duration-200 dark:bg-stone-900 sm:right-1/2 sm:max-w-sm sm:translate-x-1/2 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
          {title}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-7 text-stone-600 dark:text-stone-300">
          {description}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 rounded-2xl bg-stone-100 px-4 text-sm font-bold text-stone-700 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 rounded-2xl bg-red-600 px-4 text-sm font-bold text-white transition active:scale-[0.98] dark:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
