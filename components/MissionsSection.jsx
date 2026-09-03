'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, Sparkles, ShieldCheck, Trophy, RefreshCw } from 'lucide-react';
import { useRealtimeData } from '@/lib/realtime-context';

const missionData = [
  {
    id: 'mission-1',
    title: 'Claim startup rewards',
    description: 'Complete your first bridge or swap to unlock bonus points.',
    reward: '120 XP',
    progress: 'In progress',
  },
  {
    id: 'mission-2',
    title: 'Diversify across chains',
    description: 'Hold assets on 3 different networks to increase your score.',
    reward: '200 XP',
    progress: 'Open',
  },
  {
    id: 'mission-3',
    title: 'Earn passive yield',
    description: 'Supply assets to an earn pool and receive portfolio boosts.',
    reward: '180 XP',
    progress: 'Open',
  },
];

export default function MissionsSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const { missionProgress, isLoading, refreshMissions } = useRealtimeData();

  const filteredMissions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return missionData;
    return missionData.filter((mission) =>
      mission.title.toLowerCase().includes(normalized) ||
      mission.description.toLowerCase().includes(normalized) ||
      mission.reward.toLowerCase().includes(normalized),
    );
  }, [searchTerm]);

  return (
    <section className="missions-section">
      <div className="missions-hero-card">
        <div>
          <p className="missions-kicker">Missions</p>
          <h1>Earn rewards while you explore DeFi.</h1>
          <p className="missions-description">
            Complete simple tasks, grow your portfolio, and collect achievement rewards.
          </p>
        </div>
        <div className="missions-highlight-card">
          <div>
            <span>{missionProgress.activeCount || 4} active missions</span>
            <strong>+{missionProgress.availableXP || 500} XP possible</strong>
          </div>
          <button
            onClick={refreshMissions}
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              color: 'rgba(255,255,255,0.7)',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              marginTop: '12px',
            }}
          >
            <RefreshCw size={14} /> {isLoading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="missions-search-row">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search missions"
        />
      </div>

      <div className="missions-list">
        {filteredMissions.map((mission) => {
          const progress = missionProgress[mission.id] || {};
          const progressPercent = progress.progress || 0;
          const isCompleted = progress.completed || false;

          return (
            <div key={mission.id} className="mission-card" style={{ opacity: isCompleted ? 0.8 : 1 }}>
              <div className="mission-card-title">
                <CheckCircle size={20} style={{ color: isCompleted ? '#4ade80' : 'currentColor' }} />
                <div>
                  <h3>{mission.title}</h3>
                  <p>{mission.description}</p>
                </div>
              </div>
              <div className="mission-card-meta">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
                    {isCompleted ? '✓ Completed' : `${progressPercent}% complete`}
                  </div>
                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: isCompleted
                          ? '#4ade80'
                          : 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                        width: `${progressPercent}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    marginLeft: '12px',
                    fontWeight: '600',
                    color: '#fbbf24',
                  }}
                >
                  {mission.reward}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
