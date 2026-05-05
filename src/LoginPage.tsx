import { useState, useEffect, useRef, FormEvent } from 'react';
import { login } from './api';
import { getRecentEmails, saveRecentEmail } from './recentEmails';

interface Props {
    onLogin: (token: string, creds: { email: string; password: string }) => void;
}

export default function LoginPage({ onLogin }: Props) {
    const [recentEmails, setRecentEmails] = useState<string[]>([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const list = getRecentEmails();
        setRecentEmails(list);
        if (list.length > 0) {
            setEmail(list[0]);
            passwordRef.current?.focus();
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const trimmed = email.trim();
            const token = await login(trimmed, password);
            saveRecentEmail(trimmed);
            onLogin(token, { email: trimmed, password });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <h1>Antyp Hub</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    list="antyp-hub-recent-emails"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus={recentEmails.length === 0}
                />
                {recentEmails.length > 0 && (
                    <datalist id="antyp-hub-recent-emails">
                        {recentEmails.map((e) => <option key={e} value={e} />)}
                    </datalist>
                )}
                <input
                    ref={passwordRef}
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Вхід...' : 'Увійти'}
                </button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}
