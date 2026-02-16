import React, { useState } from 'react';

interface TrackingCodeModalProps {
    orderId: number;
    currentCode: string | null;
    onClose: () => void;
    onSave: (orderId: number, code: string) => Promise<void>;
}

export function TrackingCodeModal({ orderId, currentCode, onClose, onSave }: TrackingCodeModalProps) {
    const [code, setCode] = useState(currentCode || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!code.trim()) {
            alert('Por favor, insira um código de rastreio');
            return;
        }

        setIsSaving(true);
        await onSave(orderId, code.trim());
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                        {currentCode ? 'Editar' : 'Adicionar'} Código de Rastreio
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                        Código de Rastreio
                    </label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ex: BR123456789BR"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold transition-colors"
                        autoFocus
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-bold"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 px-4 py-3 bg-brand-gold text-slate-900 rounded-lg hover:bg-yellow-500 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
