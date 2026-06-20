import React from 'react';
import { useOnboarding } from '../../lib/useOnboarding';
import { FaCircleCheck, FaCircle, FaArrowRight } from 'react-icons/fa6';

export function OnboardingTracker() {
  const { tasks, loading, completeTask } = useOnboarding();

  if (loading) return <div className="text-white/70">Loading onboarding...</div>;
  if (tasks.length === 0) return null;

  const completedCount = tasks.filter(t => !!t.completed_at).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="rounded-2xl border border-luxury-accent/25 bg-black/60 p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-luxury-accent">Onboarding Tasks</h2>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-luxury-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-white/50">{completedCount} of {tasks.length} tasks completed</p>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`flex items-start gap-4 rounded-xl border border-white/5 p-4 transition-all ${
              task.completed_at ? 'bg-luxury-accent/5' : 'bg-white/5 hover:border-luxury-accent/20'
            }`}
          >
            <button
              onClick={() => !task.completed_at && completeTask(task.id)}
              className={`mt-1 text-xl transition-colors ${
                task.completed_at ? 'text-luxury-accent' : 'text-white/20 hover:text-luxury-accent'
              }`}
            >
              {task.completed_at ? <FaCircleCheck /> : <FaCircle />}
            </button>
            <div className="flex-1">
              <h3 className={`font-bold ${task.completed_at ? 'text-white/50' : 'text-white'}`}>
                {task.title}
              </h3>
              <p className="text-sm text-white/50">{task.description}</p>
            </div>
            {!task.completed_at && (
              <button
                onClick={() => completeTask(task.id)}
                className="text-luxury-accent hover:text-white"
              >
                <FaArrowRight />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
