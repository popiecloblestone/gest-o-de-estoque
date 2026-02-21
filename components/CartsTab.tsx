import React, { useState, useEffect } from 'react';
import { AdminCartItem } from '../types';
import { fetchAllCarts } from '../services/cartService';

export function CartsTab() {
    const [cartItems, setCartItems] = useState<AdminCartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCarts();
    }, []);

    const loadCarts = async () => {
        setLoading(true);
        const { data, error } = await fetchAllCarts();

        if (error) {
            console.error('Error loading carts:', error);
            alert('Erro ao carregar carrinhos');
        } else {
            setCartItems(data || []);
        }

        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Group cart items by user email
    const groupedCarts = cartItems.reduce((acc, item) => {
        const email = item.customer?.email || 'Desconhecido';
        if (!acc[email]) {
            acc[email] = {
                customer: item.customer,
                items: []
            };
        }
        acc[email].items.push(item);
        return acc;
    }, {} as Record<string, { customer?: AdminCartItem['customer'], items: AdminCartItem[] }>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="material-symbols-outlined animate-spin text-4xl text-brand-gold">
                    progress_activity
                </span>
            </div>
        );
    }

    const cartGroups: [string, { customer?: AdminCartItem['customer'], items: AdminCartItem[] }][] = Object.entries(groupedCarts);

    if (cartGroups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-6xl mb-4 text-slate-400">
                    shopping_cart
                </span>
                <p className="text-xl font-bold text-slate-400">Nenhum item no carrinho no momento</p>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Carrinhos dos Clientes</h2>
                <p className="text-lg text-slate-400 font-medium">
                    {cartItems.length} item(ns) no total, distribuído(s) em {cartGroups.length} cliente(s)
                </p>
            </div>

            <div className="space-y-6">
                {cartGroups.map(([email, group]) => {
                    // Calculate total value for this user's cart
                    const cartTotal = group.items.reduce((total, item) => {
                        return total + (item.product?.price || 0) * item.quantity;
                    }, 0);

                    return (
                        <div
                            key={email}
                            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-slate-700 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-brand-gold text-3xl">person</span>
                                        <h3 className="font-extrabold text-white text-xl md:text-2xl tracking-tight">{group.customer?.name || 'Cliente'}</h3>
                                    </div>
                                    <p className="text-base font-medium text-slate-300 flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-sm text-slate-500">mail</span>
                                        {email}
                                    </p>
                                    {group.customer?.phone && (
                                        <p className="text-base font-medium text-slate-300 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-slate-500">phone</span>
                                            {group.customer.phone}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-right min-w-[180px]">
                                    <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Total no Carrinho</p>
                                    <p className="text-2xl md:text-3xl font-black text-brand-gold">{formatCurrency(cartTotal)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {group.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
                                        {item.product?.imageUrl ? (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded bg-slate-800"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-slate-800 rounded flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-500">inventory_2</span>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-lg truncate">
                                                {item.product?.name || 'Produto indisponível'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                                                {item.size && (
                                                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-sm font-semibold border border-slate-700/80">
                                                        Tam: <span className="text-white">{item.size}</span>
                                                    </span>
                                                )}
                                                {item.color && (
                                                    <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-sm font-semibold border border-slate-700/80">
                                                        Cor: <span className="text-white">{item.color}</span>
                                                    </span>
                                                )}
                                                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-sm font-semibold border border-slate-700/80">
                                                    Qtd: <span className="text-white">{item.quantity}</span>
                                                </span>
                                                <span className="text-sm font-medium text-slate-400 flex items-center gap-1 ml-auto">
                                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                                    <span className="hidden sm:inline">Adicionado em: </span>{formatDate(item.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right pl-4 border-l border-slate-700/50">
                                            <p className="font-extrabold text-brand-gold text-lg">
                                                {formatCurrency((item.product?.price || 0) * item.quantity)}
                                            </p>
                                            <p className="text-sm font-medium text-slate-400 mt-1">
                                                {formatCurrency(item.product?.price || 0)} un.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
