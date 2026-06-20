import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { logAction } from './staffUtils';
import type { OnboardingTask } from '../types/staff';

export function useOnboarding() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOnboarding() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get tasks for the user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile) return;

    const [tasksRes, completionsRes] = await Promise.all([
      supabase.from('onboarding_tasks').select('*').eq('role', profile.role).order('sort_order'),
      supabase.from('user_onboarding').select('task_id, completed_at').eq('user_id', session.user.id),
    ]);

    if (tasksRes.data) {
      const mergedTasks = tasksRes.data.map(task => ({
        ...task,
        completed_at: completionsRes.data?.find(c => c.task_id === task.id)?.completed_at,
      }));
      setTasks(mergedTasks);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOnboarding();
  }, []);

  async function completeTask(taskId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('user_onboarding').insert({
      user_id: session.user.id,
      task_id: taskId,
    });

    if (!error) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, completed_at: new Date().toISOString() } : t));
      await logAction('complete_onboarding_task', 'task', taskId);
    }
    return { error };
  }

  return {
    tasks,
    loading,
    completeTask,
    refresh: loadOnboarding,
  };
}
