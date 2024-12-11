import React from 'react';
import './UserStyle.css';

function SessionControls({ setUserSelection }) {
    const actions = [
        { label: 'Clock In',    action: 'clock-in' },
        { label: 'Start Break', action: 'break-in' },
        { label: 'Clock Out',   action: 'clock-out' },
        { label: 'End Break',   action: 'break-out' },
    ];

    return (
        <div className="session-control">
            {actions.map(({ label, action }) => (
                <button
                    key={action}
                    className="session-control-button"
                    onClick={() => setUserSelection(action)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export default SessionControls;