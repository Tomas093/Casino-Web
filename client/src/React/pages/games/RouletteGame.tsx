import React, { useState } from 'react';
import { RouletteWheel, RouletteTable, useRoulette, ChipList } from 'react-casino-roulette';
import 'react-casino-roulette/dist/index.css';

import whiteChip from '@assets/Javo.jpg';
import blueChip from '@assets/Javo.jpg';
import blackChip from '@assets/Javo.jpg';
import cyanChip from '@assets/Javo.jpg';

const chips = {
    '1': whiteChip,
    '10': blueChip,
    '100': blackChip,
    '500': cyanChip,
};

const RouletteGame: React.FC = () => {
    const [selectedChip, setSelectedChip] = useState('1');
    const [winningBet, setWinningBet] = useState('-1');
    const [wheelStart, setWheelStart] = useState(false);

    const { bets, onBet, clearBets } = useRoulette();

    const handleSpin = () => {
        setWinningBet(String(Math.floor(Math.random() * 37))); // random entre 0 y 36
        setWheelStart(true);
    };

    const handleEndSpin = (winner: string) => {
        alert(`La bola cayó en ${winner}`);
        setWheelStart(false);
        clearBets();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <ChipList
                chips={chips}
                selectedChip={selectedChip}
                onChipPressed={setSelectedChip}
            />

            <RouletteTable
                chips={chips}
                bets={bets}
                onBet={onBet(Number(selectedChip), 'add')}
            />

            <RouletteWheel
                start={wheelStart}
                winningBet={winningBet}
                onSpinningEnd={handleEndSpin}
            />

            <button onClick={handleSpin} disabled={wheelStart}>
                Girar Ruleta
            </button>
        </div>
    );
};

export default RouletteGame;
