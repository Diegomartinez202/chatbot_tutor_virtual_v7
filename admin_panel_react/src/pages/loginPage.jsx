import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import { Button } from "@/components/ui/button";
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await loginApi(email, password);
            if (res?.access_token) {
                login(res.access_token, () => navigate('/dashboard'));
            } else {
                setError('Credenciales inválidas o error del servidor.');
            }
        } catch (err) {
            setError(err?.message || 'Error de red, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">🔐 Iniciar sesión</h2>
            <form onSubmit={handleLogin} aria-describedby="login-error">
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                />
                <Input
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />
                <Button type="submit" disabled={loading} aria-busy={loading}>
                    {loading ? 'Ingresando...' : 'Ingresar'}
                </Button>
            </form>
            {error && (
                <p id="login-error" className="text-red-600 mt-2" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default LoginPage;