import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GlobalMissionAlert from '../components/GlobalMissionAlert';
import { SocketProvider } from '../context/SocketContext';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock high-end component logic
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user', token: 'test-token', name: 'Test Operative' }
    }),
    AuthProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../context/SocketContext', () => ({
    useSocket: () => ({
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
    }),
    SocketProvider: ({ children }) => <div>{children}</div>
}));

describe('Tactical HUD: GlobalMissionAlert Drill', () => {
    it('should correctly project active mission signals', () => {
        render(
            <MemoryRouter>
                <GlobalMissionAlert />
            </MemoryRouter>
        );
        
        // Initial state should be hidden (null) if no missions
        const alert = screen.queryByText(/Global Mission Active/i);
        expect(alert).toBeNull();
    });
});
