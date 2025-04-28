import React, { useState, useEffect } from 'react';
import Sidebar from '@components/SideBar.tsx';
import { useHistory } from '@context/HistoryContext';
import { useAuth } from '@context/AuthContext';
import '@css/StatisticStyle.css';
import '@css/ProfileStyle.css'
import mineImg from '@assets/mines.jpg';
import rouletteImg from '@assets/ruleta.jpg';

interface GameStats {
  juegoid: number;
  nombre: string;
  totalJugadas: number;
  ganadas: number;
  perdidas: number;
  gananciaNeta: number;
  apuestaPromedio: number;
}

const StatisticsPage: React.FC = () => {
  const { fullHistory, loading, error, getAllUserHistory } = useHistory();
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalJugadas: 0,
    gananciaNeta: 0,
    mayorGanancia: 0,
    mayorPerdida: 0,
    racha: 0,
    mayorRacha: 0
  });

  // Cargar datos completos cuando la página se monta
  useEffect(() => {
    if (user?.usuarioid) {
      getAllUserHistory(user.usuarioid).catch(error =>
          console.error("Error al cargar el historial completo:", error)
      );
    }
  }, [user, getAllUserHistory]);

  // Calcular estadísticas cuando el historial completo cambia
  useEffect(() => {
    if (fullHistory) {
      // Procesar estadísticas por juego
      const gameStats: GameStats[] = Object.entries(fullHistory).map(([juegoid, data]: [string, any]) => {
        const jugadas = data.jugadas || [];
        // Modificación: consideramos ganadas solo cuando retorno > apuesta
        const ganadas = jugadas.filter((j: any) => j.retorno > j.apuesta).length;
        // Modificación: consideramos perdidas cuando retorno <= apuesta (incluye 0)
        const perdidas = jugadas.filter((j: any) => j.retorno <= j.apuesta).length;
        const gananciaNeta = jugadas.reduce((sum: number, j: any) => sum + (j.retorno - j.apuesta), 0);
        const apuestaTotal = jugadas.reduce((sum: number, j: any) => sum + j.apuesta, 0);

        return {
          juegoid: parseInt(juegoid),
          nombre: data.juego.nombre,
          totalJugadas: jugadas.length,
          ganadas,
          perdidas,
          gananciaNeta,
          apuestaPromedio: jugadas.length > 0 ? apuestaTotal / jugadas.length : 0
        };
      });

      // Filtrar juegos que no tienen jugadas
      const statsConJugadas = gameStats.filter(game => game.totalJugadas > 0);

      // Calcular estadísticas globales
      const todasLasJugadas = Object.values(fullHistory).flatMap((data: any) => data.jugadas || []);
      const gananciaNeta = todasLasJugadas.reduce((sum, j: any) => sum + (j.retorno - j.apuesta), 0);

      // Encontrar mayor ganancia y pérdida
      let mayorGanancia = 0;
      let mayorPerdida = 0;
      todasLasJugadas.forEach((j: any) => {
        const resultado = j.retorno - j.apuesta;
        if (resultado > mayorGanancia) mayorGanancia = resultado;
        if (resultado < mayorPerdida) mayorPerdida = resultado;
      });

      // Calcular la racha actual y la mayor racha de victorias
      // Ordenar las jugadas por fecha (de más antigua a más reciente)
      const jugadasOrdenadas = [...todasLasJugadas].sort((a, b) =>
          new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );

      let rachaActual = 0;
      let mayorRacha = 0;

      jugadasOrdenadas.forEach((j: any) => {
        // Modificación: consideramos victoria solo cuando retorno > apuesta
        const resultado = j.retorno - j.apuesta;
        if (resultado > 0) {
          // Victoria
          rachaActual++;
          if (rachaActual > mayorRacha) {
            mayorRacha = rachaActual;
          }
        } else {
          // Derrota (ahora incluye cuando retorno = 0)
          rachaActual = 0;
        }
      });

      setStats(statsConJugadas);
      setTotalStats({
        totalJugadas: todasLasJugadas.length,
        gananciaNeta,
        mayorGanancia,
        mayorPerdida,
        racha: rachaActual,
        mayorRacha
      });
    }
  }, [fullHistory]);

  // Imágenes para cada juego
  const gameImages: { [key: string]: string } = {
    '1': mineImg,
    '2': rouletteImg,
    // Agregar más juegos según sea necesario
  };

  if (loading) {
    return (
        <div className="container">
          <Sidebar />
          <main className="main-content">
            <div className="history-loading">Cargando estadísticas...</div>
          </main>
        </div>
    );
  }

  if (error) {
    return (
        <div className="container">
          <Sidebar />
          <main className="main-content">
            <div className="history-error">Error: {error}</div>
          </main>
        </div>
    );
  }

  return (
      <div className="container">
        <Sidebar />
        <main className="main-content">
          <header className="content-header">
            <h1>Estadísticas</h1>
          </header>

          {stats.length > 0 ? (
              <>
                {/* Resumen global */}
                <div className="profile-stats-section">
                  <h2>Resumen General</h2>
                  <div className="stats-summary">
                    <div className="stat-card">
                      <div className="stat-value">{totalStats.totalJugadas}</div>
                      <div className="stat-label">Total Jugadas</div>
                    </div>
                    <div className="stat-card">
                      <div className={`stat-value ${totalStats.gananciaNeta >= 0 ? 'positive' : 'negative'}`}>
                        {totalStats.gananciaNeta >= 0 ? '+' : ''}{totalStats.gananciaNeta.toFixed(2)} AC
                      </div>
                      <div className="stat-label">Ganancia Neta</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value positive">+{totalStats.mayorGanancia.toFixed(2)} AC</div>
                      <div className="stat-label">Mayor Ganancia</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value negative">{totalStats.mayorPerdida.toFixed(2)} AC</div>
                      <div className="stat-label">Mayor Pérdida</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{totalStats.mayorRacha}</div>
                      <div className="stat-label">Mayor Racha</div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas por juego */}
                {stats.map(gameStat => (
                    <div key={gameStat.juegoid} className="profile-stats-section">
                      <div className="game-stats-header">
                        <img
                            src={gameImages[gameStat.juegoid.toString()] || '/images/default-game.png'}
                            alt={gameStat.nombre}
                            className="game-thumbnail"
                        />
                        <h2>{gameStat.nombre}</h2>
                      </div>

                      <div className="game-stats-details">
                        <div className="stats-row">
                          <div className="stat-item">
                            <span className="stat-label">Partidas jugadas:</span>
                            <span className="stat-value">{gameStat.totalJugadas}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Ganadas:</span>
                            <span className="stat-value">{gameStat.ganadas}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Perdidas:</span>
                            <span className="stat-value">{gameStat.perdidas}</span>
                          </div>
                        </div>

                        <div className="stats-row">
                          <div className="stat-item">
                            <span className="stat-label">Ganancia neta:</span>
                            <span className={`stat-value ${gameStat.gananciaNeta >= 0 ? 'positive' : 'negative'}`}>
                              {gameStat.gananciaNeta >= 0 ? '+' : ''}{gameStat.gananciaNeta.toFixed(2)} AC
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Apuesta promedio:</span>
                            <span className="stat-value">{gameStat.apuestaPromedio.toFixed(2)} AC</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Efectividad:</span>
                            <span className="stat-value">
                              {gameStat.totalJugadas > 0
                                  ? ((gameStat.ganadas / gameStat.totalJugadas) * 100).toFixed(1)
                                  : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Gráfico de rendimiento (representación visual simple) */}
                      <div className="performance-graph">
                        <div className="graph-title">Rendimiento</div>
                        <div className="graph-bar-container">
                          <div
                              className="graph-bar positive"
                              style={{width: `${(gameStat.ganadas / Math.max(gameStat.totalJugadas, 1)) * 100}%`}}
                          >
                            {Math.round((gameStat.ganadas / Math.max(gameStat.totalJugadas, 1)) * 100)}%
                          </div>
                          <div
                              className="graph-bar negative"
                              style={{width: `${(gameStat.perdidas / Math.max(gameStat.totalJugadas, 1)) * 100}%`}}
                          >
                            {Math.round((gameStat.perdidas / Math.max(gameStat.totalJugadas, 1)) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </>
          ) : (
              <div className="empty-stats">
                Aún no tienes estadísticas de juego. ¡Juega para empezar a registrar tu actividad!
              </div>
          )}
        </main>
      </div>
  );
};

export default StatisticsPage;