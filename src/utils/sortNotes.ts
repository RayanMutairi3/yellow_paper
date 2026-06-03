import type { Note } from "../types/note";

function getSortRank(note: Note) {
  if (note.pinned) return 0;
  if (note.isTask && !note.completed) return 1;
  if (!note.isTask) return 2;
  return 3;
}

export function sortNotes(notes: Note[]) {
  return [...notes].sort((firstNote, secondNote) => {
    const rankDifference = getSortRank(firstNote) - getSortRank(secondNote);

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return (
      new Date(secondNote.updatedAt).getTime() -
      new Date(firstNote.updatedAt).getTime()
    );
  });
}
