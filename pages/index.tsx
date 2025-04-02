import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { useRouter } from 'next/router';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

interface Campaign {
    id: number;
    name: string;
    date: string;
    month: string;
    spent: number;
    image?: string;
}

interface Task {
    id: number;
    name: string;
    description: string;
    postDate: string;
    dueDate: string;
    type: 'ACAO' | 'MARKETING' | 'R.H' | 'LOJA'; // Added type property
}

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

export default function Home() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [activeTab, setActiveTab] = useState('campaigns'); // Track the active tab
    const [showModal, setShowModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({});
    const [newTask, setNewTask] = useState<Partial<Task>>({});
    const [editCampaign, setEditCampaign] = useState<Partial<Campaign> | null>(null);
    const [editTask, setEditTask] = useState<Partial<Task> | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [monthlyBudget, setMonthlyBudget] = useState<{ [key: string]: number }>({});
    const [notification, setNotification] = useState<string | null>(null);
    const [actionsText, setActionsText] = useState<string>(`
Locução [01/04]

Locução [Felipe]

[Novo hambúrgo]

Wave | Kit | Pulseira | película 

[Alexia].      [02]|[02]|[01]|[00]
[Stefani].     [01]|[00]|[00]|[00]
[Luis].        [00]|[00]|[00]|[00]
[Sabrina].     [02]|[00]|[00]|[00]

Total.         [05]|[02]|[01]

Dinheiro [Luis]
Dinheiro [Sabrina]
Dinheiro [Alexa]
Dinheiro [Stefani]

Pix [Sabrina]
Pix [Alexia]
Pix [Stefani]
Pix [Luis]
    `);

    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('authenticatedUser');
        if (!isAuthenticated) {
            console.log('Usuário não autenticado. Redirecionando para login...');
            router.push('/login'); // Redireciona para login se não autenticado
        }
    }, [router]);

    useEffect(() => {
        const savedCampaigns = localStorage.getItem('campaigns');
        const savedBudgets = localStorage.getItem('monthlyBudget');
        if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
        if (savedBudgets) setMonthlyBudget(JSON.parse(savedBudgets));
    }, []);

    useEffect(() => {
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        localStorage.setItem('monthlyBudget', JSON.stringify(monthlyBudget));
    }, [campaigns, monthlyBudget]);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save tasks to localStorage
    }, [tasks]);

    const saveActionsToFirebase = async (updatedActionsText: string) => {
        const docRef = doc(db, 'actions', 'default');
        await setDoc(docRef, { text: updatedActionsText });
    };

    const saveTasksToFirebase = async (updatedTasks: Task[]) => {
        const docRef = doc(db, 'tasks', 'default');
        await setDoc(docRef, { tasks: updatedTasks });
    };

    const handleAddCampaign = () => {
        if (!newCampaign.name || !newCampaign.date || !newCampaign.month || newCampaign.spent === undefined) {
            setNotification('Preencha todos os campos!');
            return;
        }

        const newId = campaigns.length > 0 ? campaigns[campaigns.length - 1].id + 1 : 1;
        const campaignToAdd: Campaign = {
            id: newId,
            name: newCampaign.name,
            date: newCampaign.date,
            month: newCampaign.month,
            spent: newCampaign.spent,
            image: newCampaign.image || 'https://via.placeholder.com/300',
        };

        setCampaigns([...campaigns, campaignToAdd]);
        setNewCampaign({}); // Reset the new campaign state
        setImagePreview(null); // Reset the image preview
        setShowModal(false); // Close the modal
        setNotification('Campanha adicionada com sucesso!');
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setEditCampaign(campaign);
        setShowModal(true);
        setImagePreview(campaign.image || null);
    };

    const handleSaveEditCampaign = () => {
        if (!editCampaign?.name || !editCampaign.date || !editCampaign.month || editCampaign.spent === undefined) {
            setNotification('Preencha todos os campos!');
            return;
        }

        setCampaigns(campaigns.map(campaign => 
            campaign.id === editCampaign.id ? { ...campaign, ...editCampaign } : campaign
        ));
        setEditCampaign(null);
        setImagePreview(null);
        setShowModal(false);
        setNotification('Campanha editada com sucesso!');
    };

    const handleDeleteCampaign = (id: number) => {
        setCampaigns(campaigns.filter(campaign => campaign.id !== id));
        setNotification('Campanha excluída com sucesso!');
    };

    const handleAddTask = () => {
        if (!newTask.name || !newTask.description || !newTask.postDate || !newTask.dueDate || !newTask.type) {
            setNotification('Preencha todos os campos!');
            return;
        }

        const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
        const taskToAdd: Task = {
            id: newId,
            name: newTask.name,
            description: newTask.description,
            postDate: newTask.postDate,
            dueDate: newTask.dueDate,
            type: newTask.type as 'ACAO' | 'MARKETING' | 'R.H' | 'LOJA', // Ensure type is valid
        };

        const updatedTasks = [...tasks, taskToAdd];
        setTasks(updatedTasks);
        saveTasksToFirebase(updatedTasks); // Salva no Firebase
        setNewTask({});
        setShowModal(false);
        setNotification('Tarefa adicionada com sucesso!');
    };

    const handleEditTask = (task: Task) => {
        setEditTask(task);
        setShowModal(true);
    };

    const handleSaveEditTask = () => {
        if (!editTask?.name || !editTask.description || !editTask.postDate || !editTask.dueDate || !editTask.type) {
            setNotification('Preencha todos os campos!');
            return;
        }

        const updatedTasks = tasks.map(task => (task.id === editTask.id ? { ...task, ...editTask } : task));
        setTasks(updatedTasks);
        saveTasksToFirebase(updatedTasks); // Salva no Firebase
        setEditTask(null);
        setShowModal(false);
        setNotification('Tarefa editada com sucesso!');
    };

    const handleDeleteTask = (id: number) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(updatedTasks);
        saveTasksToFirebase(updatedTasks); // Salva no Firebase
        setNotification('Tarefa excluída com sucesso!');
    };

    const calculateRemainingBudget = () => {
        if (!selectedMonth) return null;
        const totalSpent = campaigns
            .filter(campaign => campaign.month === selectedMonth)
            .reduce((sum, campaign) => sum + campaign.spent, 0);
        const budget = monthlyBudget[selectedMonth] || 0;
        return budget - totalSpent;
    };

    const calculateTotalInvested = () => {
        return campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
    };

    const calculateMonthlySpending = () => {
        const spendingByMonth: { [key: string]: number } = {};
        campaigns.forEach((campaign) => {
            spendingByMonth[campaign.month] = (spendingByMonth[campaign.month] || 0) + campaign.spent;
        });
        return spendingByMonth;
    };

    const monthlySpending = calculateMonthlySpending();

    const handleSetMonthlyBudget = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setMonthlyBudget({ ...monthlyBudget, [selectedMonth]: value });
    };

    const exportData = () => {
        const csvContent = campaigns.map(campaign =>
            `${campaign.id},${campaign.name},${campaign.date},${campaign.month},${campaign.spent}`
        ).join('\n');
        const blob = new Blob([`ID,Name,Date,Month,Spent\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'campaigns.csv');
    };

    const handleImagePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        setImagePreview(reader.result as string);
                        setNewCampaign({ ...newCampaign, image: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    };

    const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setImagePreview(reader.result as string);
                    setNewCampaign({ ...newCampaign, image: reader.result as string });
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleSaveActions = () => {
        localStorage.setItem('actionsText', actionsText);
        saveActionsToFirebase(actionsText); // Salva no Firebase
        alert('Texto salvo com sucesso!');
    };

    const handleViewActions = () => {
        router.push('/view-actions');
    };

    const filteredCampaigns = campaigns.filter(campaign =>
        (selectedMonth ? campaign.month === selectedMonth : true) &&
        campaign.name.toLowerCase().includes(search.toLowerCase())
    );

    const remainingBudget = calculateRemainingBudget();
    const totalInvested = calculateTotalInvested();

    const chartData = {
        labels: campaigns.map(campaign => campaign.name),
        datasets: [
            {
                label: 'Gasto por Campanha',
                data: campaigns.map(campaign => campaign.spent),
                backgroundColor: 'rgba(99, 179, 237, 0.6)',
                borderColor: 'rgba(99, 179, 237, 1)',
                borderWidth: 1,
            },
        ],
    };

    const monthlySpendingChartData = {
        labels: Object.keys(monthlySpending),
        datasets: [
            {
                label: 'Gasto por Mês',
                data: Object.values(monthlySpending),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <div className="group w-16 hover:w-64 bg-gray-800 p-6 transition-all duration-300 ease-in-out">
                <div className="flex justify-center mb-6">
                    <img src="/img/logo.png" alt="Logo" className="h-12" />
                </div>
                <h2 className="text-2xl font-bold mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Dashboard
                </h2>
                <ul className="space-y-4">
                    <li>
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`w-full flex items-center gap-4 text-left p-3 rounded ${activeTab === 'campaigns' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            <span>🌐</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Campanhas
                            </span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('budget')}
                            className={`w-full flex items-center gap-4 text-left p-3 rounded ${activeTab === 'budget' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            <span>💸</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Orçamento
                            </span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`w-full flex items-center gap-4 text-left p-3 rounded ${activeTab === 'reports' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            <span>🧮</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Relatórios
                            </span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('updates')}
                            className={`w-full flex items-center gap-4 text-left p-3 rounded ${activeTab === 'updates' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            <span>📝</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Atualizações
                            </span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('actions')}
                            className={`w-full flex items-center gap-4 text-left p-3 rounded ${activeTab === 'actions' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            <span>✏️</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Ações
                            </span>
                        </button>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {notification && (
                    <div className="mb-4 p-3 bg-green-500 text-white rounded">
                        {notification}
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-4 text-sm underline"
                        >
                            Fechar
                        </button>
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                className="p-3 rounded bg-gray-800 text-white w-1/3"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                onClick={() => {
                                    setNewCampaign({});
                                    setShowModal(true);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
                            >
                                + Adicionar Campanha
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCampaigns.map(campaign => (
                                <div
                                    key={campaign.id}
                                    className="p-4 bg-gray-800 rounded flex flex-col sm:flex-row items-center sm:items-start justify-between"
                                >
                                    <img
                                        src={campaign.image || 'https://via.placeholder.com/300'}
                                        alt={campaign.name}
                                        className="w-48 h-48 rounded mb-4 sm:mb-0 sm:mr-4 object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold">{campaign.name}</h3>
                                        <p className="text-sm text-gray-400">Data: {campaign.date}</p>
                                        <p className="text-sm text-gray-400">Mês: {campaign.month}</p>
                                        <p className="text-sm text-gray-400">Gasto: R${campaign.spent}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleDeleteCampaign(campaign.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                        >
                                            Excluir
                                        </button>
                                        <button
                                            onClick={() => handleEditCampaign(campaign)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Modal for Adding/Editing Campaign */}
                {showModal && activeTab === 'campaigns' && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                        onPaste={handleImagePaste}
                        onDrop={handleImageDrop}
                        onDragOver={handleDragOver}
                    >
                        <div className="bg-gray-800 p-6 rounded w-full sm:w-1/2 lg:w-1/3">
                            <h2 className="text-lg font-bold mb-4">
                                {editCampaign ? 'Editar Campanha' : 'Adicionar Nova Campanha'}
                            </h2>
                            <input
                                type="text"
                                placeholder="Nome da Campanha"
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editCampaign?.name || newCampaign.name || ''}
                                onChange={(e) =>
                                    editCampaign
                                        ? setEditCampaign({ ...editCampaign, name: e.target.value })
                                        : setNewCampaign({ ...newCampaign, name: e.target.value })
                                }
                            />
                            <input
                                type="date"
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editCampaign?.date || newCampaign.date || ''}
                                onChange={(e) =>
                                    editCampaign
                                        ? setEditCampaign({ ...editCampaign, date: e.target.value })
                                        : setNewCampaign({ ...newCampaign, date: e.target.value })
                                }
                            />
                            <select
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editCampaign?.month || newCampaign.month || ''}
                                onChange={(e) =>
                                    editCampaign
                                        ? setEditCampaign({ ...editCampaign, month: e.target.value })
                                        : setNewCampaign({ ...newCampaign, month: e.target.value })
                                }
                            >
                                <option value="">Selecione o Mês</option>
                                <option value="Janeiro">Janeiro</option>
                                <option value="Fevereiro">Fevereiro</option>
                                <option value="Março">Março</option>
                                <option value="Abril">Abril</option>
                                <option value="Maio">Maio</option>
                                <option value="Junho">Junho</option>
                                <option value="Julho">Julho</option>
                                <option value="Agosto">Agosto</option>
                                <option value="Setembro">Setembro</option>
                                <option value="Outubro">Outubro</option>
                                <option value="Novembro">Novembro</option>
                                <option value="Dezembro">Dezembro</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Valor Gasto"
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editCampaign?.spent || newCampaign.spent || ''}
                                onChange={(e) =>
                                    editCampaign
                                        ? setEditCampaign({ ...editCampaign, spent: parseFloat(e.target.value) })
                                        : setNewCampaign({ ...newCampaign, spent: parseFloat(e.target.value) })
                                }
                            />
                            {imagePreview && (
                                <div className="mb-3">
                                    <p className="text-sm text-gray-400 mb-2">Pré-visualização da Imagem:</p>
                                    <img
                                        src={imagePreview}
                                        alt="Pré-visualização"
                                        className="w-full h-48 object-cover rounded"
                                    />
                                </div>
                            )}
                            <div
                                className="text-sm text-gray-400 mb-3 border-dashed border-2 border-gray-600 p-4 rounded"
                                onDrop={handleImageDrop}
                                onDragOver={handleDragOver}
                            >
                                Cole uma imagem com <strong>CTRL+V</strong> ou arraste-a para esta área.
                            </div>      
                            <button
                                onClick={editCampaign ? handleSaveEditCampaign : handleAddCampaign}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full transition-transform transform hover:scale-105"
                            >
                                {editCampaign ? 'Salvar Alterações' : 'Salvar'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditCampaign(null);
                                    setImagePreview(null);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full mt-3 transition-transform transform hover:scale-105"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Budget Tab */}
                {activeTab === 'budget' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Configurar Orçamento</h2>
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">
                                Selecione o mês:
                            </label>
                            <select
                                className="p-3 rounded bg-gray-800 text-white w-full sm:w-1/3"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="">Selecione um mês</option>
                                <option value="Janeiro">Janeiro</option>
                                <option value="Fevereiro">Fevereiro</option>
                                <option value="Março">Março</option>
                                <option value="Abril">Abril</option>
                                <option value="Maio">Maio</option>
                                <option value="Junho">Junho</option>
                                <option value="Julho">Julho</option>
                                <option value="Agosto">Agosto</option>
                                <option value="Setembro">Setembro</option>
                                <option value="Outubro">Outubro</option>
                                <option value="Novembro">Novembro</option>
                                <option value="Dezembro">Dezembro</option>
                            </select>
                        </div>
                        {selectedMonth && (
                            <div className="mb-6">
                                <label className="block text-sm text-gray-400 mb-2">
                                    Definir orçamento para {selectedMonth}:
                                </label>
                                <input
                                    type="number"
                                    placeholder="Valor do orçamento (R$)"
                                    className="p-3 rounded bg-gray-800 text-white w-full sm:w-1/3"
                                    value={monthlyBudget[selectedMonth] || ''}
                                    onChange={handleSetMonthlyBudget}
                                />
                            </div>
                        )}
                        {selectedMonth && (
                            <div className="text-lg text-gray-300">
                                <p>Orçamento total: R${monthlyBudget[selectedMonth]?.toFixed(2) || '0,00'}</p>
                                <p>Valor restante: R${calculateRemainingBudget()?.toFixed(2) || '0,00'}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Relatórios Detalhados</h2>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-2">Resumo Geral</h3>
                            <p>Total Investido: R${totalInvested.toFixed(2)}</p>
                            <p>Total de Campanhas: {campaigns.length}</p>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-2">Gasto por Mês</h3>
                            <div className="chart-container">
                                <Bar data={monthlySpendingChartData} />
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-2">Gasto por Campanha</h3>
                            <div className="chart-container">
                                <Bar data={chartData} />
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-2">Detalhes das Campanhas</h3>
                            <table className="w-full text-left bg-gray-800 rounded">
                                <thead>
                                    <tr className="bg-gray-700">
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Mês</th>
                                        <th className="p-3">Gasto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign.id} className="border-b border-gray-700">
                                            <td className="p-3">{campaign.name}</td>
                                            <td className="p-3">{campaign.month}</td>
                                            <td className="p-3">R${campaign.spent.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={exportData}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded"
                        >
                            Exportar Dados
                        </button>
                    </div>
                )}

                {/* Updates Tab */}
                {activeTab === 'updates' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Atualizações</h2>
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => {
                                    setNewTask({});
                                    setShowModal(true);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
                            >
                                + Adicionar Tarefa
                            </button>
                        </div>
                        <div className="space-y-4">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    className="p-4 bg-gray-800 rounded flex flex-col sm:flex-row items-start justify-between"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold">{task.name}</h3>
                                        <p className="text-sm text-gray-400">Descrição: {task.description}</p>
                                        <p className="text-sm text-gray-400">Data de Postagem: {task.postDate}</p>
                                        <p className="text-sm text-gray-400">Data de Entrega: {task.dueDate}</p>
                                        <p className="text-sm text-gray-400">Tipo: {task.type}</p> {/* Display task type */}
                                    </div>
                                    <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:ml-4">
                                        <button
                                            onClick={() => handleEditTask(task)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal for Adding/Editing Task */}
                {showModal && activeTab === 'updates' && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <div className="bg-gray-800 p-6 rounded w-full sm:w-1/2 lg:w-1/3">
                            <h2 className="text-lg font-bold mb-4">
                                {editTask ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
                            </h2>
                            <input
                                type="text"
                                placeholder="Nome da Tarefa"
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editTask?.name || newTask.name || ''}
                                onChange={(e) =>
                                    editTask
                                        ? setEditTask({ ...editTask, name: e.target.value })
                                        : setNewTask({ ...newTask, name: e.target.value })
                                }
                            />
                            <textarea
                                placeholder="Descrição da Tarefa"
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editTask?.description || newTask.description || ''}
                                onChange={(e) =>
                                    editTask
                                        ? setEditTask({ ...editTask, description: e.target.value })
                                        : setNewTask({ ...newTask, description: e.target.value })
                                }
                            />
                            <input
                                type="date"
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editTask?.postDate || newTask.postDate || ''}
                                onChange={(e) =>
                                    editTask
                                        ? setEditTask({ ...editTask, postDate: e.target.value })
                                        : setNewTask({ ...newTask, postDate: e.target.value })
                                }
                            />
                            <input
                                type="date"
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editTask?.dueDate || newTask.dueDate || ''}
                                onChange={(e) =>
                                    editTask
                                        ? setEditTask({ ...editTask, dueDate: e.target.value })
                                        : setNewTask({ ...newTask, dueDate: e.target.value })
                                }
                            />
                            <select
                                className="p-3 rounded bg-gray-700 text-white w-full mb-3"
                                value={editTask?.type || newTask.type || ''}
                                onChange={(e) =>
                                    editTask
                                        ? setEditTask({ ...editTask, type: e.target.value as 'ACAO' | 'MARKETING' | 'R.H' | 'LOJA' })
                                        : setNewTask({ ...newTask, type: e.target.value as 'ACAO' | 'MARKETING' | 'R.H' | 'LOJA' })
                                }
                            >
                                <option value="">Selecione o Tipo</option>
                                <option value="ACAO">ACAO</option>
                                <option value="MARKETING">MARKETING</option>
                                <option value="R.H">R.H</option>
                                <option value="LOJA">LOJA</option>
                            </select>
                            <button
                                onClick={editTask ? handleSaveEditTask : handleAddTask}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full transition-transform transform hover:scale-105"
                            >
                                {editTask ? 'Salvar Alterações' : 'Salvar'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditTask(null);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full mt-3 transition-transform transform hover:scale-105"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions Tab */}
                {activeTab === 'actions' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Editar Ações</h2>
                        <textarea
                            className="w-full h-96 p-4 bg-gray-800 text-white rounded resize-none"
                            value={actionsText}
                            onChange={(e) => setActionsText(e.target.value)}
                        />
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={handleSaveActions}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded"
                            >
                                Salvar
                            </button>
                            <button
                                onClick={handleViewActions}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
                            >
                                Visualizar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
