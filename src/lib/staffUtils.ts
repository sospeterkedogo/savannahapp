import { supabase } from './supabase';

export async function logAction(
  action: string,
  targetType: string,
  targetId: string | null = null,
  details: Record<string, unknown> = {}
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { error } = await supabase.from('audit_logs').insert({
    user_id: session.user.id,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });

  if (error) {
    console.error('Error logging action:', error);
  }
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info'
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type,
  });

  if (error) {
    console.error('Error creating notification:', error);
  }
}
