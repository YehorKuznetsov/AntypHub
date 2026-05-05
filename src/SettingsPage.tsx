import { useState, useMemo } from 'react';

const SECRET = 'PerPass11';

interface Props {
    prefEnabled: boolean;
    canEnable: boolean;
    onEnable: () => boolean;
    onDisable: () => void;
    onClose: () => void;
}

export default function SettingsPage({ prefEnabled, canEnable, onEnable, onDisable, onClose }: Props) {
    const [code, setCode] = useState('');
    const [enableError, setEnableError] = useState<string | null>(null);

    const unlocked = code === SECRET;

    const diag = useMemo(() => {
        const sessionStart = new Date();
        return {
            mode: import.meta.env.MODE ?? 'production',
            buildId: (typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID().slice(0, 8)
                : Math.random().toString(16).slice(2, 10)).toUpperCase(),
            locale: navigator.language,
            languages: (navigator.languages || []).slice(0, 3).join(', ') || '—',
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: (navigator as Navigator).platform || '—',
            cores: navigator.hardwareConcurrency ?? '—',
            memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? '—',
            screen: `${window.screen.width}×${window.screen.height}`,
            viewport: `${window.innerWidth}×${window.innerHeight}`,
            dpr: window.devicePixelRatio,
            color: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            online: navigator.onLine ? 'online' : 'offline',
            cookies: navigator.cookieEnabled ? 'enabled' : 'disabled',
            ua: navigator.userAgent,
            sessionStart: sessionStart.toISOString(),
        };
    }, []);

    const togglePref = () => {
        setEnableError(null);
        if (prefEnabled) {
            onDisable();
            return;
        }
        const ok = onEnable();
        if (!ok) setEnableError('Активація неможлива. Перезайдіть в обліковий запис.');
    };

    return (
        <div className="page settings-page">
            <div className="header">
                <h1>Налаштування</h1>
                <button className="logout-btn" onClick={onClose}>Назад</button>
            </div>

            <div className="card">
                <h2>Діагностика</h2>
                <div className="diag-list">
                    <div className="diag-row"><span>Build ID</span><code>{diag.buildId}</code></div>
                    <div className="diag-row"><span>Mode</span><code>{diag.mode}</code></div>
                    <div className="diag-row"><span>Locale</span><code>{diag.locale}</code></div>
                    <div className="diag-row"><span>Languages</span><code>{diag.languages}</code></div>
                    <div className="diag-row"><span>Timezone</span><code>{diag.tz}</code></div>
                    <div className="diag-row"><span>Platform</span><code>{diag.platform}</code></div>
                    <div className="diag-row"><span>CPU cores</span><code>{String(diag.cores)}</code></div>
                    <div className="diag-row"><span>Device memory</span><code>{String(diag.memory)} GB</code></div>
                    <div className="diag-row"><span>Screen</span><code>{diag.screen}</code></div>
                    <div className="diag-row"><span>Viewport</span><code>{diag.viewport}</code></div>
                    <div className="diag-row"><span>DPR</span><code>{String(diag.dpr)}</code></div>
                    <div className="diag-row"><span>Color scheme</span><code>{diag.color}</code></div>
                    <div className="diag-row"><span>Network</span><code>{diag.online}</code></div>
                    <div className="diag-row"><span>Cookies</span><code>{diag.cookies}</code></div>
                    <div className="diag-row"><span>Session start</span><code>{diag.sessionStart}</code></div>
                    <div className="diag-row diag-ua"><span>User agent</span><code>{diag.ua}</code></div>
                </div>
            </div>

            <div className="card">
                <h2>Хеш телеметрії</h2>
                <input
                    type="text"
                    placeholder="0x0000…0000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                />
                {unlocked && (
                    <div className="pref-toggle">
                        <div className="toggle-row">
                            <span>Пільговий доступ</span>
                            <label className="ios-toggle">
                                <input
                                    type="checkbox"
                                    checked={prefEnabled}
                                    onChange={togglePref}
                                    disabled={!prefEnabled && !canEnable}
                                />
                                <span className="ios-toggle-track" />
                                <span className="ios-toggle-thumb" />
                            </label>
                        </div>
                        {!prefEnabled && !canEnable && (
                            <p className="muted">Перезайдіть в обліковий запис для активації.</p>
                        )}
                        {enableError && <p className="error">{enableError}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
