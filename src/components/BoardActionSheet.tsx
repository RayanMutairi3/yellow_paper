import { useEffect, useRef, useState } from "react";
import type {
  BoardDraft,
  Note,
  NoteColor,
  NoteDraft,
  Section,
  SectionDraft,
} from "../types/note";

export type SheetMode = "menu" | "note" | "section" | "board";

const colorOptions: Array<{ label: string; value: NoteColor; className: string }> =
  [
    { label: "أصفر", value: "yellow", className: "bg-[#fff2a8]" },
    { label: "وردي", value: "pink", className: "bg-[#ffd4df]" },
    { label: "أخضر", value: "green", className: "bg-[#d9f3c7]" },
    { label: "أزرق", value: "blue", className: "bg-[#d7ecff]" },
    { label: "بنفسجي", value: "purple", className: "bg-[#e7dcff]" },
  ];

type BoardActionSheetProps = {
  isOpen: boolean;
  mode: SheetMode;
  sections: Section[];
  initialNoteSectionId?: string | null;
  editingNote: Note | null;
  editingSection: Section | null;
  onClose: () => void;
  onSelectMode: (mode: SheetMode) => void;
  onSaveBoard: (draft: BoardDraft) => void;
  onSaveNote: (draft: NoteDraft) => void;
  onSaveSection: (draft: SectionDraft) => void;
  onToggleNotePin: (id: string) => void;
  onToggleNoteComplete: (id: string) => void;
  onConvertNoteToTask: (id: string) => void;
  onDeleteNote: (id: string) => void;
};

const getDefaultNoteDraft = (
  sections: Section[],
  initialNoteSectionId?: string | null,
): NoteDraft => ({
  text: "",
  color: "yellow",
  sectionId:
    sections.find((section) => section.id === initialNoteSectionId)?.id ??
    sections[0]?.id ??
    "",
});

function normalizeArabicCopy(text: string) {
  return text.replace(/الورقه الصفراء/g, "الورقة الصفراء");
}

