import React, { useState, useEffect } from 'react';
import { Coupon } from '../types';

interface CouponFormProps {
    onSave: (data: Omit<Coupon, 'id' | 'created_at' | 'used_count'>) => void;
    onCancel: () => void;
    isLoading: boolean;
    initialData?: Coupon | null;
}

export const CouponForm: React.FC<CouponFormProps> = ({
    onSave,
    onCancel,
    isLoading,
    initialData,
}) => {
    const [code, setCode] = useState(initialData?.code || '');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(initialData?.discount_type || 'percentage');
    const [discountValue, setDiscountValue] = useState(initialData?.discount_value?.toString() || '');
    const [expirationDate, setExpirationDate] = useState(
        initialData?.expiration_date ? initialData.expiration_date.split('T')[0] : ''
    );
    const [usageLimitUser, setUsageLimitUser] = useState(initialData?.usage_limit_user?.toString() || '');
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
    const [firstPurchaseOnly, setFirstPurchaseOnly] = useState(initialData?.first_purchase_only ?? false);

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code || '');
            setDiscountType(initialData.discount_type || 'percentage');
            setDiscountValue(initialData.discount_value?.toString() || '');
            setExpirationDate(initialData.expiration_date ? initialData.expiration_date.split('T')[0] : '');
            setUsageLimitUser(initialData.usage_limit_user?.toString() || '');
            setIsActive(initialData.is_active ?? true);
            setFirstPurchaseOnly(initialData.first_purchase_only ?? false);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!code.trim()) {
            alert('Por favor, insira um código de cupom');
            return;
        }

        if (!discountValue || parseFloat(discountValue) <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        if (!expirationDate) {
            alert('Por favor, selecione uma data de validade');
            return;
        }

        if (!usageLimitUser || parseInt(usageLimitUser) <= 0) {
            alert('Por favor, insira um número válido de usos máximos');
            return;
        }

        onSave({
            code: code.toUpperCase().trim(),
            discount_type: discountType,
            discount_value: parseFloat(discountValue),
            expiration_date: expirationDate,
            usage_limit_user: parseInt(usageLimitUser),
            is_active: isActive,
            first_purchase_only: firstPurchaseOnly,
        });
    };

    return (
        <div className="w-full max-w-2xl bg-white dark:bg-card-dark rounded-2xl shadow-lg border border-slate-200 dark:border-border-dark p-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">
                {initialData ? 'Editar Cupom' : 'Novo Cupom'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code Input */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Código do Cupom
                    </label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Ex: BLACKFRIDAY10"
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-border-dark rounded-xl px-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        disabled={isLoading}
                        maxLength={20}
                    />
                </div>

                {/* Type Selection */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Tipo de Desconto
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setDiscountType('percentage')}
                            className={`h-12 rounded-xl font-bold transition-all ${discountType === 'percentage'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            disabled={isLoading}
                        >
                            Porcentagem (%)
                        </button>
                        <button
                            type="button"
                            onClick={() => setDiscountType('fixed')}
                            className={`h-12 rounded-xl font-bold transition-all ${discountType === 'fixed'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            disabled={isLoading}
                        >
                            Valor Fixo (R$)
                        </button>
                    </div>
                </div>

                {/* Value Input */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Valor do Desconto {discountType === 'percentage' ? '(%)' : '(R$)'}
                    </label>
                    <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === 'percentage' ? 'Ex: 10' : 'Ex: 50'}
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-border-dark rounded-xl px-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        disabled={isLoading}
                        min="0"
                        step={discountType === 'percentage' ? '1' : '0.01'}
                        max={discountType === 'percentage' ? '100' : undefined}
                    />
                </div>

                {/* Expiry Date */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Data de Validade
                    </label>
                    <input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-border-dark rounded-xl px-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        disabled={isLoading}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Max Uses */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Quantidade Máxima de Usos
                    </label>
                    <input
                        type="number"
                        value={usageLimitUser}
                        onChange={(e) => setUsageLimitUser(e.target.value)}
                        placeholder="Ex: 100"
                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-border-dark rounded-xl px-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        disabled={isLoading}
                        min="1"
                    />
                </div>

                {/* First Purchase Only Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Apenas Primeira Compra</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Cupom válido apenas para novos clientes
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFirstPurchaseOnly(!firstPurchaseOnly)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${firstPurchaseOnly ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                        disabled={isLoading}
                    >
                        <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${firstPurchaseOnly ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Cupom Ativo</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Desative para pausar temporariamente
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                        disabled={isLoading}
                    >
                        <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Salvando...
                            </>
                        ) : (
                            'Salvar Cupom'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
