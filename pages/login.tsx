import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'success' | 'error' | null>(null);
    const router = useRouter();

    const superUser = {
        username: 'admin',
        password: 'supersecret',
    };

    const handleLogin = () => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const isSuperUser = username === superUser.username && password === superUser.password;

        if (isSuperUser || storedUsers.some(user => user.username === username && user.password === password)) {
            localStorage.setItem('authenticatedUser', username); // Store authenticated user
            setStatus('success');
            setTimeout(() => {
                router.push('/');
            }, 1000); // Redirect after animation
        } else {
            setStatus('error');
            setTimeout(() => setStatus(null), 1000); // Reset animation
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-600">
            <div
                className={`bg-white rounded-lg shadow-lg p-8 w-full max-w-md transition-transform ${
                    status === 'error' ? 'animate-shake' : ''
                }`}
            >
                <div className="flex justify-center mb-6">
                    <img src="/img/logo.png" alt="Logo" className="h-16" />
                </div>
                <h1 className="text-2xl font-bold text-center mb-6">Bem-vindo</h1>
                <p className="text-center text-gray-500 mb-6">Faça login para continuar</p>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Usuário</label>
                    <input
                        type="text"
                        className="w-full p-3 border rounded bg-gray-100"
                        placeholder="Digite seu usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Senha</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full p-3 border rounded bg-gray-100"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center text-gray-700">
                        <input type="checkbox" className="mr-2" />
                        Lembrar-me
                    </label>
                    <button className="text-blue-500 hover:underline text-sm">Esqueceu a senha?</button>
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded transition"
                >
                    Entrar
                </button>
                {status === 'success' && (
                    <div className="flex justify-center items-center mt-4">
                        <div className="text-green-500 text-3xl animate-bounce">✔</div>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex justify-center items-center mt-4">
                        <div className="text-red-500 text-3xl">✖</div>
                    </div>
                )}
                <div className="text-center mt-4">
                    <p className="text-gray-500">Ou entre com</p>
                    <button className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded">
                        Entrar com outra conta
                    </button>
                </div>
                <div className="text-center mt-4">
                    <p className="text-gray-500">
                        Não tem uma conta?{' '}
                        <button className="text-blue-500 hover:underline" onClick={() => router.push('/signup')}>
                            Cadastre-se
                        </button>
                    </p>
                </div>
            </div>
            <style jsx>{`
                @keyframes shake {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    50% {
                        transform: translateX(5px);
                    }
                    75% {
                        transform: translateX(-5px);
                    }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
