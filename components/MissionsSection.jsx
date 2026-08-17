'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, Sparkles, ShieldCheck, Trophy } from 'lucide-react';

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
          <span>4 active missions</span>
          <strong>+500 XP possible</strong>
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
        {filteredMissions.map((mission) => (
          <div key={mission.id} className="mission-card">
            <div className="mission-card-title">
              <CheckCircle size={20} />
              <div>
                <h3>{mission.title}</h3>
                <p>{mission.description}</p>
              </div>
            </div>
            <div className="mission-card-meta">
              <span>{mission.reward}</span>
              <span className="mission-progress">{mission.progress}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
