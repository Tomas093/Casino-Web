import React, {useEffect, useState} from 'react';
import {useAuth} from '@context/AuthContext';
import {TimeFrame, useLeaderboard} from '@context/LeaderboardContext';
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
    jugadaCount?: number;
    juegoNombre?: string;
}

interface LeaderboardProps {
    limit?: number;
    compact?: boolean;
    defaultGameFilter?: string;
}

const LeaderBoard: React.FC<LeaderboardProps> = ({
                                                     limit = 10,
                                                     compact = false,
                                                     defaultGameFilter
                                                 }) => {
    const {} = useAuth();
    const {client} = useUser();
    const [rankings, setRankings] = useState<UserRanking[]>([]);
    const [, setLoading] = useState<boolean>(true);
    const [, setError] = useState<string | null>(null);
    const [sortCriteria, setSortCriteria] = useState<'gananciaNeta' | 'mayorRetorno' | 'mayorApuesta' | 'winPercentage' | 'jugadaCount'>('gananciaNeta');
    const [isAscending, setIsAscending] = useState<boolean>(false);
    const [selectedGame, setSelectedGame] = useState<string | null>(defaultGameFilter || null);
    const [, setAvailableGames] = useState<string[]>([]);
    const [showFriendsLeaderboard, setShowFriendsLeaderboard] = useState(false);

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
        mostPlayed,
        fetchAllLeaderboards,
        friendsLeaderboard,
        fetchFriendsLeaderboard,
    } = useLeaderboard();

    useEffect(() => {
        fetchAllLeaderboards();
    }, [timeframe]);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const parsedUser = JSON.parse(user);
            fetchFriendsLeaderboard(parsedUser.usuarioid);
        }

    }, [timeframe]);

    useEffect(() => {
        if (gameWinners && Object.keys(gameWinners).length > 0) {
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

                switch (sortCriteria) {
                    case 'gananciaNeta':
                        if (selectedGame && gameWinners && gameWinners[selectedGame]) {
                            leaderboardData = gameWinners[selectedGame].map(winner => ({
                                clienteid: Number(winner.clienteid) || 0,
                                nombre: winner.nombre || '',
                                apellido: winner.apellido || '',
                                img: winner.img || null,
                                gananciaNeta: winner.profit || '0',
                                mayorRetorno: '0',
                                mayorApuesta: '0',
                                winPercentage: 0,
                                juegoNombre: selectedGame
                            }));
                        } else if (accumulatedWinnings?.length > 0) {
                            leaderboardData = accumulatedWinnings.map(winner => ({
                                clienteid: Number(winner.clienteid) || 0,
                                nombre: winner.nombre || '',
                                apellido: winner.apellido || '',
                                img: winner.img || null,
                                gananciaNeta: winner.totalProfit || '0',
                                mayorRetorno: '0',
                                mayorApuesta: '0',
                                winPercentage: 0
                            }));
                        }
                        break;

                    case 'mayorApuesta':
                        if (highestBets?.length > 0) {
                            leaderboardData = highestBets.map(bet => ({
                                clienteid: Number(bet.clienteid) || 0,
                                nombre: bet.nombre || '',
                                apellido: bet.apellido || '',
                                img: bet.img || null,
                                gananciaNeta: '0',
                                mayorRetorno: '0',
                                mayorApuesta: bet.apuesta || '0',
                                winPercentage: 0,
                                juegoNombre: bet.juegoNombre || ''
                            }));
                        }
                        break;

                    case 'mayorRetorno':
                        if (highestReturns?.length > 0) {
                            leaderboardData = highestReturns.map(returnData => ({
                                clienteid: Number(returnData.clienteid) || 0,
                                nombre: returnData.nombre || '',
                                apellido: returnData.apellido || '',
                                img: returnData.img || null,
                                gananciaNeta: '0',
                                mayorRetorno: returnData.retorno || '0',
                                mayorApuesta: '0',
                                winPercentage: 0,
                                juegoNombre: returnData.juegoNombre || ''
                            }));
                        }
                        break;

                    case 'winPercentage':
                        if (topWinPercentages?.length > 0) {
                            leaderboardData = topWinPercentages.map(stats => ({
                                clienteid: Number(stats.clienteid) || 0,
                                nombre: stats.nombre || '',
                                apellido: stats.apellido || '',
                                img: stats.img || null,
                                gananciaNeta: stats.totalProfit || '0',
                                mayorRetorno: '0',
                                mayorApuesta: '0',
                                winPercentage: stats.winPercentage || 0
                            }));
                        }
                        break;

                    case 'jugadaCount':
                        if (mostPlayed?.length > 0) {
                            leaderboardData = mostPlayed.map(player => ({
                                clienteid: Number(player.clienteid) || 0,
                                nombre: player.nombre || '',
                                apellido: player.apellido || '',
                                img: player.img || null,
                                gananciaNeta: '0',
                                mayorRetorno: '0',
                                mayorApuesta: '0',
                                winPercentage: 0,
                                jugadaCount: player.jugadaCount || 0
                            }));
                        }
                        break;
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
        mostPlayed,
        sortCriteria,
        isAscending,
        selectedGame,
        limit
    ]);

    const sortRankings = (data: UserRanking[], criteria: string, ascending: boolean): UserRanking[] => {
        return [...data].sort((a, b) => {
            let valueA, valueB;

            if (criteria === 'winPercentage') {
                valueA = a.winPercentage || 0;
                valueB = b.winPercentage || 0;
            } else if (criteria === 'jugadaCount') {
                valueA = a.jugadaCount || 0;
                valueB = b.jugadaCount || 0;
            } else {
                valueA = parseFloat(String(a[criteria as keyof UserRanking])) || 0;
                valueB = parseFloat(String(b[criteria as keyof UserRanking])) || 0;
            }

            return ascending ? valueA - valueB : valueB - valueA;
        });
    };

    const handleSortChange = (criteria: 'gananciaNeta' | 'mayorRetorno' | 'mayorApuesta' | 'winPercentage' | 'jugadaCount') => {
        if (sortCriteria === criteria) {
            setIsAscending(!isAscending);
        } else {
            setSortCriteria(criteria);
            setIsAscending(false);

            if (criteria !== 'gananciaNeta') {
                setSelectedGame(null);
            }
        }
    };

    const handleTimeframeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeframe(event.target.value as TimeFrame);
    };

    const getSortCriteriaLabel = (criteria: string): string => {
        switch (criteria) {
            case 'gananciaNeta':
                return selectedGame ? `Ganancia en ${selectedGame}` : 'Ganancias Acumuladas';
            case 'mayorRetorno':
                return 'Mayor Retorno';
            case 'mayorApuesta':
                return 'Mayor Apuesta';
            case 'winPercentage':
                return 'Porcentaje de Ganancia';
            case 'jugadaCount':
                return 'Cantidad de Jugadas';
            default:
                return criteria;
        }
    };

    const toggleLeaderboard = () => {
        setShowFriendsLeaderboard(!showFriendsLeaderboard);
    };

    const renderLeaderboard = () => {
        // Add debug logging
        if (showFriendsLeaderboard) {
            return (
                <div className="leaderboard__friends">
                    <h2>Clasificación de Amigos</h2>

                    {Array.isArray(friendsLeaderboard) && friendsLeaderboard.length > 0 ? (
                        friendsLeaderboard.map((friend, index) => (
                            <LeaderboardRow
                                key={`${friend.clienteid}-${index}`}
                                ranking={{
                                    clienteid: friend.clienteid,
                                    nombre: friend.nombre,
                                    apellido: friend.apellido,
                                    img: friend.img,
                                    gananciaNeta: friend.gananciaNeta,
                                    mayorRetorno: friend.mayorRetorno || '0',
                                    mayorApuesta: friend.mayorApuesta || '0',
                                    winPercentage: friend.winPercentage,
                                    jugadaCount: friend.jugadaCount
                                }}
                                index={index}
                            />
                        ))
                    ) : (
                        <div className="leaderboard__empty">
                            No hay datos disponibles para tus amigos.
                            {contextLoading && <span> Cargando datos...</span>}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="leaderboard__table">
                <h2>{getSortCriteriaLabel(sortCriteria)}</h2>
                {rankings.length > 0 ? (
                    rankings.map((ranking, index) => (
                        <LeaderboardRow key={`${ranking.clienteid}-${index}`} ranking={ranking} index={index}/>
                    ))
                ) : (
                    <div className="leaderboard__empty">No hay datos disponibles para esta clasificación.</div>
                )}
            </div>
        );
    };

    const LeaderboardRow = ({ranking, index}: { ranking: UserRanking, index: number }) => {
        const isCurrentUser = client?.clienteid === ranking.clienteid;

        const rankClassName =
            index === 0 ? 'leaderboard__rank leaderboard__rank--top1' :
                index === 1 ? 'leaderboard__rank leaderboard__rank--top2' :
                    index === 2 ? 'leaderboard__rank leaderboard__rank--top3' :
                        'leaderboard__rank';

        const winPercentage = ranking.winPercentage;
        const gananciaNeta = ranking.gananciaNeta || '0';
        const mayorRetorno = ranking.mayorRetorno || '0';
        const mayorApuesta = ranking.mayorApuesta || '0';
        const jugadaCount = ranking.jugadaCount || 0;

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
                                        const defaultAvatar = document.createElement('div');
                                        defaultAvatar.className = 'leaderboard__default-avatar';
                                        defaultAvatar.textContent = `${ranking.nombre.charAt(0)}${ranking.apellido.charAt(0)}`;
                                        parent.appendChild(defaultAvatar);
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
                    {sortCriteria === 'jugadaCount' && (
                        <span>{jugadaCount.toLocaleString()} jugadas</span>
                    )}
                </div>
                {!compact && sortCriteria !== 'gananciaNeta' && sortCriteria !== 'jugadaCount' && ranking.juegoNombre && (
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
                            value={timeframe}
                            onChange={handleTimeframeChange}
                            className="leaderboard__select"
                        >
                            <option value="day">Hoy</option>
                            <option value="month">Este Mes</option>
                            <option value="year">Este Año</option>
                            <option value="all">Todo</option>
                        </select>
                    </div>

                    <button
                        className="leaderboard__toggle-btn"
                        onClick={toggleLeaderboard}
                    >
                        {showFriendsLeaderboard ? 'Ver General' : 'Ver Amigos'}
                    </button>
                </div>

                {compact ? (
                    <div className="leaderboard__filters-compact">
                        <select
                            className="leaderboard__select"
                            value={sortCriteria}
                            onChange={(e) => handleSortChange(e.target.value as any)}
                        >
                            <option value="gananciaNeta">Ganancias</option>
                            <option value="mayorRetorno">Mayor Retorno</option>
                            <option value="mayorApuesta">Mayor Apuesta</option>
                            <option value="winPercentage">% Ganancia</option>
                            <option value="jugadaCount">Jugadas</option>
                        </select>

                        <button
                            className="leaderboard__sort-direction"
                            onClick={() => setIsAscending(!isAscending)}
                        >
                            {isAscending ? '▲' : '▼'}
                        </button>
                    </div>
                ) : (
                    <div className="leaderboard__filters">
                        <button
                            className={`leaderboard__filter ${sortCriteria === 'gananciaNeta' ? 'active' : ''}`}
                            onClick={() => handleSortChange('gananciaNeta')}
                        >
                            Ganancias {sortCriteria === 'gananciaNeta' && (isAscending ? '▲' : '▼')}
                        </button>
                        <button
                            className={`leaderboard__filter ${sortCriteria === 'mayorRetorno' ? 'active' : ''}`}
                            onClick={() => handleSortChange('mayorRetorno')}
                        >
                            Mayor Retorno {sortCriteria === 'mayorRetorno' && (isAscending ? '▲' : '▼')}
                        </button>
                        <button
                            className={`leaderboard__filter ${sortCriteria === 'mayorApuesta' ? 'active' : ''}`}
                            onClick={() => handleSortChange('mayorApuesta')}
                        >
                            Mayor Apuesta {sortCriteria === 'mayorApuesta' && (isAscending ? '▲' : '▼')}
                        </button>
                        <button
                            className={`leaderboard__filter ${sortCriteria === 'winPercentage' ? 'active' : ''}`}
                            onClick={() => handleSortChange('winPercentage')}
                        >
                            % Ganancia {sortCriteria === 'winPercentage' && (isAscending ? '▲' : '▼')}
                        </button>
                        <button
                            className={`leaderboard__filter ${sortCriteria === 'jugadaCount' ? 'active' : ''}`}
                            onClick={() => handleSortChange('jugadaCount')}
                        >
                            Jugadas {sortCriteria === 'jugadaCount' && (isAscending ? '▲' : '▼')}
                        </button>
                    </div>
                )}
            </div>

            {renderLeaderboard()}
        </div>
    );
};

export default LeaderBoard;