import React, { useState, useEffect } from 'react';
import { Coupon } from '../types';
import { CouponForm } from './CouponForm';
import {
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} from '../services/couponService';

export const CouponsTab: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load coupons on mount
    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        const { data, error } = await fetchCoupons();
        if (data) {
            setCoupons(data);
        } else {
            console.error('Failed to load coupons:', error);
        }
        setLoading(false);
    };

    const handleSaveCoupon = async (data: Omit<Coupon, 'id' | 'created_at' | 'used_count'>) => {
        setIsSaving(true);

        if (editingCoupon) {
            const { success } = await updateCoupon(editingCoupon.id, data);
            if (success) {
                await loadCoupons();
                setShowForm(false);
                setEditingCoupon(null);
            } else {
                alert('Erro ao atualizar cupom');
            }
        } else {
            const { success } = await createCoupon(data);
            if (success) {
                await loadCoupons();
                setShowForm(false);
            } else {
                alert('Erro ao criar cupom. Verifique se o código já existe.');
            }
        }

        setIsSaving(false);
    };

    const handleEditCoupon = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setShowForm(true);
    };

    const handleDeleteCoupon = async (id: number) => {
        if (!confirm('Tem certeza que deseja deletar este cupom?')) {
            return;
        }

        const { success } = await deleteCoupon(id);
        if (success) {
            await loadCoupons();
        } else {
            alert('Erro ao deletar cupom');
        }
    };

    const handleNewCoupon = () => {
        setEditingCoupon(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingCoupon(null);
    };

    const isExpired = (expiryDate: string) => {
        return new Date(expiryDate) < new Date();
    };

    const usagePercentage = (current: number, max: number) => {
        return (current / max) * 100;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">
                    progress_activity
                </span>
            </div>
        );
    }

    if (showForm) {
        return (
            <div className="px-4 md:px-8 py-8 flex justify-center">
                <CouponForm
                    onSave={handleSaveCoupon}
                    onCancel={handleCancelForm}
                    isLoading={isSaving}
                    initialData={editingCoupon}
                />
            </div>
        );
    }

    return (
        <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white">Cupons de Desconto</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie cupons promocionais e descontos
                    </p>
                </div>
                <button
                    onClick={handleNewCoupon}
                    className="h-12 px-6 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Novo Cupom
                </button>
            </div>

            {/* Coupons Grid */}
            {coupons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => {
                        const expired = isExpired(coupon.expiration_date);
                        const usagePercent = usagePercentage(coupon.used_count, coupon.usage_limit_user);
                        const usedUp = coupon.used_count >= coupon.usage_limit_user;

                        return (
                            <div
                                key={coupon.id}
                                className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Header with Status Badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white font-mono">
                                                {coupon.code}
                                            </h3>
                                            {!coupon.is_active && (
                                                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold">
                                                    INATIVO
                                                </span>
                                            )}
                                            {expired && (
                                                <span className="px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
                                                    EXPIRADO
                                                </span>
                                            )}
                                            {usedUp && !expired && (
                                                <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                                                    ESGOTADO
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-3xl font-black text-primary">
                                            {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {coupon.discount_type === 'percentage' ? 'Desconto percentual' : 'Desconto fixo'}
                                        </p>
                                    </div>
                                </div>

                                {/* Usage Progress */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                                        <span>Usos: {coupon.used_count} / {coupon.usage_limit_user}</span>
                                        <span>{usagePercent.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${usagePercent >= 100
                                                ? 'bg-red-500'
                                                : usagePercent >= 75
                                                    ? 'bg-amber-500'
                                                    : 'bg-primary'
                                                }`}
                                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Expiry Date */}
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    <span className="material-symbols-outlined text-base">calendar_today</span>
                                    <span>
                                        Válido até {new Date(coupon.expiration_date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-border-dark">
                                    <button
                                        onClick={() => handleEditCoupon(coupon)}
                                        className="flex-1 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-base">edit</span>
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCoupon(coupon.id)}
                                        className="flex-1 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                        Deletar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">
                        confirmation_number
                    </span>
                    <p className="text-xl font-bold text-slate-500">Nenhum cupom cadastrado</p>
                    <p className="text-base text-slate-400 mt-1">Clique em "Novo Cupom" para começar</p>
                </div>
            )}
        </div>
    );
};
