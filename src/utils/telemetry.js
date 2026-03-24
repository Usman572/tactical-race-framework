let latencyData = {
    lastLatency: 0,
    history: []
};

const listeners = new Set();

export const trackLatency = (ms) => {
    latencyData.lastLatency = ms;
    latencyData.history.push(ms);
    if (latencyData.history.length > 20) latencyData.history.shift();
    listeners.forEach(l => l(latencyData));
};

export const subscribeToTelemetry = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

export const getTelemetry = () => latencyData;

// Wrapper for fetch to track latency
export const measureFetch = async (url, options) => {
    const start = performance.now();
    try {
        const response = await fetch(url, options);
        const end = performance.now();
        trackLatency(Math.round(end - start));
        return response;
    } catch (err) {
        const end = performance.now();
        trackLatency(Math.round(end - start));
        throw err;
    }
};
