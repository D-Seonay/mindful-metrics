import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TestType = 'global' | 'reaction' | 'typing' | 'aim' | 'memory';

// Mock data for now
const mockScores = [
  { id: '1', rank: 1, user_name: 'PlayerOne', score_main: 150, created_at: '2024-01-01T12:00:00Z' },
  { id: '2', rank: 2, user_name: 'PlayerTwo', score_main: 155, created_at: '2024-01-01T12:00:00Z' },
  { id: '3', rank: 3, user_name: 'PlayerThree', score_main: 160, created_at: '2024-01-01T12:00:00Z' },
  { id: '4', rank: 4, user_name: 'PlayerFour', score_main: 170, created_at: '2024-01-01T12:00:00Z' },
  { id: '5', rank: 5, user_name: 'PlayerFive', score_main: 180, created_at: '2024-01-01T12:00:00Z' },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<TestType>('global');
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching scores
    setLoading(true);
    setTimeout(() => {
      setScores(mockScores);
      setLoading(false);
    }, 1000);
  }, [activeTab]);

  const renderScores = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    if (scores.length === 0) {
      return <p>Be the first to set a record!</p>;
    }

    return (
      <ul className="space-y-2">
        {scores.map((score, index) => (
          <li key={score.id} className={`p-2 rounded-lg flex items-center justify-between ${
            index === 0 ? 'border-2 border-yellow-400' :
            index === 1 ? 'border-2 border-gray-400' :
            index === 2 ? 'border-2 border-orange-400' :
            ''
          }`}>
            <div className="flex items-center">
              <span className="text-lg font-bold w-8">{score.rank}</span>
              <span className="font-semibold">{score.user_name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold mr-4">{score.score_main}</span>
              <span className="text-sm text-muted-foreground">2h ago</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Classement</h1>
        
        <div className="mb-4 border-b">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(['global', 'reaction', 'typing', 'aim', 'memory'] as TestType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Players - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderScores()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