export function BoardActionSheet({
  isOpen,
  mode,
  sections,
  initialNoteSectionId,
  editingNote,
  editingSection,
  onClose,
  onSelectMode,
  onSaveBoard,
  onSaveNote,
  onSaveSection,
  onToggleNotePin,
  onToggleNoteComplete,
  onConvertNoteToTask,
  onDeleteNote,
}: BoardActionSheetProps) {
  const [noteDraft, setNoteDraft] = useState<NoteDraft>(() =>
    getDefaultNoteDraft(sections, initialNoteSectionId),
  );
  const [sectionDraft, setSectionDraft] = useState<SectionDraft>({ title: "" });
  const [boardDraft, setBoardDraft] = useState<BoardDraft>({ title: "" });

  // Two-state animation: isMounted keeps the DOM alive during close animation,
  // isVisible drives the CSS transition (needs a frame gap after mount to trigger).
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Cancel any pending unmount
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      // 1. Mount
      setIsMounted(true);
      // 2. Next frame → trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      // 1. Trigger close transition
      setIsVisible(false);
      // 2. Unmount after transition finishes (220ms + tiny buffer)
      closeTimerRef.current = setTimeout(() => {
        setIsMounted(false);
      }, 260);
    }

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "note") {
      setNoteDraft(
        editingNote
          ? {
              text: editingNote.text,
              color: editingNote.color,
              sectionId: editingNote.sectionId,
            }
          : getDefaultNoteDraft(sections, initialNoteSectionId),
      );
    }

    if (mode === "section") {
      setSectionDraft({ title: editingSection?.title ?? "" });
    }

    if (mode === "board") {
      setBoardDraft({ title: "" });
    }
  }, [editingNote, editingSection, initialNoteSectionId, isOpen, mode, sections]);

  if (!isMounted) return null;

  const canSaveNote = noteDraft.text.trim().length > 0 && Boolean(noteDraft.sectionId);
  const canSaveSection = sectionDraft.title.trim().length > 0;
  const canSaveBoard = boardDraft.title.trim().length > 0;
  const selectedSection = sections.find(
    (section) => section.id === noteDraft.sectionId,
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      aria-hidden={!isVisible}
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute inset-0 h-full w-full bg-stone-950/55 backdrop-blur-[3px]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 220ms ease-out",
        }}
      />

      {/* Centered dialog */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label="إضافة على اللوحة"
        className="relative flex w-[calc(100%-2rem)] max-w-md flex-col rounded-[1.75rem] bg-[#fffaf0] shadow-2xl dark:bg-stone-900"
        style={{
          maxHeight: "min(90svh, 42rem)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          transition: "opacity 220ms ease-out, transform 220ms ease-out",
        }}
      >
        {/* Header — always visible, never scrolls away */}
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-4">
          <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
            {mode === "menu"
              ? "إضافة"
              : mode === "board"
                ? "لوحة جديدة"
                : mode === "note"
                  ? editingNote
                    ? "تعديل الورقة"
                    : "ورقة جديدة"
                  : editingSection
                    ? "تعديل القسم"
                    : "قسم جديد"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-100 text-xl text-stone-700 transition active:scale-95 dark:bg-stone-800 dark:text-stone-200"
            aria-label="إلغاء"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-4">

          {/* ── MENU mode ── */}
          {mode === "menu" ? (
            <div className="grid gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSelectMode("section")}
                className="flex min-h-14 items-center justify-between rounded-2xl bg-stone-950 px-4 text-right text-sm font-bold text-white transition active:scale-[0.98] dark:bg-stone-100 dark:text-stone-950"
              >
                <span>إضافة قسم</span>
                <span className="text-xl leading-none">□</span>
              </button>
            </div>
          ) : null}

          {/* ── BOARD mode ── */}
          {mode === "board" ? (
            <div className="flex flex-col gap-4 pt-1">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
                  اسم اللوحة
                </span>
                <input
                  value={boardDraft.title}
                  onChange={(event) =>
                    setBoardDraft({ title: event.target.value.slice(0, 50) })
                  }
                  className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200/70 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
                  placeholder="مثال: مشروع جديد"
                  maxLength={50}
                  autoFocus
                />
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="button"
                  disabled={!canSaveBoard}
                  onClick={() =>
                    canSaveBoard &&
                    onSaveBoard({ title: boardDraft.title.trim() })
                  }
                  className="h-12 rounded-2xl bg-stone-950 px-5 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-stone-100 dark:text-stone-950"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 rounded-2xl bg-stone-100 px-5 text-sm font-bold text-stone-700 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : null}

          {/* ── SECTION mode ── */}
          {mode === "section" ? (
            <div className="flex flex-col gap-4 pt-1">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
                  عنوان القسم
                </span>
                <input
                  value={sectionDraft.title}
                  onChange={(event) =>
                    setSectionDraft({ title: event.target.value.slice(0, 60) })
                  }
                  className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200/70 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
                  placeholder="مثال: Graphics"
                  maxLength={60}
                  autoFocus
                />
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="button"
                  disabled={!canSaveSection}
                  onClick={() =>
                    canSaveSection &&
                    onSaveSection({ title: sectionDraft.title.trim() })
                  }
                  className="h-12 rounded-2xl bg-stone-950 px-5 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-stone-100 dark:text-stone-950"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 rounded-2xl bg-stone-100 px-5 text-sm font-bold text-stone-700 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : null}

          {/* ── NOTE mode ── */}
          {mode === "note" ? (
            <div className="flex flex-col gap-4 pt-1">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
                  نص الورقة
                </span>
                <textarea
                  value={noteDraft.text}
                  onChange={(event) =>
                    setNoteDraft((currentDraft) => ({
                      ...currentDraft,
                      text: event.target.value.slice(0, 260),
                    }))
                  }
                  className="min-h-24 w-full resize-none rounded-2xl border border-stone-200 bg-white p-3.5 text-base leading-7 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200/70 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
                  placeholder="اكتب الورقة هنا..."
                  maxLength={260}
                />
              </label>

              <div>
                <p className="mb-2 text-sm font-bold text-stone-700 dark:text-stone-200">
                  القسم
                </p>
                {!editingNote && initialNoteSectionId ? (
                  <div className="rounded-2xl bg-yellow-100 px-4 py-3 text-sm font-bold text-stone-800 ring-1 ring-yellow-200 dark:bg-yellow-300/15 dark:text-yellow-100 dark:ring-yellow-200/20">
                    ستضاف إلى: {normalizeArabicCopy(selectedSection?.title ?? "")}
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {sections.map((section) => {
                      const isSelected = noteDraft.sectionId === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() =>
                            setNoteDraft((currentDraft) => ({
                              ...currentDraft,
                              sectionId: section.id,
                            }))
                          }
                          className={`h-10 shrink-0 rounded-full px-4 text-xs font-bold transition active:scale-95 ${
                            isSelected
                              ? "bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950"
                              : "bg-white text-stone-600 ring-1 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                          }`}
                        >
                          {normalizeArabicCopy(section.title)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-bold text-stone-700 dark:text-stone-200">
                  لون الورقة
                </p>
                <div className="flex gap-2">
                  {colorOptions.map((option) => {
                    const isSelected = noteDraft.color === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setNoteDraft((currentDraft) => ({
                            ...currentDraft,
                            color: option.value,
                          }))
                        }
                        className={`relative grid h-10 flex-1 place-items-center rounded-2xl border-2 transition active:scale-95 ${option.className} ${
                          isSelected
                            ? "scale-[1.04] border-stone-950 ring-2 ring-stone-950 ring-offset-2 ring-offset-[#fffaf0] dark:border-white dark:ring-white dark:ring-offset-stone-900"
                            : "border-white/70"
                        }`}
                        aria-label={`${option.label}${isSelected ? " محدد" : ""}`}
                        title={option.label}
                      >
                        {isSelected ? (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-stone-950 text-xs font-bold text-white shadow-sm dark:bg-white dark:text-stone-950">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {editingNote ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleNotePin(editingNote.id)}
                    className="h-11 rounded-2xl bg-white px-3 text-xs font-bold text-stone-700 ring-1 ring-stone-200 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                  >
                    {editingNote.pinned ? "إلغاء التثبيت" : "تثبيت"}
                  </button>
                  {editingNote.isTask ? (
                    <button
                      type="button"
                      onClick={() => onToggleNoteComplete(editingNote.id)}
                      className="h-11 rounded-2xl bg-white px-3 text-xs font-bold text-stone-700 ring-1 ring-stone-200 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                    >
                      {editingNote.completed ? "إلغاء الإكمال" : "تمت"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onConvertNoteToTask(editingNote.id)}
                      className="h-11 rounded-2xl bg-white px-3 text-xs font-bold text-stone-700 ring-1 ring-stone-200 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                    >
                      تحويل لمهمة
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteNote(editingNote.id)}
                    className="col-span-2 h-11 rounded-2xl bg-red-50 px-3 text-xs font-bold text-red-700 ring-1 ring-red-100 transition active:scale-[0.98] dark:bg-red-950/30 dark:text-red-200 dark:ring-red-900"
                  >
                    حذف الورقة
                  </button>
                </div>
              ) : null}

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="button"
                  disabled={!canSaveNote}
                  onClick={() =>
                    canSaveNote &&
                    onSaveNote({ ...noteDraft, text: noteDraft.text.trim() })
                  }
                  className="h-12 rounded-2xl bg-stone-950 px-5 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-stone-100 dark:text-stone-950"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 rounded-2xl bg-stone-100 px-5 text-sm font-bold text-stone-700 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : null}

        </div>
      </section>
    </div>
  );
}