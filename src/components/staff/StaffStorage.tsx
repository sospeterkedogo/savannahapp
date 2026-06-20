import React, { useState } from 'react';
import { useStaffStorage } from '../../lib/useStaffStorage';
import { FaFolder, FaFile, FaPlus, FaUpload, FaTrash, FaChevronLeft, FaBook, FaDownload } from 'react-icons/fa6';

export function StaffStorage() {
  const { folders, files, loading, createFolder, uploadFile, deleteFile, deleteFolder } = useStaffStorage();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  if (loading) return <div className="text-white/70">Loading storage...</div>;

  const currentFolders = folders.filter(f => f.parent_id === currentFolderId);
  // Only show personal files in folders, or personal files in root
  const currentFiles = files.filter(f => f.folder_id === currentFolderId && !f.is_reference);
  const referenceFiles = files.filter(f => f.is_reference);
  const currentFolder = folders.find(f => f.id === currentFolderId);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await uploadFile(e.target.files[0], currentFolderId);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName, currentFolderId);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Reference Library Section */}
      {!currentFolderId && (
        <div className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-6 shadow-xl">
          <h2 className="text-xl font-serif font-bold text-luxury-accent mb-6 flex items-center gap-3">
            <FaBook /> Reference Library
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {referenceFiles.map(file => (
              <a
                key={file.id}
                href={file.path}
                download={file.name}
                className="group relative flex flex-col items-center justify-center rounded-xl border border-luxury-accent/10 bg-luxury-accent/5 p-4 hover:border-luxury-accent transition-all cursor-pointer"
              >
                <FaFile className="mb-2 text-4xl text-luxury-accent/60 group-hover:text-luxury-accent" />
                <span className="text-xs font-bold text-white/90 text-center uppercase tracking-tighter">{file.name}</span>
                <FaDownload className="absolute top-2 right-2 text-luxury-accent/40 opacity-0 group-hover:opacity-100 transition-opacity" size={12} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Personal Storage Section */}
      <div className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentFolderId && (
              <button
                onClick={() => setCurrentFolderId(currentFolder?.parent_id || null)}
                className="text-luxury-accent hover:text-white"
              >
                <FaChevronLeft />
              </button>
            )}
            <h2 className="text-2xl font-serif font-bold text-luxury-accent">
              {currentFolder ? currentFolder.name : 'My Files'}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-2 rounded-lg bg-luxury-accent/10 px-3 py-1 text-sm font-bold text-luxury-accent hover:bg-luxury-accent hover:text-black transition-colors"
            >
              <FaPlus /> Folder
            </button>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-luxury-accent px-3 py-1 text-sm font-bold text-black hover:bg-white transition-colors">
              <FaUpload /> Upload
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>

        {isCreatingFolder && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1 rounded-lg border border-luxury-accent/30 bg-black/40 px-3 py-1 text-white outline-none focus:border-luxury-accent"
            />
            <button
              onClick={handleCreateFolder}
              className="rounded-lg bg-luxury-accent px-4 py-1 text-sm font-bold text-black"
            >
              Create
            </button>
            <button
              onClick={() => setIsCreatingFolder(false)}
              className="rounded-lg border border-white/20 px-4 py-1 text-sm text-white"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {currentFolders.map(folder => (
            <div
              key={folder.id}
              className="group relative flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 p-4 hover:border-luxury-accent/30 transition-all cursor-pointer"
              onClick={() => setCurrentFolderId(folder.id)}
            >
              <FaFolder className="mb-2 text-4xl text-luxury-accent" />
              <span className="text-sm text-white/90 text-center truncate w-full">{folder.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
          {currentFiles.map(file => (
            <div
              key={file.id}
              className="group relative flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 p-4 hover:border-luxury-accent/30 transition-all"
            >
              <FaFile className="mb-2 text-4xl text-white/40" />
              <span className="text-sm text-white/90 text-center truncate w-full">{file.name}</span>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => deleteFile(file.id, file.path)}
                  className="text-red-500 hover:text-red-400"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {currentFolders.length === 0 && currentFiles.length === 0 && (
          <div className="py-12 text-center text-white/30">This folder is empty</div>
        )}
      </div>
    </div>
  );
}
