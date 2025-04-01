import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    totalSales: number;
    image?: string;
}

const initialProducts: Product[] = [
    { id: 1, name: 'Apple iMac 27"', category: 'PC/Computador', price: 2999, stock: 300, totalSales: 466, image: 'https://via.placeholder.com/100' },
    { id: 2, name: 'Xbox Series S', category: 'Console/Games', price: 299, stock: 56, totalSales: 3040, image: 'https://via.placeholder.com/100' },
    { id: 3, name: 'PlayStation 5', category: 'Console/Games', price: 799, stock: 78, totalSales: 2999, image: 'https://via.placeholder.com/100' },
    { id: 4, name: 'Monitor BenQ EX2710Q', category: 'TV/Monitor', price: 499, stock: 354, totalSales: 76, image: 'https://via.placeholder.com/100' },
    { id: 5, name: 'Apple iPhone 14', category: 'Celular', price: 999, stock: 1237, totalSales: 2000, image: 'https://via.placeholder.com/100' },
];

const App = () => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [search, setSearch] = useState('');

    const handleAddProduct = () => {
        const newProduct: Product = {
            id: products.length + 1,
            name: 'Novo Produto',
            category: 'Categoria',
            price: 0,
            stock: 0,
            totalSales: 0,
            image: 'https://via.placeholder.com/100',
        };
        setProducts([...products, newProduct]);
    };

    const handleDeleteProduct = (id: number) => {
        setProducts(products.filter(product => product.id !== id));
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Pesquisar"
                    className="p-3 rounded bg-gray-800 text-white w-1/3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    onClick={handleAddProduct}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded flex items-center"
                >
                    + Adicionar Produto
                </button>
            </div>
            <div className="space-y-4">
                {filteredProducts.map(product => (
                    <div
                        key={product.id}
                        className="p-4 bg-gray-800 rounded flex items-center justify-between"
                    >
                        <div className="flex items-center">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 rounded mr-4"
                            />
                            <div>
                                <h3 className="text-lg font-bold">{product.name}</h3>
                                <p className="text-sm text-gray-400">Categoria: {product.category}</p>
                                <p className="text-sm text-gray-400">Preço: R${product.price}</p>
                                <p className="text-sm text-gray-400">Estoque: {product.stock}</p>
                                <p className="text-sm text-gray-400">Vendas Totais: {product.totalSales}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Excluir
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-center text-gray-400">
                Mostrando {filteredProducts.length} de {products.length} produtos
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
