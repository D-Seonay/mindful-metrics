import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CircleMemoryTest from './CircleMemoryTest';
import React from 'react';

// Mock audio engine and sound assets
vi.mock('@/hooks/useSoundSystem', () => ({
  useSoundSystem: () => ({
    playSound: vi.fn(),
  }),
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('CircleMemoryTest', () => {
  it('skips memorization phase when clicking the skip button', async () => {
    render(<CircleMemoryTest />);
    
    // Start game
    const startButton = screen.getByRole('button', { name: /démarrer le test/i });
    fireEvent.click(startButton);
    
    // Should be in memorize phase - check for header
    expect(screen.getAllByText(/mémorisation/i).length).toBeGreaterThan(0);
    
    // Find and click Skip button explicitly by role and name
    const skipButton = screen.getByRole('button', { name: /passer la mémorisation/i });
    fireEvent.click(skipButton);
    
    // Should transition to guess phase
    // In guess phase, the header text "Mémorisation" should be gone (gameState changed)
    expect(screen.queryByText(/^mémorisation$/i)).not.toBeInTheDocument();
    // In guess phase, we should see "Teinte"
    expect(screen.getByText(/teinte/i)).toBeInTheDocument();
  });

  it('skips memorization phase when pressing Space key', async () => {
    render(<CircleMemoryTest />);
    
    // Start game
    fireEvent.click(screen.getByRole('button', { name: /démarrer le test/i }));
    
    // Press Space
    fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    
    // Should transition to guess phase
    expect(screen.queryByText(/^mémorisation$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/teinte/i)).toBeInTheDocument();
  });
});
