import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { fetchOrders, updateTrackingCode } from '../services/orderService';
import { TrackingCodeModal } from './TrackingCodeModal';

export function OrdersTab() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        const { data, error } = await fetchOrders();

        if (error) {
            console.error('Error loading orders:', error);
            alert('Erro ao carregar pedidos');
        } else {
            setOrders(data || []);
        }

        setLoading(false);
    };

    const handleSaveTrackingCode = async (orderId: number, code: string) => {
        const { success, error } = await updateTrackingCode(orderId, code);

        if (success) {
            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, tracking_code: code }
                    : order
            ));
            setSelectedOrder(null);
            alert('Código de rastreio atualizado com sucesso!');
        } else {
            console.error('Error updating tracking code:', error);
            alert('Erro ao atualizar código de rastreio');
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="material-symbols-outlined animate-spin text-4xl text-brand-gold">
                    progress_activity
                </span>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-6xl mb-4 text-slate-400">
                    receipt_long
                </span>
                <p className="text-xl font-bold text-slate-400">Nenhum pedido encontrado</p>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Pedidos Realizados</h2>
                <p className="text-slate-400">{orders.length} pedido(s) no total</p>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Order Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-brand-gold">receipt</span>
                                    <h3 className="font-bold text-white">Pedido #{order.id}</h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-1">
                                    <span className="font-semibold">Data:</span> {formatDate(order.created_at)}
                                </p>
                                <p className="text-sm text-slate-400 mb-1">
                                    <span className="font-semibold">Status:</span>{' '}
                                    <span className="inline-block px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-bold">
                                        {order.status.toUpperCase()}
                                    </span>
                                </p>
                                <p className="text-lg font-bold text-brand-gold mt-2">
                                    {formatCurrency(order.total_amount)}
                                </p>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-brand-gold">person</span>
                                    <h4 className="font-bold text-white">Cliente</h4>
                                </div>
                                <p className="text-sm text-slate-300 mb-1">
                                    <span className="font-semibold">Nome:</span> {order.customer?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-slate-300 mb-1">
                                    <span className="font-semibold">Email:</span> {order.customer?.email || 'N/A'}
                                </p>
                                {order.customer?.phone && (
                                    <p className="text-sm text-slate-300">
                                        <span className="font-semibold">Telefone:</span> {order.customer.phone}
                                    </p>
                                )}
                            </div>

                            {/* Address Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-brand-gold">location_on</span>
                                    <h4 className="font-bold text-white">Endereço</h4>
                                </div>
                                <p className="text-sm text-slate-300 mb-1">
                                    {order.address_snapshot.street}, {order.address_snapshot.number}
                                </p>
                                {order.address_snapshot.complement && (
                                    <p className="text-sm text-slate-300 mb-1">
                                        {order.address_snapshot.complement}
                                    </p>
                                )}
                                <p className="text-sm text-slate-300 mb-1">
                                    {order.address_snapshot.neighborhood}
                                </p>
                                <p className="text-sm text-slate-300">
                                    {order.address_snapshot.city} - {order.address_snapshot.state}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                    CEP: {order.address_snapshot.cep}
                                </p>
                            </div>
                        </div>

                        {/* Tracking Code Section */}
                        <div className="mt-6 pt-6 border-t border-slate-700">
                            {order.tracking_code ? (
                                <div className="bg-brand-gold/10 p-4 border border-brand-gold/30 rounded-lg">
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">
                                        Código de Rastreio
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-mono text-sm text-white">{order.tracking_code}</p>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-brand-gold hover:text-yellow-400 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="w-full px-4 py-3 bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 rounded-lg text-brand-gold font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Adicionar Código de Rastreio
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedOrder && (
                <TrackingCodeModal
                    orderId={selectedOrder.id}
                    currentCode={selectedOrder.tracking_code}
                    onClose={() => setSelectedOrder(null)}
                    onSave={handleSaveTrackingCode}
                />
            )}
        </div>
    );
}
