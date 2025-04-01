import React, { useEffect, useState } from 'react';

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

    const loadTasks = () => {
        const savedText = localStorage.getItem('actionsText');
        if (savedText) {
            setActionsText(savedText);
        }

        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            console.log('Loaded tasks:', JSON.parse(savedTasks)); // Debug log
            setTasks(JSON.parse(savedTasks));
        } else {
            console.log('No tasks found in localStorage'); // Debug log
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const marketingTasks = tasks.filter(task => task.type === 'MARKETING');
    const rhTasks = tasks.filter(task => task.type === 'R.H');
    const lojaTasks = tasks.filter(task => task.type === 'LOJA');

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Visualizar Ações</h1>
                <button
                    onClick={loadTasks}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Atualizar Tarefas
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Block 1: Existing Actions */}
                <div className="bg-gray-800 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2">Ações Existentes</h2>
                    <pre className="whitespace-pre-wrap bg-gray-700 p-4 rounded">{actionsText}</pre>
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
        </div>
    );
}
