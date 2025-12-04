import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Star,
  Pin,
  Trash2,
  FolderOpen,
  Briefcase,
  User,
  Heart,
  Moon,
  BookOpen,
  Lightbulb,
  MoreVertical,
  ChevronLeft,
  Save,
  Bold,
  Italic,
  Underline,
  List as ListIcon,
  CheckSquare,
  Type,
  PanelLeft,
  Edit,
  Eye,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Note } from '../../types';
import { useNotes } from '../../hooks/useData';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'favorites' | 'trash';
type FolderType = 'work' | 'personal' | 'health' | 'islamic' | 'journal' | 'ideas' | 'trash' | null;

const NotesModule: React.FC = () => {
  // API Hook
  const { notes: apiNotes, loading, createNote: apiCreateNote, updateNote: apiUpdateNote, deleteNote: apiDeleteNote } = useNotes();

  // Local state for notes (synced with API)
  const [notes, setNotes] = useState<Note[]>([]);

  // Sync API notes to local state
  useEffect(() => {
    if (apiNotes.length > 0) {
      // Transform API notes to match local Note type
      const transformedNotes = apiNotes.map((n: any) => ({
        id: n.id?.toString() || '',
        title: n.title || 'Untitled',
        content: n.content || '',
        excerpt: n.content?.substring(0, 100) || '',
        timestamp: new Date(n.updated_at || n.created_at || Date.now()),
        folder: n.folder || 'personal',
        tags: n.tags || [],
        isPinned: n.is_pinned || false,
        isFavorite: n.is_favorite || false,
        color: n.color,
      }));
      setNotes(transformedNotes);
    }
  }, [apiNotes]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeFolder, setActiveFolder] = useState<FolderType>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Editor State
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filter Logic
  const filteredNotes = notes.filter(note => {
    // Search Filter
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Category/Folder Filter
    if (activeFilter === 'favorites') return note.isFavorite && note.folder !== 'trash';
    if (activeFilter === 'trash') return note.folder === 'trash';
    if (activeFolder) return note.folder === activeFolder;

    // Default 'all' - exclude trash
    return note.folder !== 'trash';
  });

  // Sort: Pinned first, then date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Handlers
  const handleOpenNote = (note: Note) => {
    setSelectedNote(note);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setIsEditorOpen(true);
    setActiveMenuId(null);
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      excerpt: '',
      timestamp: new Date(),
      folder: activeFolder && activeFolder !== 'trash' ? activeFolder : 'personal',
      tags: [],
      isPinned: false,
      isFavorite: false,
    };
    handleOpenNote(newNote);
  };

  const handleSaveNote = async () => {
    setIsSaving(true);

    try {
      if (selectedNote) {
        const noteData = {
          title: editorTitle || 'Untitled Note',
          content: editorContent,
          folder: selectedNote.folder || 'personal',
          is_pinned: selectedNote.isPinned,
          is_favorite: selectedNote.isFavorite,
        };

        // If it's a new note (not in list), create it
        if (!notes.find(n => n.id === selectedNote.id)) {
          const created = await apiCreateNote(noteData);
          const newNote = {
            ...selectedNote,
            id: created.id?.toString() || selectedNote.id,
            title: editorTitle || 'Untitled Note',
            content: editorContent,
            excerpt: editorContent.substring(0, 100) + (editorContent.length > 100 ? '...' : ''),
          };
          setNotes([newNote, ...notes]);
          setSelectedNote(newNote);
        } else {
          // Update existing note
          await apiUpdateNote(selectedNote.id, noteData);
          const updatedNotes = notes.map(n =>
            n.id === selectedNote.id
              ? {
                  ...n,
                  title: editorTitle || 'Untitled Note',
                  content: editorContent,
                  excerpt: editorContent.substring(0, 100) + (editorContent.length > 100 ? '...' : ''),
                  timestamp: new Date()
                }
              : n
          );
          setNotes(updatedNotes);
        }
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (note) {
      try {
        await apiUpdateNote(id, { is_pinned: !note.isPinned });
        setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
      } catch (error) {
        console.error('Failed to toggle pin:', error);
      }
    }
    setActiveMenuId(null);
  };

  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (note) {
      try {
        await apiUpdateNote(id, { is_favorite: !note.isFavorite });
        setNotes(notes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    }
    setActiveMenuId(null);
  };

  const moveToTrash = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiDeleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
    setActiveMenuId(null);
  }

  // Effect to auto-save after typing stops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isEditorOpen && selectedNote && (editorTitle !== selectedNote.title || editorContent !== selectedNote.content)) {
        handleSaveNote();
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [editorTitle, editorContent]);


  // Helper for folder icons
  const getFolderIcon = (folder: string) => {
    switch(folder) {
      case 'work': return <Briefcase size={18} />;
      case 'personal': return <User size={18} />;
      case 'health': return <Heart size={18} />;
      case 'islamic': return <Moon size={18} />;
      case 'journal': return <BookOpen size={18} />;
      case 'ideas': return <Lightbulb size={18} />;
      default: return <FolderOpen size={18} />;
    }
  };

  // Helper for color accents
  const getColorClass = (color?: string) => {
    switch(color) {
      case 'blue': return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'amber': return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'emerald': return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'purple': return 'bg-purple-50 border-purple-100 text-purple-700';
      case 'rose': return 'bg-rose-50 border-rose-100 text-rose-700';
      default: return 'bg-white border-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          <p className="text-slate-500">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

      {/* Left Sidebar */}
      <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-40 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
        {/* Inner wrapper to maintain width during transition */}
        <div className="w-64 h-full flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 text-slate-900"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            
            {/* Main Filters */}
            <div className="space-y-1">
              <button 
                onClick={() => { setActiveFilter('all'); setActiveFolder(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all' && !activeFolder ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <FolderOpen size={18} className={activeFilter === 'all' && !activeFolder ? 'text-blue-500' : 'text-slate-400'} />
                All Notes
              </button>
              <button 
                onClick={() => { setActiveFilter('favorites'); setActiveFolder(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'favorites' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Star size={18} className={activeFilter === 'favorites' ? 'text-amber-500' : 'text-slate-400'} />
                Favorites
              </button>
              <button 
                onClick={() => { setActiveFilter('trash'); setActiveFolder(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'trash' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Trash2 size={18} className={activeFilter === 'trash' ? 'text-red-500' : 'text-slate-400'} />
                Trash
              </button>
            </div>

            {/* Folders */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Folders</h3>
                 <button className="text-slate-400 hover:text-slate-600 transition-colors p-1" title="Manage Folders">
                    <MoreHorizontal size={14} />
                 </button>
              </div>
              <div className="space-y-1">
                {['work', 'personal', 'health', 'islamic', 'journal', 'ideas'].map((folder) => (
                  <div key={folder} className="group relative">
                     <button 
                        onClick={() => { setActiveFolder(folder as FolderType); setActiveFilter('all'); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFolder === folder ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                     >
                        <span className={activeFolder === folder ? 'text-blue-500' : 'text-slate-400'}>
                           {getFolderIcon(folder)}
                        </span>
                        <span className="capitalize flex-1 text-left">{folder}</span>
                     </button>
                     <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={14} />
                     </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header */}
        <div className="h-16 px-4 md:px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg active:bg-slate-200"
            >
              <MoreVertical size={20} />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              <PanelLeft size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-900 capitalize truncate max-w-[120px] sm:max-w-none">
              {activeFolder || (activeFilter === 'all' ? 'All Notes' : activeFilter)}
            </h2>
            <span className="text-sm text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full hidden sm:block">
              {sortedNotes.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 mr-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={18} />
              </button>
            </div>
            
            <button 
              onClick={handleCreateNote}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Note</span>
            </button>
          </div>
        </div>

        {/* Notes Grid/List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
          {sortedNotes.length > 0 ? (
            <div className={`
              grid gap-4 
              ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}
            `}>
              {sortedNotes.map((note) => (
                <div 
                  key={note.id}
                  onClick={() => handleOpenNote(note)}
                  className={`
                    group relative bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col active:scale-[0.99] md:active:scale-100
                    ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'h-64'}
                    ${getColorClass(note.color)}
                  `}
                >
                  <div className={`flex-1 ${viewMode === 'list' ? 'min-w-0' : ''}`}>
                     <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold text-slate-900 group-hover:text-blue-600 transition-colors ${viewMode === 'list' ? 'text-base truncate' : 'text-lg line-clamp-2'}`}>
                          {note.title || 'Untitled Note'}
                        </h3>
                        {note.isPinned && <Pin size={16} className="text-slate-400 rotate-45 shrink-0 ml-2" fill="currentColor" />}
                     </div>
                     
                     <p className={`text-slate-500 text-sm leading-relaxed ${viewMode === 'list' ? 'truncate' : 'line-clamp-4'}`}>
                        {note.excerpt}
                     </p>
                  </div>

                  <div className={`
                    mt-4 pt-4 border-t border-slate-100 flex items-center justify-between
                    ${viewMode === 'list' ? 'mt-0 pt-0 border-0 w-80 justify-end gap-4 shrink-0' : ''}
                  `}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {note.folder}
                      </span>
                      <span className="text-xs text-slate-400">
                         {formatDistanceToNow(note.timestamp, { addSuffix: true })}
                      </span>
                    </div>

                    {/* 3-Dot Menu for Mobile & Desktop */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          setActiveMenuId(activeMenuId === note.id ? null : note.id);
                        }}
                        className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-600"
                      >
                         <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === note.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100 origin-bottom-right">
                             <button 
                                onClick={(e) => {e.stopPropagation(); handleOpenNote(note);}}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                             >
                                <Edit size={16} /> Edit
                             </button>
                             <button 
                                onClick={(e) => toggleFavorite(e, note.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                             >
                                <Star size={16} fill={note.isFavorite ? "currentColor" : "none"} className={note.isFavorite ? "text-amber-400" : ""} /> 
                                {note.isFavorite ? "Unfavorite" : "Favorite"}
                             </button>
                             <button 
                                onClick={(e) => togglePin(e, note.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                             >
                                <Pin size={16} className={note.isPinned ? "text-blue-500" : ""} /> 
                                {note.isPinned ? "Unpin" : "Pin"}
                             </button>
                             <div className="h-px bg-slate-100 my-1" />
                             <button 
                                onClick={(e) => moveToTrash(e, note.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                             >
                                <Trash2 size={16} /> Delete
                             </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                   <Search size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No notes found</h3>
                <p className="text-slate-500 mt-1 max-w-xs">Try adjusting your filters or create a new note to get started.</p>
             </div>
          )}
        </div>
      </div>

      {/* Editor Overlay Panel */}
      {isEditorOpen && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-fade-in">
          {/* Editor Header */}
          <div className="h-16 px-4 md:px-8 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex flex-col">
                 <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    {activeFolder || selectedNote?.folder || 'Uncategorized'} 
                    {isSaving && <span className="text-slate-300 ml-2 animate-pulse">• Saving...</span>}
                 </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <button onClick={() => setEditorContent(prev => prev + ' ')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors hidden sm:block" title="Favorite">
                  <Star size={20} fill={selectedNote?.isFavorite ? "currentColor" : "none"} className={selectedNote?.isFavorite ? "text-amber-400" : ""} />
               </button>
               <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 active:scale-95" onClick={() => setIsEditorOpen(false)}>
                  <Save size={16} />
                  Done
               </button>
            </div>
          </div>

          {/* Editor Toolbar (Visual Mock) */}
          <div className="h-12 border-b border-slate-100 px-4 md:px-8 flex items-center gap-1 overflow-x-auto bg-slate-50/50 scrollbar-hide">
             <button className="p-2 hover:bg-slate-200 rounded text-slate-500"><Bold size={18} /></button>
             <button className="p-2 hover:bg-slate-200 rounded text-slate-500"><Italic size={18} /></button>
             <button className="p-2 hover:bg-slate-200 rounded text-slate-500"><Underline size={18} /></button>
             <div className="w-px h-6 bg-slate-200 mx-2 flex-shrink-0" />
             <button className="p-2 hover:bg-slate-200 rounded text-slate-500"><Type size={18} /></button>
             <button className="p-2 hover:bg-slate-200 rounded text-slate-500"><ListIcon size={18} /></button>
             <button className="p-2 hover:bg-slate-200 rounded text-slate-500"><CheckSquare size={18} /></button>
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8 md:py-12 px-4 sm:px-12">
              <input
                type="text"
                placeholder="Note Title"
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
                className="w-full text-3xl md:text-4xl font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 bg-transparent p-0 mb-6"
              />
              <textarea
                placeholder="Start writing..."
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-[calc(100vh-20rem)] resize-none text-base md:text-lg text-slate-700 leading-relaxed placeholder:text-slate-300 border-none focus:ring-0 bg-transparent p-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesModule;