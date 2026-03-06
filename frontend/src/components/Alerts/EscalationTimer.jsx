import { useState, useEffect } from 'react';

export default function EscalationTimer({ alert }) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const calculateTime = () => {
      const created = new Date(alert.created_at);
      const now = new Date();
      const elapsed = Math.floor((now - created) / 1000);
      
      // Escalation intervals: 15min, 30min, 45min
      const escalationLevel = alert.escalation_level || 0;
      const nextEscalationMinutes = (escalationLevel + 1) * 15;
      const nextEscalationSeconds = nextEscalationMinutes * 60;
      
      const remaining = nextEscalationSeconds - elapsed;
      
      if (remaining <= 0) {
        setTimeRemaining('ESCALATED');
        setProgress(0);
      } else {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        setTimeRemaining(`${minutes}m ${seconds}s`);
        setProgress((remaining / nextEscalationSeconds) * 100);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [alert]);

  const getEscalationLabel = (level) => {
    switch (level) {
      case 0: return '→ Supervisor (15min)';
      case 1: return '→ Plant Manager (30min)';
      case 2: return '→ Full Escalation (45min)';
      default: return 'Escalated';
    }
  };

  if (alert.status !== 'open') return null;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">Next Escalation</span>
        <span className={`text-sm font-mono ${
          timeRemaining === 'ESCALATED' ? 'text-rose-400' : 'text-amber-400'
        }`}>
          {timeRemaining}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            progress > 50 ? 'bg-emerald-500' : 
            progress > 25 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        {getEscalationLabel(alert.escalation_level || 0)}
      </div>
    </div>
  );
}
