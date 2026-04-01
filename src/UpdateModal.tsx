import { useState, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

interface UpdateInfo {
    version: string;
    body: string | undefined;
}

export default function UpdateModal() {
    const [update, setUpdate] = useState<UpdateInfo | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkForUpdate();
        const interval = setInterval(checkForUpdate, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    async function checkForUpdate() {
        try {
            const result = await check();
            if (result) {
                setUpdate({ version: result.version, body: result.body });
            }
        } catch {
            // silently ignore check errors
        }
    }

    async function handleUpdate() {
        setDownloading(true);
        setError(null);
        try {
            const result = await check();
            if (!result) return;

            let totalBytes = 0;
            let downloadedBytes = 0;

            await result.downloadAndInstall((event) => {
                if (event.event === 'Started' && event.data.contentLength) {
                    totalBytes = event.data.contentLength;
                } else if (event.event === 'Progress') {
                    downloadedBytes += event.data.chunkLength;
                    if (totalBytes > 0) {
                        setProgress(Math.round((downloadedBytes / totalBytes) * 100));
                    }
                }
            });

            await relaunch();
        } catch (err: any) {
            setError(err.message || 'Помилка оновлення');
            setDownloading(false);
        }
    }

    if (!update) return null;

    return (
        <div className="update-overlay">
            <div className="update-modal">
                <h2>Доступне оновлення</h2>
                <p className="update-version">v{update.version}</p>
                {update.body && <p className="update-body">{update.body}</p>}

                {downloading ? (
                    <div className="update-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="progress-text">{progress}%</p>
                    </div>
                ) : (
                    <button className="update-btn" onClick={handleUpdate}>
                        Оновити
                    </button>
                )}

                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}
