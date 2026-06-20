import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { logAction } from './staffUtils';
import type { StaffFile, StaffFolder } from '../types/staff';

export function useStaffStorage() {
  const [folders, setFolders] = useState<StaffFolder[]>([]);
  const [files, setFiles] = useState<StaffFile[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStorage() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [foldersRes, filesRes, refFilesRes] = await Promise.all([
      supabase.from('staff_folders').select('*').eq('user_id', session.user.id),
      supabase.from('staff_files').select('*').eq('user_id', session.user.id),
      supabase.from('staff_files').select('*').eq('is_reference', true),
    ]);

    if (foldersRes.data) setFolders(foldersRes.data);
    const allFiles = [...(filesRes.data || []), ...(refFilesRes.data || [])];
    
    // De-duplicate if needed (though seeding uses distinct paths)
    const uniqueFiles = Array.from(new Map(allFiles.map(f => [f.id, f])).values());
    setFiles(uniqueFiles);
    setLoading(false);
  }

  useEffect(() => {
    loadStorage();
  }, []);

  async function createFolder(name: string, parentId: string | null = null) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('staff_folders')
      .insert({ name, parent_id: parentId, user_id: session.user.id })
      .select()
      .single();

    if (data) {
      setFolders([...folders, data]);
      await logAction('create_folder', 'folder', data.id, { name });
    }
    return { data, error };
  }

  async function uploadFile(file: File, folderId: string | null = null) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `staff/${session.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('staff-files')
      .upload(filePath, file);

    if (uploadError) return { error: uploadError };

    const { data, error } = await supabase
      .from('staff_files')
      .insert({
        name: file.name,
        path: filePath,
        type: file.type,
        size: file.size,
        folder_id: folderId,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (data) {
      setFiles([...files, data]);
      await logAction('upload_file', 'file', data.id, { name: file.name });
    }
    return { data, error };
  }

  async function deleteFile(fileId: string, path: string) {
    await supabase.storage.from('staff-files').remove([path]);
    const { error } = await supabase.from('staff_files').delete().eq('id', fileId);
    if (!error) {
      setFiles(files.filter(f => f.id !== fileId));
      await logAction('delete_file', 'file', fileId);
    }
    return { error };
  }

  async function deleteFolder(folderId: string) {
    const { error } = await supabase.from('staff_folders').delete().eq('id', folderId);
    if (!error) {
      setFolders(folders.filter(f => f.id !== folderId));
      await logAction('delete_folder', 'folder', folderId);
    }
    return { error };
  }

  return {
    folders,
    files,
    loading,
    createFolder,
    uploadFile,
    deleteFile,
    deleteFolder,
    refresh: loadStorage,
  };
}
