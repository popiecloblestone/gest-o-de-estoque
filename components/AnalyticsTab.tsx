import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { supabase } from '../services/supabase';
import { Product } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [avgDuration, setAvgDuration] = useState(0);
  const [visitsByDay, setVisitsByDay] = useState<any[]>([]);
  const [visitorTypes, setVisitorTypes] = useState<string[]>([]);
  const [topProducts, setTopProducts] = useState<{ product: Product | null; view_count: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [duration, visitsRaw, topViewed] = await Promise.all([
        analyticsService.getAverageDuration(),
        analyticsService.getVisitsByDay(),
        analyticsService.getMostViewedProducts(5)
      ]);

      // Prepare data for Multiline chart
      const dayMap = new Map<string, any>();
      const typesSet = new Set<string>();

      (visitsRaw || []).forEach((v) => {
        if (!dayMap.has(v.day)) {
          dayMap.set(v.day, { day: v.day, Geral: 0 });
        }
        const dayData = dayMap.get(v.day);
        
        // Add specific visitor type count
        dayData[v.visitor_type] = (dayData[v.visitor_type] || 0) + v.count;
        // Keep adding to overall total 'Geral'
        dayData.Geral += v.count;
        
        typesSet.add(v.visitor_type);
      });

      setAvgDuration(duration);
      setVisitsByDay(Array.from(dayMap.values()));
      setVisitorTypes(Array.from(typesSet));

      // Fetch actual product details for the top viewed IDs
      if (topViewed && topViewed.length > 0) {
        const productIds = topViewed.map(item => item.product_id);
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        const enrichedTopProducts = topViewed.map(viewItem => {
          const productDetail = productsData?.find(p => p.id === viewItem.product_id) || null;
          return {
            product: productDetail,
            view_count: viewItem.view_count
          };
        });
        
        setTopProducts(enrichedTopProducts);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const totalWeeklyVisits = visitsByDay.reduce((acc, curr) => acc + (curr.Geral || 0), 0);
  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary dark:text-brand-gold">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Estatísticas do Site</h2>
        <p className="text-slate-500 dark:text-slate-400">Acompanhe o tráfego e engajamento dos últimos 7 dias.</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-primary/10 dark:bg-brand-gold/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary dark:text-brand-gold">group</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Visitas na Semana</p>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalWeeklyVisits}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-emerald-500">timer</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tempo Médio na Loja</p>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white">{formatDuration(avgDuration)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Weekly Chart Area */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary dark:text-brand-gold">bar_chart</span>
            Tráfego por Dia
          </h3>
          
          <div className="h-64 w-full mt-4">
            {visitsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Geral" 
                    name="Geral (Todos)"
                    stroke="#10b981" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                  {visitorTypes.map((type, index) => (
                    <Line 
                      key={type}
                      type="monotone" 
                      dataKey={type} 
                      name={type === 'Anônimo' ? 'Anônimos' : type}
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: COLORS[index % COLORS.length], strokeWidth: 1, stroke: '#fff' }} 
                      activeDot={{ r: 5, strokeWidth: 0 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full">
                 <p className="text-slate-400 text-sm">Sem dados de acesso registrados ainda.</p>
               </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">local_fire_department</span>
            Produtos Mais Vistos
          </h3>

          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-900 bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
                     style={{ backgroundImage: `url('${item.product?.imageUrl || ''}')` }} 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.product?.name || `Produto ID ${item.product_id || 'Desconhecido'}`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    SKU: {item.product?.sku || 'N/A'}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">visibility</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.view_count}</span>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm py-4">Nenhuma visualização de produto registrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
