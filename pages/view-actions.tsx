import React, { useEffect, useState, useRef } from 'react';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdYXGoHqpxkjxYjNdRFdKaoZqVWsbzFrU",
    authDomain: "db-tw-7391e.firebaseapp.com",
    projectId: "db-tw-7391e",
    storageBucket: "db-tw-7391e.firebasestorage.app",
    messagingSenderId: "848837853895",
    appId: "1:848837853895:web:f5257a45a76591cd0ab4e2",
    measurementId: "G-ZCHN6BG4FP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Task {
    id: number;
    name: string;
    description: string;
    postDate: string;
    dueDate: string;
    type: 'ACAO' | 'MARKETING' | 'R.H' | 'LOJA';
}

export default function ViewActions() {
    const [actionsText, setActionsText] = useState<string>('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isUpdating, setIsUpdating] = useState(false); // Estado para controlar a animação de atualização
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');

    useEffect(() => {
        const docRef = doc(db, 'actions', 'default');

        // Listener em tempo real para atualizações no Firebase
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setActionsText(docSnap.data().text || '');
                triggerUpdateAnimation(); // Dispara a animação ao atualizar
            } else {
                console.log('No actions found in database.');
            }
        });

        return () => unsubscribe(); // Limpa o listener ao desmontar o componente
    }, []);

    useEffect(() => {
        const tasksRef = doc(db, 'tasks', 'default');

        // Listener em tempo real para atualizações nas tarefas
        const unsubscribe = onSnapshot(tasksRef, (docSnap) => {
            if (docSnap.exists()) {
                setTasks(docSnap.data().tasks || []);
                triggerUpdateAnimation(); // Dispara a animação ao atualizar
            } else {
                console.log('No tasks found in database.');
            }
        });

        return () => unsubscribe(); // Limpa o listener ao desmontar o componente
    }, []);

    const triggerUpdateAnimation = () => {
        setIsUpdating(true);
        setTimeout(() => {
            setIsUpdating(false);
            resetScrollAnimation(); // Reinicia a animação de rolagem
        }, 1000); // Remove a animação após 1 segundo
    };

    const resetScrollAnimation = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
            setScrollDirection('down');
        }
    };

    useEffect(() => {
        const scrollInterval = setInterval(() => {
            if (!scrollContainerRef.current) return;

            const container = scrollContainerRef.current;
            const maxScrollTop = container.scrollHeight - container.clientHeight;

            if (scrollDirection === 'down') {
                if (container.scrollTop >= maxScrollTop) {
                    setScrollDirection('up');
                } else {
                    container.scrollTop += 1;
                }
            } else {
                if (container.scrollTop <= 0) {
                    setScrollDirection('down');
                } else {
                    container.scrollTop -= 1;
                }
            }
        }, 50); // Velocidade da rolagem

        return () => clearInterval(scrollInterval);
    }, [scrollDirection]);

    const saveActions = async () => {
        const docRef = doc(db, 'actions', 'default');
        await setDoc(docRef, { text: actionsText });
        alert('Ações salvas com sucesso!');
    };

    const refreshTasks = async () => {
        const tasksRef = doc(db, 'tasks', 'default');
        const docSnap = await getDoc(tasksRef);
        if (docSnap.exists()) {
            setTasks(docSnap.data().tasks || []);
            triggerUpdateAnimation();
        }
    };

    const marketingTasks = tasks.filter(task => task.type === 'MARKETING');
    const rhTasks = tasks.filter(task => task.type === 'R.H');
    const lojaTasks = tasks.filter(task => task.type === 'LOJA');

    return (
        <div className={`p-6 bg-gray-900 text-white min-h-screen ${isUpdating ? 'animate-pulse' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Visualizar Ações</h1>
                <button
                    onClick={saveActions}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                    Salvar Ações
                </button>
                <button
                    onClick={refreshTasks}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Atualizar Tarefas
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Block 1: Existing Actions */}
                <div className="bg-gray-800 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2">Ações Existentes</h2>
                    <div
                        ref={scrollContainerRef}
                        className="w-full h-96 p-4 bg-gray-700 text-white rounded text-lg overflow-hidden"
                        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}
                    >
                        {actionsText}
                    </div>
                </div>

                {/* Block 2: Marketing Tasks */}
                <div className="bg-gray-800 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2">Tarefas de Marketing</h2>
                    <div className="space-y-4">
                        {marketingTasks.map(task => (
                            <div key={task.id} className="p-4 bg-gray-700 rounded">
                                <h3 className="text-lg font-bold">{task.name}</h3>
                                <p className="text-sm text-gray-400">Descrição: {task.description}</p>
                                <p className="text-sm text-gray-400">Data de Postagem: {task.postDate}</p>
                                <p className="text-sm text-gray-400">Data de Entrega: {task.dueDate}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Block 3: R.H Tasks */}
                <div className="bg-gray-800 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2">Tarefas de R.H</h2>
                    <div className="space-y-4">
                        {rhTasks.map(task => (
                            <div key={task.id} className="p-4 bg-gray-700 rounded">
                                <h3 className="text-lg font-bold">{task.name}</h3>
                                <p className="text-sm text-gray-400">Descrição: {task.description}</p>
                                <p className="text-sm text-gray-400">Data de Postagem: {task.postDate}</p>
                                <p className="text-sm text-gray-400">Data de Entrega: {task.dueDate}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Block 4: LOJA Tasks */}
                <div className="bg-gray-800 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2">Tarefas de LOJA</h2>
                    <div className="space-y-4">
                        {lojaTasks.map(task => (
                            <div key={task.id} className="p-4 bg-gray-700 rounded">
                                <h3 className="text-lg font-bold">{task.name}</h3>
                                <p className="text-sm text-gray-400">Descrição: {task.description}</p>
                                <p className="text-sm text-gray-400">Data de Postagem: {task.postDate}</p>
                                <p className="text-sm text-gray-400">Data de Entrega: {task.dueDate}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .animate-pulse {
                    animation: pulse 1s infinite;
                }
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
}
