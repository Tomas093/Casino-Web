import React, {useEffect, useState} from 'react';
import {useAuth} from '@context/AuthContext';
import {useLeaderboard, TimeFrame} from '@context/LeaderboardContext';
import '@css/LeaderboardStyle.css';
import {useUser} from "@context/UserContext.tsx";

interface UserRanking {
    clienteid: number;
    nombre: string;
    apellido: string;
    img?: string | null;
    gananciaNeta: string;
    mayorRetorno: string;
    mayorApuesta: string;
    winPercentage: number;
    juegoNombre?: string;
}

interface LeaderboardProps {
    limit?: number; // Número máximo de usuarios a mostrar
    compact?: boolean; // Modo compacto para mostrar menos columnas
    defaultGameFilter?: string; // Filtro de juego predeterminado
}

const LeaderBoard: React.FC<LeaderboardProps> = ({
                                                     limit = 10,
                                                     compact = false,
                                                     defaultGameFilter
                                                 }) => {
    const {user} = useAuth();
    const {client} = useUser()
    const [rankings, setRankings] = useState<UserRanking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortCriteria, setSortCriteria] = useState<'gananciaNeta' | 'mayorRetorno' | 'mayorApuesta' | 'winPercentage'>('gananciaNeta');
    const [isAscending, setIsAscending] = useState<boolean>(false);
    const [selectedGame, setSelectedGame] = useState<string | null>(defaultGameFilter || null);
    const [availableGames, setAvailableGames] = useState<string[]>([]);

    const {
        isLoading: contextLoading,
        error: contextError,
        timeframe,
        setTimeframe,
        gameWinners,
        highestBets,
        highestReturns,
        accumulatedWinnings,
        topWinPercentages,
        fetchAllLeaderboards
    } = useLeaderboard();

    useEffect(() => {
        // Fetch data on component mount or when timeframe changes
        fetchAllLeaderboards();
    }, [timeframe]);

    useEffect(() => {
        if (gameWinners) {
            setAvailableGames(Object.keys(gameWinners));
        }
    }, [gameWinners]);

    useEffect(() => {
        const generateRankingsData = () => {
            try {
                setLoading(true);

                if (contextLoading) {
                    return;
                }

                if (contextError) {
                    setError(contextError);
                    setLoading(false);
                    return;
                }

                let leaderboardData: UserRanking[] = [];

                // Choose data source based on sortCriteria
                if (sortCriteria === 'gananciaNeta') {
                    if (selectedGame && gameWinners && gameWinners[selectedGame]) {
                        // Game-specific earnings
                        leaderboardData = gameWinners[selectedGame].map(winner => ({
                            clienteid: winner.clienteid,
                            nombre: winner.nombre,
                            apellido: winner.apellido,
                            img: winner.img,
                            gananciaNeta: winner.profit || '0',
                            mayorRetorno: '0',
                            mayorApuesta: '0',
                            winPercentage: 0,
                            juegoNombre: selectedGame
                        }));
                    } else if (accumulatedWinnings) {
                        // Accumulated earnings (all games)
                        leaderboardData = accumulatedWinnings.map(winner => ({
                            clienteid: winner.clienteid,
                            nombre: winner.nombre,
                            apellido: winner.apellido,
                            img: winner.img,
                            gananciaNeta: winner.totalProfit || '0',
                            mayorRetorno: '0',
                            mayorApuesta: '0',
                            winPercentage: 0
                        }));
                    }
                } else if (sortCriteria === 'mayorApuesta' && highestBets) {
                    // Highest bets
                    leaderboardData = highestBets.map(bet => ({
                        clienteid: bet.clienteid,
                        nombre: bet.nombre || '',
                        apellido: bet.apellido || '',
                        img: bet.img,
                        gananciaNeta: '0',
                        mayorRetorno: '0',
                        mayorApuesta: bet.apuesta || '0',
                        winPercentage: 0,
                        juegoNombre: bet.juegoNombre
                    }));
                } else if (sortCriteria === 'mayorRetorno' && highestReturns) {
                    // Highest returns
                    leaderboardData = highestReturns.map(bet => ({
                        clienteid: bet.clienteid,
                        nombre: bet.nombre || '',
                        apellido: bet.apellido || '',
                        img: bet.img,
                        gananciaNeta: '0',
                        mayorRetorno: bet.retorno || '0',
                        mayorApuesta: '0',
                        winPercentage: 0,
                        juegoNombre: bet.juegoNombre
                    }));
                } else if (sortCriteria === 'winPercentage' && topWinPercentages) {
                    // Win percentage
                    leaderboardData = topWinPercentages.map(stats => ({
                        clienteid: stats.clienteid,
                        nombre: stats.nombre || '',
                        apellido: stats.apellido || '',
                        img: stats.img,
                        gananciaNeta: stats.totalProfit || '0',
                        mayorRetorno: '0',
                        mayorApuesta: '0',
                        winPercentage: typeof stats.winPercentage === 'number' ? stats.winPercentage : 0
                    }));
                }

                const sortedRankings = sortRankings(leaderboardData, sortCriteria, isAscending);
                setRankings(sortedRankings.slice(0, limit));
                setLoading(false);
            } catch (err) {
                console.error('Error al generar rankings:', err);
                setError('No se pudieron generar las clasificaciones');
                setLoading(false);
            }
        };

        generateRankingsData();
    }, [
        contextLoading,
        contextError,
        gameWinners,
        highestBets,
        highestReturns,
        accumulatedWinnings,
        topWinPercentages,
        sortCriteria,
        isAscending,
        selectedGame,
        limit
    ]);

    const sortRankings = (data: UserRanking[], criteria: string, ascending: boolean): UserRanking[] => {
        return [...data].sort((a, b) => {
            let valueA, valueB;

            // Handle numeric string values (for profits, bets, etc.)
            if (criteria !== 'winPercentage') {
                valueA = parseFloat(a[criteria as keyof UserRanking] as string) || 0;
                valueB = parseFloat(b[criteria as keyof UserRanking] as string) || 0;
            } else {
                valueA = a.winPercentage;
                valueB = b.winPercentage;
            }

            return ascending ? valueA - valueB : valueB - valueA;
        });
    };

    const handleSortChange = (criteria: 'gananciaNeta' | 'mayorRetorno' | 'mayorApuesta' | 'winPercentage') => {
        if (sortCriteria === criteria) {
            setIsAscending(!isAscending);
        } else {
            setSortCriteria(criteria);
            setIsAscending(false);

            // Reset game filter for certain criteria
            if (criteria !== 'gananciaNeta') {
                setSelectedGame(null);
            }
        }
    };

    const handleGameFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedGame(value === "all" ? null : value);
    };

    const handleTimeframeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeframe(event.target.value as TimeFrame);
    };

    // Get label for sort criteria
    const getSortCriteriaLabel = (criteria: string): string => {
        switch (criteria) {
            case 'gananciaNeta':
                return selectedGame ? `Ganancia en ${selectedGame}` : 'Ganancias Acumuladas';
            case 'mayorRetorno':
                return 'Mayor Retorno';
            case 'mayorApuesta':
                return 'Mayor Apuesta';
            case 'winPercentage':
                return 'Porcentaje de Victoria';
            default:
                return criteria;
        }
    };

    if (loading || contextLoading) {
        return <div className="leaderboard__loading">Cargando clasificaciones...</div>;
    }

    if (error || contextError) {
        return <div className="leaderboard__error">{error || contextError}</div>;
    }

    // Helper component for rendering a user row
    const LeaderboardRow = ({ranking, index}: { ranking: UserRanking, index: number }) => {
        // Determine if this row represents the current user
        const isCurrentUser = user?.cliente?.some(cliente =>
            cliente.clienteid === ranking.clienteid
        );

        // Determine rank styling
        const rankClassName =
            index === 0 ? 'leaderboard__rank leaderboard__rank--top1' :
                index === 1 ? 'leaderboard__rank leaderboard__rank--top2' :
                    index === 2 ? 'leaderboard__rank leaderboard__rank--top3' :
                        'leaderboard__rank';

        // Ensure winPercentage is a number to prevent toFixed() errors
        const winPercentage = typeof ranking.winPercentage === 'number' ? ranking.winPercentage : 0;
        const gananciaNeta = ranking.gananciaNeta || '0';
        const mayorRetorno = ranking.mayorRetorno || '0';
        const mayorApuesta = ranking.mayorApuesta || '0';

        return (
            <div
                className={`leaderboard__row ${compact ? 'leaderboard__row--compact' : ''} ${isCurrentUser ? 'current-user' : ''}`}>
                <div className={rankClassName}>{index + 1}</div>
                <div className="leaderboard__user">
                    <div className="leaderboard__avatar">
                        {ranking.img ? (
                            <img
                                src={`http://localhost:3001${ranking.img}`}
                                alt={`${ranking.nombre} ${ranking.apellido}`}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const div = document.createElement('div');
                                        div.className = 'leaderboard__default-avatar';
                                        div.textContent = `${ranking.nombre.charAt(0)}${ranking.apellido.charAt(0)}`;
                                        parent.appendChild(div);
                                    }
                                }}
                            />
                        ) : (
                            <div className="leaderboard__default-avatar">
                                {ranking.nombre ? ranking.nombre.charAt(0) : ''}
                                {ranking.apellido ? ranking.apellido.charAt(0) : ''}
                            </div>
                        )}
                    </div>
                    <span className="leaderboard__username">{ranking.nombre} {ranking.apellido}</span>
                </div>
                <div className="leaderboard__stat">
                    {sortCriteria === 'gananciaNeta' && (
                        <span className={parseFloat(gananciaNeta) >= 0 ? 'positive' : 'negative'}>
                            {parseFloat(gananciaNeta) >= 0 ? '+' : ''}
                            {parseFloat(gananciaNeta).toLocaleString()} AC
                        </span>
                    )}
                    {sortCriteria === 'mayorRetorno' && (
                        <span className="positive">
                            +{parseFloat(mayorRetorno).toLocaleString()} AC
                        </span>
                    )}
                    {sortCriteria === 'mayorApuesta' && (
                        <span>{parseFloat(mayorApuesta).toLocaleString()} AC</span>
                    )}
                    {sortCriteria === 'winPercentage' && (
                        <span className={winPercentage >= 50 ? 'positive' : ''}>
                            {winPercentage.toFixed(1)}%
                        </span>
                    )}
                </div>
                {!compact && sortCriteria !== 'gananciaNeta' && ranking.juegoNombre && (
                    <div className="leaderboard__game">
                        {ranking.juegoNombre}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="leaderboard">
            <div className="leaderboard__header">

                <div className="leaderboard__filters-row">
                    <div className="leaderboard__timeframe-filter">
                        <label>Periodo:</label>
                        <select
                            className="leaderboard__dropdown"
                            value={timeframe}
                            onChange={handleTimeframeChange}
                        >
                            <option value="day">Hoy</option>
                            <option value="month">Este Mes</option>
                            <option value="year">Este Año</option>
                            <option value="all">Todo</option>
                        </select>
                    </div>
                </div>

                {compact ? (
                    <div className="leaderboard__filters-compact">
                        <select
                            className="leaderboard__dropdown"
                            value={sortCriteria}
                            onChange={(e) => handleSortChange(e.target.value as any)}
                        >
                            <option value="gananciaNeta">Ganancias Acumuladas</option>
                            <option value="mayorRetorno">Mayor Retorno</option>
                            <option value="mayorApuesta">Mayor Apuesta</option>
                            <option value="winPercentage">% de Victoria</option>
                        </select>

                        {sortCriteria === 'gananciaNeta' && (
                            <select
                                className="leaderboard__dropdown"
                                value={selectedGame || "all"}
                                onChange={handleGameFilterChange}
                            >
                                <option value="all">Todos los Juegos</option>
                                {availableGames.map(game => (
                                    <option key={game} value={game}>{game}</option>
                                ))}
                            </select>
                        )}

                        <button
                            className="leaderboard__order-btn"
                            onClick={() => setIsAscending(!isAscending)}
                        >
                            {isAscending ? '↑' : '↓'}
                        </button>
                    </div>
                ) : (
                    <div className="leaderboard__filters">
                        <button
                            className={`leaderboard__filter-btn ${sortCriteria === 'gananciaNeta' ? 'active' : ''}`}
                            onClick={() => handleSortChange('gananciaNeta')}
                        >
                            Ganancias {sortCriteria === 'gananciaNeta' && (isAscending ? '↑' : '↓')}
                        </button>
                        <button
                            className={`leaderboard__filter-btn ${sortCriteria === 'mayorRetorno' ? 'active' : ''}`}
                            onClick={() => handleSortChange('mayorRetorno')}
                        >
                            Mayor Retorno {sortCriteria === 'mayorRetorno' && (isAscending ? '↑' : '↓')}
                        </button>
                        <button
                            className={`leaderboard__filter-btn ${sortCriteria === 'mayorApuesta' ? 'active' : ''}`}
                            onClick={() => handleSortChange('mayorApuesta')}
                        >
                            Mayor Apuesta {sortCriteria === 'mayorApuesta' && (isAscending ? '↑' : '↓')}
                        </button>
                        <button
                            className={`leaderboard__filter-btn ${sortCriteria === 'winPercentage' ? 'active' : ''}`}
                            onClick={() => handleSortChange('winPercentage')}
                        >
                            % Victoria {sortCriteria === 'winPercentage' && (isAscending ? '↑' : '↓')}
                        </button>

                        {sortCriteria === 'gananciaNeta' && (
                            <select
                                className="leaderboard__dropdown"
                                value={selectedGame || "all"}
                                onChange={handleGameFilterChange}
                            >
                                <option value="all">Todos los Juegos</option>
                                {availableGames.map(game => (
                                    <option key={game} value={game}>{game}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )}
            </div>

            <div className="leaderboard__table">
                <div className={`leaderboard__table-header ${compact ? 'leaderboard__table-header--compact' : ''}`}>
                    <div className="leaderboard__rank">Pos.</div>
                    <div className="leaderboard__user">Jugador</div>
                    <div className="leaderboard__stat">
                        {getSortCriteriaLabel(sortCriteria)}
                        <span className="leaderboard__order-indicator">{isAscending ? ' ↑' : ' ↓'}</span>
                    </div>
                    {!compact && sortCriteria !== 'gananciaNeta' && (
                        <div className="leaderboard__game">Juego</div>
                    )}
                </div>

                <div className="leaderboard__table-body">
                    {rankings.length > 0 ? (
                        rankings.map((ranking, index) => (
                            <LeaderboardRow
                                key={`${ranking.clienteid}-${index}-${sortCriteria}`}
                                ranking={ranking}
                                index={index}
                            />
                        ))
                    ) : (
                        <div className="leaderboard__empty">No hay datos disponibles para mostrar en la
                            clasificación</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderBoard;
