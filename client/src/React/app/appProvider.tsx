import {ReactNode} from 'react';
import {AuthProvider} from '@context/AuthContext';
import {UserProvider} from '@context/UserContext';
import {AdminProvider} from '@context/AdminContext';
import {TransactionProvider} from '@context/TransactionContext';
import {PlayProvider} from '@context/PlayContext.tsx';
import {HistoryProvider} from '@context/HistoryContext.tsx'
import {GameProvider} from '@context/GameContext'
import {LeaderboardProvider} from '@context/LeaderboardContext.tsx'
import {LimitProvider} from '@context/LimitContext.tsx'
import {FriendRequestProvider} from '@context/FriendRequestContext.tsx';
import {TicketProvider} from '@context/TicketContext.tsx'

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({children}: AppProviderProps) => {
    return (
        <AuthProvider>
            <UserProvider>
                <AdminProvider>
                    <TransactionProvider>
                        <PlayProvider>
                            <HistoryProvider>
                                <GameProvider>
                                    <LeaderboardProvider>
                                        <LimitProvider>
                                            <FriendRequestProvider>
                                                <TicketProvider>
                                                    {children}
                                                </TicketProvider>
                                            </FriendRequestProvider>
                                        </LimitProvider>
                                    </LeaderboardProvider>
                                </GameProvider>
                            </HistoryProvider>
                        </PlayProvider>
                    </TransactionProvider>
                </AdminProvider>
            </UserProvider>
        </AuthProvider>
    );
};