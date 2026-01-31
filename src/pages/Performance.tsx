import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Layout } from '@/components/Layout';
import type { TypingHistory } from '@/types/history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const initialHistory: TypingHistory = {
  results: [],
  bestWpm: null,
};

export default function Performance() {
  const [history] = useLocalStorage<TypingHistory>('typing-history', initialHistory);

  const averageWpm = history.results.length > 0
    ? Math.round(history.results.reduce((acc, r) => acc + r.wpm, 0) / history.results.length)
    : 0;

  const averageAccuracy = history.results.length > 0
    ? Math.round(history.results.reduce((acc, r) => acc + r.accuracy, 0) / history.results.length)
    : 0;
    
  const chartData = history.results.map(r => ({
    date: new Date(r.date).toLocaleDateString(),
    wpm: r.wpm,
  })).reverse();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Performance</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Best WPM</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{history.bestWpm ?? 0}</p>
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>WPM Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64 w-full">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area type="monotone" dataKey="wpm" fill="var(--color-primary)" stroke="var(--color-primary)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

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
                {history.results.map(result => (
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
    </Layout>
  );
}
