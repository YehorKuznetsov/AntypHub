const API_BASE_URL = 'https://api.danilapainter.studio';

export async function login(email: string, password: string): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, twoFactorCode: '' }),
    });

    if (!res.ok) {
        let message = 'Помилка входу';
        try {
            const data = await res.json();
            message = data.errors?.message || data.message || `Помилка входу (${res.status})`;
        } catch {
            message = res.statusText || `Помилка входу (${res.status})`;
        }
        throw new Error(message);
    }

    const result = await res.json();
    const accessToken = result.result?.accessToken;
    if (!accessToken) throw new Error('Помилка авторизації');
    return accessToken;
}

export async function getCurrentGateLink(token: string): Promise<string | null> {
    const res = await fetch(`${API_BASE_URL}/api/gate/current`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error('unauthorized');
        throw new Error('Не вдалося отримати посилання');
    }

    const data = await res.json();
    return data.result ?? null;
}
