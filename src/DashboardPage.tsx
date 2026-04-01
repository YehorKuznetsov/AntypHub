import { useState, useEffect, useCallback } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { getCurrentGateLink } from './api';

interface Props {
    token: string;
    onLogout: () => void;
}

export default function DashboardPage({ token, onLogout }: Props) {
    const [link, setLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchLink = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getCurrentGateLink(token);
            setLink(result);
        } catch (err: any) {
            if (err.message === 'unauthorized') {
                onLogout();
                return;
            }
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, onLogout]);

    useEffect(() => {
        fetchLink();
    }, [fetchLink]);

    const handleCopy = async () => {
        if (!link) return;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpen = async () => {
        if (!link) return;
        await openUrl(link);
    };

    return (
        <div className="page">
            <div className="header">
                <h1>Antyp Hub</h1>
                <button className="logout-btn" onClick={onLogout}>Вийти</button>
            </div>

            <div className="card">
                <h2>Посилання на адмінку</h2>
                {loading && <p className="muted">Завантаження...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && !link && <p className="muted">Посилання ще не згенеровано</p>}
                {link && (
                    <>
                        <div className="link-box">
                            <code>{link}</code>
                        </div>
                        <div className="actions">
                            <button onClick={handleCopy}>
                                {copied ? 'Скопійовано!' : 'Копіювати'}
                            </button>
                            <button onClick={handleOpen}>Відкрити</button>
                            <button className="refresh-btn" onClick={fetchLink}>Оновити</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
