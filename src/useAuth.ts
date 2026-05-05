import { useState, useCallback } from 'react';
import { login as apiLogin } from './api';

const TOKEN_KEY = 'antyp_hub_token';
const PREF_FLAG_KEY = 'antyp_hub_pref';
const PREF_CREDS_KEY = 'antyp_hub_pref_creds';
const OBF_KEY = 'AntypHub-2026';

export type Creds = { email: string; password: string };

function obfuscate(input: string): string {
    const bytes = new TextEncoder().encode(input);
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
        out += String.fromCharCode(bytes[i] ^ OBF_KEY.charCodeAt(i % OBF_KEY.length));
    }
    return btoa(out);
}

function deobfuscate(input: string): string {
    const raw = atob(input);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i) ^ OBF_KEY.charCodeAt(i % OBF_KEY.length);
    }
    return new TextDecoder().decode(bytes);
}

function readSavedCreds(): Creds | null {
    const raw = localStorage.getItem(PREF_CREDS_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(deobfuscate(raw));
    } catch {
        return null;
    }
}

export function useAuth() {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [sessionCreds, setSessionCreds] = useState<Creds | null>(null);
    const [prefEnabled, setPrefEnabled] = useState<boolean>(() => localStorage.getItem(PREF_FLAG_KEY) === '1');

    const saveToken = useCallback((t: string, creds?: Creds) => {
        localStorage.setItem(TOKEN_KEY, t);
        setToken(t);
        if (creds) setSessionCreds(creds);
    }, []);

    const clearPref = useCallback(() => {
        localStorage.removeItem(PREF_FLAG_KEY);
        localStorage.removeItem(PREF_CREDS_KEY);
        setPrefEnabled(false);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setSessionCreds(null);
        clearPref();
    }, [clearPref]);

    const enablePrefAccess = useCallback((): boolean => {
        if (!sessionCreds) return false;
        localStorage.setItem(PREF_CREDS_KEY, obfuscate(JSON.stringify(sessionCreds)));
        localStorage.setItem(PREF_FLAG_KEY, '1');
        setPrefEnabled(true);
        return true;
    }, [sessionCreds]);

    const disablePrefAccess = useCallback(() => {
        clearPref();
    }, [clearPref]);

    const tryAutoLogin = useCallback(async (): Promise<boolean> => {
        const creds = readSavedCreds();
        if (!creds) return false;
        try {
            const t = await apiLogin(creds.email, creds.password);
            localStorage.setItem(TOKEN_KEY, t);
            setToken(t);
            setSessionCreds(creds);
            return true;
        } catch (err) {
            // Auth-style failures (server replied "wrong creds") clear pref.
            // Network failures (TypeError from fetch) keep pref so user can retry next launch.
            if (!(err instanceof TypeError)) {
                localStorage.removeItem(PREF_FLAG_KEY);
                localStorage.removeItem(PREF_CREDS_KEY);
                setPrefEnabled(false);
            }
            return false;
        }
    }, []);

    const handleAuthExpired = useCallback(async (): Promise<boolean> => {
        const ok = await tryAutoLogin();
        if (!ok) logout();
        return ok;
    }, [tryAutoLogin, logout]);

    return {
        token,
        prefEnabled,
        sessionCreds,
        saveToken,
        logout,
        enablePrefAccess,
        disablePrefAccess,
        tryAutoLogin,
        handleAuthExpired,
    };
}
