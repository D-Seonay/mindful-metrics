import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubmitScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userName: string) => void;
  score: number;
  testType: string;
}

export function SubmitScoreModal({
  isOpen,
  onClose,
  onSubmit,
  score,
  testType,
}: SubmitScoreModalProps) {
  const [userName, setUserName] = useState('');

  const handleSubmit = () => {
    if (userName.trim()) {
      onSubmit(userName.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Your Score</DialogTitle>
          <DialogDescription>
            You scored {score} on the {testType} test. Enter a nickname to save your score to the leaderboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nickname" className="text-right">
              Nickname
            </Label>
            <Input
              id="nickname"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="col-span-3"
              maxLength={20}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!userName.trim()}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
