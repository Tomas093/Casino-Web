import React from 'react';

interface StatusIndicatorProps {
    status: 'online' | 'offline' | 'maintenance';
    label: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
    return (
        <div className={`status-indicator status-${status}`}>
            <div className="status-dot"></div>
            <span>{label}</span>
        </div>
    );
};

export default StatusIndicator;