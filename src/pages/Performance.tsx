import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Layout } from '@/components/Layout';
import type { PerformanceHistory } from '@/types/history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
};

export default function Performance() {
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);

  const bestWpm = history.typing.length > 0 ? Math.max(...history.typing.map(r => r.wpm)) : 0;
  const averageWpm = history.typing.length > 0
    ? Math.round(history.typing.reduce((acc, r) => acc + r.wpm, 0) / history.typing.length)
    : 0;
  const averageAccuracy = history.typing.length > 0
    ? Math.round(history.typing.reduce((acc, r) => acc + r.accuracy, 0) / history.typing.length)
    : 0;
  const typingChartData = history.typing.map(r => ({
    date: new Date(r.date).toLocaleDateString(),
    wpm: r.wpm,
  })).reverse();

  const bestReflex = history.reflex.length > 0 ? Math.min(...history.reflex.map(r => r.time)) : 0;
  const averageReflex = history.reflex.length > 0
    ? Math.round(history.reflex.reduce((acc, r) => acc + r.time, 0) / history.reflex.length)
    : 0;
  const reflexChartData = history.reflex.map(r => ({
    date: new Date(r.date).toLocaleDateString(),
    time: r.time,
  })).reverse();

  const bestTimePerception = history.timePerception?.length > 0 ? Math.min(...history.timePerception.map(r => Math.abs(r.difference))) : 0;
  const averageTimePerception = history.timePerception?.length > 0
    ? (history.timePerception.reduce((acc, r) => acc + r.difference, 0) / history.timePerception.length)
    : 0;
  const timePerceptionChartData = history.timePerception?.map(r => ({
    date: new Date(r.date).toLocaleDateString(),
    difference: r.difference,
  })).reverse() || [];

  const bestAimTrainerTime = history.aimTrainer?.length > 0 ? Math.min(...history.aimTrainer.map(r => r.totalTime)) : 0;
  const averageAimTrainerTime = history.aimTrainer?.length > 0
    ? (history.aimTrainer.reduce((acc, r) => acc + r.totalTime, 0) / history.aimTrainer.length)
    : 0;
  const aimTrainerChartData = history.aimTrainer?.map(r => ({
    date: new Date(r.date).toLocaleDateString(),
    totalTime: r.totalTime,
  })).reverse() || [];


  const handleSave = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance-history.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    setHistory(initialHistory);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Performance</h1>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="destructive" onClick={handleClearHistory}>Clear History</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Typing</h2>
            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Best WPM</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{bestWpm}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average WPM</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{averageWpm}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{averageAccuracy}%</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Typing History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>WPM</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.typing.map(result => (
                      <TableRow key={result.id}>
                        <TableCell>{new Date(result.date).toLocaleString()}</TableCell>
                        <TableCell>{result.wpm}</TableCell>
                        <TableCell>{result.accuracy}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Reflex</h2>
            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Best Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{bestReflex} ms</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{averageReflex} ms</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Reflex History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time (ms)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.reflex.map(result => (
                      <TableRow key={result.id}>
                        <TableCell>{new Date(result.date).toLocaleString()}</TableCell>
                        <TableCell>{result.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Time Perception</h2>
            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Best Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{bestTimePerception.toFixed(2)}s</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Difference</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{averageTimePerception.toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Time Perception History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time (s)</TableHead>
                      <TableHead>Difference (s)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.timePerception?.map(result => (
                      <TableRow key={result.id}>
                        <TableCell>{new Date(result.date).toLocaleString()}</TableCell>
                        <TableCell>{result.time.toFixed(2)}</TableCell>
                        <TableCell>{result.difference.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Aim Trainer</h2>
            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Best Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{(bestAimTrainerTime / 1000).toFixed(2)}s</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Average Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{(averageAimTrainerTime / 1000).toFixed(2)}s</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Aim Trainer History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Time (s)</TableHead>
                      <TableHead>Avg Per Target (ms)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.aimTrainer?.map(result => (
                      <TableRow key={result.id}>
                        <TableCell>{new Date(result.date).toLocaleString()}</TableCell>
                        <TableCell>{(result.totalTime / 1000).toFixed(2)}</TableCell>
                        <TableCell>{result.averageTimePerTarget.toFixed(0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
