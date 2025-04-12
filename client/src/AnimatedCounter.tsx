import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
    end: number;
    duration?: number; // en milisegundos
    prefix?: string;
    loop?: boolean;
    delayBetweenLoops?: number; // nueva prop: tiempo entre loops
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
                                                             end,
                                                             duration = 3000,
                                                             prefix = '',
                                                             loop = true,
                                                             delayBetweenLoops = 5000, // valor por defecto: 2s
                                                         }) => {
    const [count, setCount] = useState(0);
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>();
    const timeoutRef = useRef<NodeJS.Timeout>();

    const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
            startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(progress * end);

        setCount(value);

        if (progress < 1) {
            requestRef.current = requestAnimationFrame(animate);
        } else if (loop) {
            timeoutRef.current = setTimeout(() => {
                startTimeRef.current = undefined;
                setCount(0);
                requestRef.current = requestAnimationFrame(animate);
            }, delayBetweenLoops);
        }
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [end, duration, loop, delayBetweenLoops]);

    return <span>{prefix}{count.toLocaleString()}</span>;
};

export default AnimatedCounter;
