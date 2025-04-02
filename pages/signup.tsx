import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSignup = () => {
        if (!username || !email || !password || !confirmPassword) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (storedUsers.some(user => user.username === username)) {
            alert('Usuário já existe.');
            return;
        }

        const newUser = { username, email, password };
        localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
        alert('Cadastro realizado com sucesso!');
        router.push('/login');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-blue-600">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img src="/img/logo.png" alt="Logo" className="h-16" />
                </div>
                <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>
                <p className="text-center text-gray-500 mb-6">Preencha os campos para se cadastrar</p>
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
                    <label className="block text-gray-700 mb-2">E-mail</label>
                    <input
                        type="email"
                        className="w-full p-3 border rounded bg-gray-100"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Confirmar Senha</label>
                    <input
                        type="password"
                        className="w-full p-3 border rounded bg-gray-100"
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleSignup}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded transition"
                >
                    Cadastrar
                </button>
                <div className="text-center mt-4">
                    <p className="text-gray-500">
                        Já tem uma conta?{' '}
                        <button className="text-blue-500 hover:underline" onClick={() => router.push('/login')}>
                            Faça login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
