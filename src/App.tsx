import { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './useAuth';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import SettingsPage from './SettingsPage';
import UpdateModal from './UpdateModal';

function App() {
    const auth = useAuth();
    const [bootstrapping, setBootstrapping] = useState<boolean>(auth.prefEnabled && !auth.token);
    const [page, setPage] = useState<'dashboard' | 'settings'>('dashboard');

    useEffect(() => {
        if (!bootstrapping) return;
        let cancelled = false;
        (async () => {
            await auth.tryAutoLogin();
            if (!cancelled) setBootstrapping(false);
        })();
        return () => { cancelled = true; };
    }, []);

    if (bootstrapping) {
        return (
            <div className="page">
                <p className="muted">Завантаження...</p>
            </div>
        );
    }

    return (
        <>
            <UpdateModal />
            {!auth.token ? (
                <LoginPage onLogin={auth.saveToken} />
            ) : page === 'settings' ? (
                <SettingsPage
                    prefEnabled={auth.prefEnabled}
                    canEnable={!!auth.sessionCreds}
                    onEnable={auth.enablePrefAccess}
                    onDisable={auth.disablePrefAccess}
                    onClose={() => setPage('dashboard')}
                />
            ) : (
                <DashboardPage
                    token={auth.token}
                    onLogout={auth.logout}
                    onAuthExpired={auth.handleAuthExpired}
                    onOpenSettings={() => setPage('settings')}
                />
            )}
        </>
    );
}

export default App;
