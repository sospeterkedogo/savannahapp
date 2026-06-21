import { useOnboarding } from '../../lib/useOnboarding';
import { FaCircleCheck, FaCircle, FaArrowRight } from 'react-icons/fa6';

export function OnboardingTracker() {
  const { tasks, loading, completeTask } = useOnboarding();

  if (loading) return <p className="text-vaha-muted">Loading onboarding…</p>;
  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => !!t.completed_at).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-serif text-xl text-vaha-cream">Onboarding Tasks</h2>
        <div className="mt-3 h-1.5 w-full overflow-hidden bg-white/10">
          <div className="h-full bg-vaha-gold transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-vaha-muted">{completedCount} of {tasks.length} completed</p>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 border border-white/10 p-3 ${task.completed_at ? 'bg-vaha-gold/5' : 'hover:border-vaha-gold/30'}`}
          >
            <button
              type="button"
              onClick={() => !task.completed_at && completeTask(task.id)}
              className={`mt-0.5 text-lg ${task.completed_at ? 'text-vaha-gold' : 'text-vaha-muted hover:text-vaha-gold'}`}
            >
              {task.completed_at ? <FaCircleCheck /> : <FaCircle />}
            </button>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold ${task.completed_at ? 'text-vaha-muted line-through' : ''}`}>{task.title}</h3>
              <p className="text-xs text-vaha-muted">{task.description}</p>
            </div>
            {!task.completed_at ? (
              <button type="button" onClick={() => completeTask(task.id)} className="text-vaha-gold hover:text-vaha-cream">
                <FaArrowRight />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
