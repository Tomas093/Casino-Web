import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
    end: number;
    duration?: number; // en milisegundos
    prefix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, duration = 3000, prefix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, );
            const value = Math.floor(progress * end);

            setCount(value);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{prefix}{count.toLocaleString()}</span>;
};

export default AnimatedCounter;
