import React, {useState, useEffect} from 'react';
import {useAuth} from '@context/AuthContext';
import {useLeaderboard} from '@context/LeaderboardContext';
import '@css/LeaderboardStyle.css';

interface UserRanking {
    usuarioid: number;
    nombre: string;
    apellido: string;
    img: string | null;
    gananciaNeta: number;
    partidasJugadas: number;
    balance: number;
    promedioRetorno: number;
    mayorGanancia: number;
}

interface LeaderboardProps {
    limit?: number; // Número máximo de usuarios a mostrar
    compact?: boolean; // Modo compacto para mostrar menos columnas
}

const LeaderBoard: React.FC<LeaderboardProps> = ({limit = 10, compact = false}) => {
    const {user} = useAuth();
    const [rankings, setRankings] = useState<UserRanking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortCriteria, setSortCriteria] = useState<'gananciaNeta' | 'partidasJugadas' | 'balance' | 'promedioRetorno' | 'mayorGanancia'>('gananciaNeta');
    const [isAscending, setIsAscending] = useState<boolean>(false);

    const {
        isLoading: contextLoading,
        error: contextError,
        topPlayersByBalance,
        topPlayersByPlays,
        topPlayersByAverageReturn,
        topJugadasByReturn,
        fetchAllLeaderboards
    } = useLeaderboard();

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true);

                if (contextLoading) {
                    await fetchAllLeaderboards();
                    return;
                }

                if (contextError) {
                    setError(contextError);
                    setLoading(false);
                    return;
                }

                let leaderboardData: UserRanking[] = [];

                if (sortCriteria === 'gananciaNeta' || sortCriteria === 'balance') {
                    leaderboardData = topPlayersByBalance.map(player => {
                        if (!player.usuario) {
                            console.warn("Player sin usuario:", player);
                            return null;
                        }

                        const img = player.usuario.img || null;

                        return {
                            usuarioid: player.usuario.usuarioid,
                            nombre: player.usuario.nombre || "Usuario",
                            apellido: player.usuario.apellido || "",
                            img: img,
                            gananciaNeta: player.balance || 0,
                            partidasJugadas: player.jugada?.length || 0,
                            balance: player.balance || 0,
                            promedioRetorno: 0,
                            mayorGanancia: 0
                        };
                    }).filter(Boolean) as UserRanking[];
                } else if (sortCriteria === 'partidasJugadas') {
                    leaderboardData = topPlayersByPlays.map(player => {
                        if (!player.usuario) {
                            console.warn("Player sin usuario:", player);
                            return null;
                        }

                        const img = player.usuario.img || null;

                        return {
                            usuarioid: player.usuario.usuarioid,
                            nombre: player.usuario.nombre || "Usuario",
                            apellido: player.usuario.apellido || "",
                            img: img,
                            gananciaNeta: 0,
                            partidasJugadas: player.jugada?.length || 0,
                            balance: player.balance || 0,
                            promedioRetorno: 0,
                            mayorGanancia: 0
                        };
                    }).filter(Boolean) as UserRanking[];
                } else if (sortCriteria === 'promedioRetorno') {
                    leaderboardData = topPlayersByAverageReturn.map(player => {
                        if (!player.usuario) {
                            console.warn("Player sin usuario:", player);
                            return null;
                        }

                        const img = player.usuario.img || null;

                        return {
                            usuarioid: player.usuario.usuarioid,
                            nombre: player.usuario.nombre || "Usuario",
                            apellido: player.usuario.apellido || "",
                            img: img,
                            gananciaNeta: 0,
                            partidasJugadas: 0,
                            balance: player.balance || 0,
                            promedioRetorno: Math.round(((player.averageReturn || 0) * 100)),
                            mayorGanancia: 0
                        };
                    }).filter(Boolean) as UserRanking[];
                } else if (sortCriteria === 'mayorGanancia') {
                    const userMap = new Map<number, UserRanking>();

                    topJugadasByReturn.forEach(jugada => {
                        if (!jugada.cliente || !jugada.cliente.usuario) {
                            console.warn("Jugada sin cliente o usuario:", jugada);
                            return;
                        }

                        const userId = jugada.cliente.usuario.usuarioid;

                        const img = jugada.cliente.usuario.img || null;

                        if (!userMap.has(userId) || jugada.retorno > userMap.get(userId)!.mayorGanancia) {
                            userMap.set(userId, {
                                usuarioid: userId,
                                nombre: jugada.cliente.usuario.nombre || "Usuario",
                                apellido: jugada.cliente.usuario.apellido || "",
                                img: img,
                                gananciaNeta: 0,
                                partidasJugadas: 0,
                                balance: 0,
                                promedioRetorno: 0,
                                mayorGanancia: jugada.retorno || 0
                            });
                        }
                    });

                    leaderboardData = Array.from(userMap.values());
                }

                const sortedRankings = sortRankings(leaderboardData, sortCriteria, isAscending);

                setRankings(sortedRankings.slice(0, limit));
                setLoading(false);
            } catch (err) {
                console.error('Error al cargar datos de leaderboard:', err);
                setError('No se pudieron cargar los datos de clasificación');
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, [
        contextLoading,
        contextError,
        topPlayersByBalance,
        topPlayersByPlays,
        topPlayersByAverageReturn,
        topJugadasByReturn,
        fetchAllLeaderboards,
        sortCriteria,
        isAscending,
        limit
    ]);

    const sortRankings = (data: UserRanking[], criteria: string, ascending: boolean): UserRanking[] => {
        return [...data].sort((a, b) => {
            const valueA = a[criteria as keyof UserRanking] as number;
            const valueB = b[criteria as keyof UserRanking] as number;
            return ascending ? valueA - valueB : valueB - valueA;
        });
    };

    const handleSortChange = (criteria: 'gananciaNeta' | 'partidasJugadas' | 'balance' | 'promedioRetorno' | 'mayorGanancia') => {
        if (sortCriteria === criteria) {
            setIsAscending(!isAscending);
        } else {
            setSortCriteria(criteria);
            setIsAscending(false);
        }
    };

    // Función para obtener el nombre descriptivo del criterio de clasificación
    const getSortCriteriaLabel = (criteria: string): string => {
        switch (criteria) {
            case 'gananciaNeta': return 'Ganancia Neta';
            case 'partidasJugadas': return 'Partidas';
            case 'balance': return 'Balance';
            case 'promedioRetorno': return 'Promedio Retorno';
            case 'mayorGanancia': return 'Mayor Ganancia';
            default: return criteria;
        }
    };

    if (loading || contextLoading) {
        return <div className="leaderboard-loading">Cargando clasificaciones...</div>;
    }

    if (error || contextError) {
        return <div className="leaderboard-error">{error || contextError}</div>;
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2 className="leaderboard-title">Tabla de Clasificación</h2>
                
                {compact ? (
                    <div className="leaderboard-filters-compact">
                        <select 
                            className="filter-dropdown"
                            value={sortCriteria}
                            onChange={(e) => handleSortChange(e.target.value as any)}
                        >
                            <option value="gananciaNeta">Ganancia Neta</option>
                            <option value="partidasJugadas">Partidas</option>
                            <option value="balance">Balance</option>
                            <option value="promedioRetorno">Promedio Retorno</option>
                            <option value="mayorGanancia">Mayor Ganancia</option>
                        </select>
                        <button 
                            className="order-btn"
                            onClick={() => setIsAscending(!isAscending)}
                        >
                            {isAscending ? '↑' : '↓'}
                        </button>
                    </div>
                ) : (
                    <div className="leaderboard-filters">
                        <button
                            className={`filter-btn ${sortCriteria === 'gananciaNeta' ? 'active' : ''}`}
                            onClick={() => handleSortChange('gananciaNeta')}
                        >
                            Ganancia Neta {sortCriteria === 'gananciaNeta' && (isAscending ? '↑' : '↓')}
                        </button>
                        <button
                            className={`filter-btn ${sortCriteria === 'partidasJugadas' ? 'active' : ''}`}
                            onClick={() => handleSortChange('partidasJugadas')}
                        >
                            Partidas {sortCriteria === 'partidasJugadas' && (isAscending ? '↑' : '↓')}
                        </button>
                        <button
                            className={`filter-btn ${sortCriteria === 'balance' ? 'active' : ''}`}
                            onClick={() => handleSortChange('balance')}
                        >
                            Balance {sortCriteria === 'balance' && (isAscending ? '↑' : '↓')}
                        </button>
                        <button
                            className={`filter-btn ${sortCriteria === 'promedioRetorno' ? 'active' : ''}`}
                            onClick={() => handleSortChange('promedioRetorno')}
                        >
                            Promedio Retorno {sortCriteria === 'promedioRetorno' && (isAscending ? '↑' : '↓')}
                        </button>
                        <button
                            className={`filter-btn ${sortCriteria === 'mayorGanancia' ? 'active' : ''}`}
                            onClick={() => handleSortChange('mayorGanancia')}
                        >
                            Mayor Ganancia {sortCriteria === 'mayorGanancia' && (isAscending ? '↑' : '↓')}
                        </button>
                    </div>
                )}
            </div>

            <div className="leaderboard-table">
                <div className="leaderboard-table-header">
                    <div className="rank-column">Pos.</div>
                    <div className="user-column">Jugador</div>
                    <div className="stat-column">
                        {getSortCriteriaLabel(sortCriteria)}
                        <span className="order-indicator">{isAscending ? ' ↑' : ' ↓'}</span>
                    </div>
                </div>

                <div className="leaderboard-table-body">
                    {rankings.length > 0 ? (
                        rankings.map((ranking, index) => (
                            <div
                                key={`${ranking.usuarioid}-${index}-${sortCriteria}`}
                                className={`leaderboard-row ${user?.usuarioid ===
                                ranking.usuarioid ? 'current-user' : ''}`}>
                                <div className="rank-column">{index + 1}</div>
                                <div className="user-column">
                                    <div className="user-avatar">
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
                                                        div.className = 'default-avatar';
                                                        div.textContent = `${ranking.nombre.charAt(0)}${ranking.apellido.charAt(0)}`;
                                                        parent.appendChild(div);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="default-avatar">
                                                {ranking.nombre ? ranking.nombre.charAt(0) : ''}
                                                {ranking.apellido ? ranking.apellido.charAt(0) : ''}
                                            </div>
                                        )}
                                    </div>
                                    <span className="user-name">{ranking.nombre} {ranking.apellido}</span>
                                </div>
                                <div className="stat-column">
                                    {sortCriteria === 'gananciaNeta' && (
                                        <span className={ranking.gananciaNeta >= 0 ? 'positive' : 'negative'}>
                                            {ranking.gananciaNeta >= 0 ? '+' : ''}{ranking.gananciaNeta} AC
                                        </span>
                                    )}
                                    {sortCriteria === 'partidasJugadas' && (
                                        <span>{ranking.partidasJugadas}</span>
                                    )}
                                    {sortCriteria === 'balance' && (
                                        <span className={ranking.balance >= 0 ? 'positive' : 'negative'}>
                                            {ranking.balance >= 0 ? '+' : ''}{ranking.balance} AC
                                        </span>
                                    )}
                                    {sortCriteria === 'promedioRetorno' && (
                                        <span className={ranking.promedioRetorno >= 0 ? 'positive' : 'negative'}>
                                            {ranking.promedioRetorno >= 0 ? '+' : ''}{ranking.promedioRetorno} AC
                                        </span>
                                    )}
                                    {sortCriteria === 'mayorGanancia' &&
                                        <span className="positive">+{ranking.mayorGanancia} AC</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-leaderboard">No hay datos disponibles para mostrar en la
                            clasificación</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderBoard;
