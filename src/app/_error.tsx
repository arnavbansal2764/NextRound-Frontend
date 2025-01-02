'use client';

import React from 'react';

interface ErrorProps {
    error: Error;
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Something went wrong!</h1>
            <p>{error.message || 'An unexpected error occurred.'}</p>
            <button
                onClick={() => reset()} // Retry the rendering
                style={{
                    padding: '10px 20px',
                    marginTop: '20px',
                    backgroundColor: '#0070f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Retry
            </button>
        </div>
    );
}
