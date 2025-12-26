
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MaterialConfig, MachineConfig, PrintJob, CalculationResult } from './types';
import { InputField } from './components/InputGroup';
import { getPricingInsights } from './services/geminiService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

type Tab = 'calculator' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  
  const [material, setMaterial] = useState<MaterialConfig>({
    spoolPrice: 100,
    spoolWeight: 1000,
    filamentDiameter: 1.75,
    density: 1.24
  });

  const [machine, setMachine] = useState<MachineConfig>({
    powerConsumption: 120,
    electricityCost: 0.98,
    machinePrice: 2900,
    lifespanHours: 5000
  });

  const [job, setJob] = useState<PrintJob>({
    filamentUsedGrams: 50,
    printTimeHours: 2,
    printTimeMinutes: 30,
    activeLaborHours: 0,
    activeLaborMinutes: 15,
    failRate: 10,
    laborHourlyRate: 30,
    platformFeePercent: 10,
    desiredProfitPercent: 100
  });

  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  const results = useMemo((): CalculationResult => {
    const filamentCost = (job.filamentUsedGrams / material.spoolWeight) * material.spoolPrice;
    const printTotalHours = job.printTimeHours + (job.printTimeMinutes / 60);
    const energyKwh = (machine.powerConsumption / 1000) * printTotalHours;
    const energyCost = energyKwh * machine.electricityCost;
    const depreciationCost = (machine.machinePrice / machine.lifespanHours) * printTotalHours;
    const laborTotalHours = job.activeLaborHours + (job.activeLaborMinutes / 60);
    const laborCost = laborTotalHours * job.laborHourlyRate;
    const subtotalOperational = filamentCost + energyCost + depreciationCost + laborCost;
    const failRateCost = subtotalOperational * (job.failRate / 100);
    const totalCost = subtotalOperational + failRateCost;
    const profitAmount = totalCost * (job.desiredProfitPercent / 100);
    const recommendedPrice = (totalCost + profitAmount) / (1 - (job.platformFeePercent / 100));
    const platformFeeAmount = recommendedPrice * (job.platformFeePercent / 100);

    return {
      filamentCost,
      energyCost,
      depreciationCost,
      laborCost,
      failRateCost,
      totalCost,
      recommendedPrice,
      profitAmount,
      platformFeeAmount
    };
  }, [material, machine, job]);

  const chartData = [
    { name: 'Filamento', value: results.filamentCost },
    { name: 'Energia', value: results.energyCost },
    { name: 'Depreciação', value: results.depreciationCost },
    { name: 'Mão de Obra', value: results.laborCost },
    { name: 'Margem Falha', value: results.failRateCost },
  ].filter(d => d.value > 0);

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    const insight = await getPricingInsights(job, results);
    setAiInsights(insight || '');
    setLoadingInsights(false);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white py-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -mr-20 -mt-20"></div>
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              PrintProfit Pro
            </h1>
          </div>
          
          <nav className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
            <button 
              onClick={() => setActiveTab('calculator')}
              className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'calculator' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculadora
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </button>
          </nav>

          <button 
            onClick={handleGetInsights}
            disabled={loadingInsights}
            className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-xl"
          >
            {loadingInsights ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            )}
            Insights IA
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8">
          
          {activeTab === 'calculator' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Dados do Projeto */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                  Projeto Atual
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField 
                    label="Peso da Peça" 
                    suffix="g" 
                    value={job.filamentUsedGrams} 
                    onChange={(v) => setJob(prev => ({...prev, filamentUsedGrams: v}))}
                    step={0.1}
                  />
                  <div className="flex gap-4 items-end">
                    <InputField 
                      label="Tempo de Impressão" 
                      suffix="h" 
                      value={job.printTimeHours} 
                      onChange={(v) => setJob(prev => ({...prev, printTimeHours: v}))}
                    />
                    <InputField 
                      label="" 
                      suffix="min" 
                      value={job.printTimeMinutes} 
                      onChange={(v) => setJob(prev => ({...prev, printTimeMinutes: v}))}
                      min={0}
                    />
                  </div>
                  <InputField 
                    label="Taxa de Falha" 
                    suffix="%" 
                    value={job.failRate} 
                    onChange={(v) => setJob(prev => ({...prev, failRate: v}))}
                  />
                  <InputField 
                    label="Margem de Lucro" 
                    suffix="%" 
                    value={job.desiredProfitPercent} 
                    onChange={(v) => setJob(prev => ({...prev, desiredProfitPercent: v}))}
                  />
                </div>
              </div>

              {/* Mão de Obra */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 ring-2 ring-blue-500/10">
                <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  Mão de Obra Ativa
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex gap-4 items-end">
                    <InputField 
                      label="Seu Tempo no Projeto" 
                      suffix="h" 
                      value={job.activeLaborHours} 
                      onChange={(v) => setJob(prev => ({...prev, activeLaborHours: v}))}
                    />
                    <InputField 
                      label="" 
                      suffix="min" 
                      value={job.activeLaborMinutes} 
                      onChange={(v) => setJob(prev => ({...prev, activeLaborMinutes: v}))}
                      min={0}
                    />
                  </div>
                  <InputField 
                    label="Seu Valor Hora" 
                    prefix="R$" 
                    value={job.laborHourlyRate} 
                    onChange={(v) => setJob(prev => ({...prev, laborHourlyRate: v}))}
                  />
                </div>
              </div>

              {/* Taxa Plataforma */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                  Taxas Externas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField 
                    label="Taxa da Plataforma" 
                    suffix="%" 
                    value={job.platformFeePercent} 
                    onChange={(v) => setJob(prev => ({...prev, platformFeePercent: v}))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Configurações da Máquina */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                  Hardware e Energia
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField 
                    label="Valor da Impressora" 
                    prefix="R$" 
                    value={machine.machinePrice} 
                    onChange={(v) => setMachine(prev => ({...prev, machinePrice: v}))}
                  />
                  <InputField 
                    label="Vida Útil" 
                    suffix="horas" 
                    value={machine.lifespanHours} 
                    onChange={(v) => setMachine(prev => ({...prev, lifespanHours: v}))}
                  />
                  <InputField 
                    label="Consumo Médio" 
                    suffix="Watts" 
                    value={machine.powerConsumption} 
                    onChange={(v) => setMachine(prev => ({...prev, powerConsumption: v}))}
                  />
                  <InputField 
                    label="Custo Energia" 
                    prefix="R$" 
                    suffix="kWh"
                    value={machine.electricityCost} 
                    onChange={(v) => setMachine(prev => ({...prev, electricityCost: v}))}
                    step={0.01}
                  />
                </div>
              </div>

              {/* Materiais Padrão */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                  Suprimentos Padrão
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField 
                    label="Preço do Carretel" 
                    prefix="R$" 
                    value={material.spoolPrice} 
                    onChange={(v) => setMaterial(prev => ({...prev, spoolPrice: v}))}
                    step={0.01}
                  />
                  <InputField 
                    label="Peso do Carretel" 
                    suffix="g" 
                    value={material.spoolWeight} 
                    onChange={(v) => setMaterial(prev => ({...prev, spoolWeight: v}))}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800 text-sm flex gap-4 items-start">
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Estas configurações são salvas localmente e impactam todos os cálculos da aba "Calculadora". Use valores reais de Ijuí-RS e da sua Bambu Lab A1 para precisão máxima.</p>
              </div>
            </div>
          )}
        </section>

        {/* Aside: Resultados */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-8 space-y-8">
            
            {/* Bloco de Preço Principal */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-10 text-white shadow-2xl shadow-blue-500/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <h3 className="text-blue-100 font-bold uppercase tracking-widest text-[10px] mb-2 opacity-80">Preço Sugerido</h3>
              <div className="text-6xl font-black mb-6 flex items-baseline gap-2">
                <span className="text-2xl font-bold opacity-60">R$</span>
                {results.recommendedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              
              <div className="space-y-4 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                  <div>
                    <span className="text-emerald-300 text-[10px] font-black uppercase block mb-1">Lucro Líquido</span>
                    <span className="font-black text-2xl text-emerald-400">R$ {results.profitAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-100 text-[10px] font-black uppercase block mb-1">Custo Total</span>
                    <span className="font-bold text-sm text-blue-200">R$ {results.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-slate-800 font-black mb-6 text-lg">Custos da Peça</h3>
              <div className="h-56 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights */}
            {aiInsights && (
              <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 font-black text-lg mb-4">
                  <div className="bg-indigo-400 p-1.5 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-4-4 6 6 0 1112 0 4 4 0 01-4 4z" />
                    </svg>
                  </div>
                  Estratégia IA
                </div>
                <div className="text-indigo-50 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                  {aiInsights}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
      
      <footer className="mt-20 py-10 text-center border-t border-slate-200">
        <p className="text-slate-400 text-sm font-medium italic">"Engenharia de custos para empreendedores 3D."</p>
        <p className="text-slate-300 text-[10px] mt-2 uppercase tracking-widest">&copy; {new Date().getFullYear()} PrintProfit Pro - Ijuí/RS</p>
      </footer>
    </div>
  );
};

export default App;
