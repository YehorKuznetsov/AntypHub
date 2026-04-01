import './App.css';
import { useAuth } from './useAuth';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import UpdateModal from './UpdateModal';

function App() {
    const { token, saveToken, logout } = useAuth();

    return (
        <>
            <UpdateModal />
            {!token ? (
                <LoginPage onLogin={saveToken} />
            ) : (
                <DashboardPage token={token} onLogout={logout} />
            )}
        </>
    );
}

export default App;
