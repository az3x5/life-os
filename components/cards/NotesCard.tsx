import React from 'react';
import { NotebookPen, Plus } from 'lucide-react';
import { Note } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface NotesCardProps {
  notes: Note[];
}

const NotesCard: React.FC<NotesCardProps> = ({ notes }) => {
  // Get excerpt from content if not provided
  const getExcerpt = (note: Note) => {
    if (note.excerpt) return note.excerpt;
    if (note.content) return note.content.substring(0, 100);
    return 'No content';
  };

  // Get timestamp from updated_at or created_at
  const getTimestamp = (note: Note) => {
    const dateStr = (note as any).updated_at || (note as any).created_at || note.timestamp;
    if (!dateStr) return 'Recently';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
            <NotebookPen size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Notes</h3>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {notes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No notes yet
          </div>
        ) : (
          notes.slice(0, 3).map((note) => (
            <div key={note.id} className="group p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
              <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                {note.title || 'Untitled'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{getExcerpt(note)}</p>
              <span className="text-[10px] text-slate-400 mt-2 block">
                {getTimestamp(note)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesCard;
