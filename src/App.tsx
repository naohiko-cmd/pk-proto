/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  ChevronRight, 
  TrendingUp, 
  Target, 
  Users, 
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  Box
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Industry, 
  CompanySize, 
  ExhibitionPurpose, 
  CompanyProfile, 
  ExhibitionPlan, 
  PreparationTask 
} from './types';
import { generateExhibitionPlan, generatePreparationTasks } from './services/gemini';
import { format, addMonths, parseISO, isBefore, isAfter } from 'date-fns';
import { ja } from 'date-fns/locale';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [profile, setProfile] = useState<CompanyProfile>({
    industry: Industry.IT_SOFTWARE,
    size: CompanySize.MEDIUM,
    purpose: ExhibitionPurpose.LEAD_GEN,
    budget: 5000000,
    targetRegion: '全国'
  });

  const [plan, setPlan] = useState<ExhibitionPlan | null>(null);
  const [tasks, setTasks] = useState<PreparationTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'plan' | 'tasks'>('form');
  const [selectedExhibition, setSelectedExhibition] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const generatedPlan = await generateExhibitionPlan(profile);
      setPlan(generatedPlan);
      setActiveTab('plan');
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTasks = async (exhibitionName: string) => {
    setLoading(true);
    setSelectedExhibition(exhibitionName);
    try {
      // Assume exhibition is 6 months from now for demo purposes
      const targetDate = format(addMonths(new Date(), 6), 'yyyy-MM-dd');
      const generatedTasks = await generatePreparationTasks(exhibitionName, targetDate);
      setTasks(generatedTasks);
      setActiveTab('tasks');
    } catch (error) {
      console.error("Failed to generate tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 border-r border-[#141414]/10 bg-white/50 backdrop-blur-md z-50">
        <div className="p-8">
          <h1 className="text-2xl font-serif italic font-bold tracking-tight">ExhibiPlan</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Exhibition Strategy Tool</p>
        </div>

        <div className="mt-8 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('form')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              activeTab === 'form' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
            )}
          >
            <PlusCircle size={18} />
            <span className="text-sm font-medium">新規計画作成</span>
          </button>
          
          <button 
            disabled={!plan}
            onClick={() => setActiveTab('plan')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              !plan && "opacity-30 cursor-not-allowed",
              activeTab === 'plan' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
            )}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">提案プラン</span>
          </button>

          <button 
            disabled={tasks.length === 0}
            onClick={() => setActiveTab('tasks')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              tasks.length === 0 && "opacity-30 cursor-not-allowed",
              activeTab === 'tasks' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5"
            )}
          >
            <Calendar size={18} />
            <span className="text-sm font-medium">準備カレンダー</span>
          </button>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="p-4 rounded-xl bg-[#141414]/5 border border-[#141414]/10">
            <p className="text-[10px] uppercase tracking-widest opacity-50 mb-2">Current Project</p>
            <p className="text-xs font-bold truncate">{plan?.title || "未設定"}</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <header>
                  <h2 className="text-4xl font-serif italic mb-4">出展条件の入力</h2>
                  <p className="text-[#141414]/60 max-w-2xl">
                    貴社の業種や目的、予算に合わせて、AIが最適な展示会出展プランを提案します。
                    まずは基本的な情報を入力してください。
                  </p>
                </header>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <TrendingUp size={12} /> 業種
                      </label>
                      <select 
                        value={profile.industry}
                        onChange={(e) => setProfile({...profile, industry: e.target.value as Industry})}
                        className="w-full bg-white border border-[#141414]/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#141414]/20 transition-all"
                      >
                        {Object.values(Industry).map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <Users size={12} /> 企業規模
                      </label>
                      <select 
                        value={profile.size}
                        onChange={(e) => setProfile({...profile, size: e.target.value as CompanySize})}
                        className="w-full bg-white border border-[#141414]/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#141414]/20 transition-all"
                      >
                        {Object.values(CompanySize).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <Target size={12} /> 出展の主な目的
                      </label>
                      <select 
                        value={profile.purpose}
                        onChange={(e) => setProfile({...profile, purpose: e.target.value as ExhibitionPurpose})}
                        className="w-full bg-white border border-[#141414]/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#141414]/20 transition-all"
                      >
                        {Object.values(ExhibitionPurpose).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <Wallet size={12} /> 年間予算 (円)
                      </label>
                      <input 
                        type="number"
                        value={profile.budget}
                        onChange={(e) => setProfile({...profile, budget: parseInt(e.target.value)})}
                        className="w-full bg-white border border-[#141414]/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#141414]/20 transition-all"
                        placeholder="例: 5,000,000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-2">
                        <LayoutDashboard size={12} /> ターゲット地域
                      </label>
                      <input 
                        type="text"
                        value={profile.targetRegion}
                        onChange={(e) => setProfile({...profile, targetRegion: e.target.value})}
                        className="w-full bg-white border border-[#141414]/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#141414]/20 transition-all"
                        placeholder="例: 全国、関東圏、海外など"
                      />
                    </div>

                    <div className="pt-6">
                      <button 
                        onClick={handleGeneratePlan}
                        disabled={loading}
                        className="w-full bg-[#141414] text-[#E4E3E0] py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <ChevronRight />}
                        年間プランを生成する
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'plan' && plan && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <header className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-serif italic mb-2">{plan.title}</h2>
                    <p className="text-[#141414]/60 max-w-2xl">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest opacity-50">Total Budget</p>
                    <p className="text-3xl font-mono font-bold">¥{profile.budget.toLocaleString()}</p>
                  </div>
                </header>

                <section className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-widest opacity-50 border-b border-[#141414]/10 pb-2">推奨される展示会</h3>
                  <div className="grid gap-4">
                    {plan.suggestedExhibitions.map((ex, idx) => (
                      <div 
                        key={idx}
                        className="group bg-white border border-[#141414]/10 rounded-2xl p-6 flex items-center justify-between hover:border-[#141414] transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono bg-[#141414]/5 px-2 py-0.5 rounded uppercase">{ex.timing}</span>
                            <h4 className="text-xl font-bold">{ex.name}</h4>
                          </div>
                          <p className="text-sm text-[#141414]/60">{ex.reason}</p>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest opacity-50">Estimated Cost</p>
                            <p className="font-mono font-bold">¥{ex.estimatedCost.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => handleGenerateTasks(ex.name)}
                            className="bg-[#141414] text-[#E4E3E0] px-6 py-3 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all"
                          >
                            準備を開始
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex justify-between items-center border-b border-[#141414]/10 pb-2">
                    <h3 className="text-[10px] uppercase tracking-widest opacity-50">予算配分シミュレーション</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                      <Box size={12} /> ブース装飾は「パケテン」の利用を推奨
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {plan.budgetAllocation.map((item, idx) => (
                      <div key={idx} className="bg-white border border-[#141414]/10 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold uppercase tracking-tight">{item.category}</h4>
                          <p className="text-xs font-mono opacity-50">{Math.round((item.amount / profile.budget) * 100)}%</p>
                        </div>
                        <p className="text-2xl font-mono font-bold">¥{item.amount.toLocaleString()}</p>
                        <p className="text-xs text-[#141414]/60 leading-relaxed">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                <header className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-serif italic mb-2">{selectedExhibition} 準備ロードマップ</h2>
                    <p className="text-[#141414]/60">開催日に向けたステップバイステップの準備タスクです。</p>
                  </div>
                  <div className="flex gap-2">
                    {['planning', 'booth', 'marketing', 'logistics', 'followup'].map(cat => (
                      <span key={cat} className="text-[8px] uppercase tracking-widest border border-[#141414]/10 px-2 py-1 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </header>

                <div className="space-y-12 relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-px bg-[#141414]/10" />

                  {tasks.sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()).map((task, idx) => {
                    const date = parseISO(task.dueDate);
                    const isPast = isBefore(date, new Date());
                    
                    return (
                      <div key={task.id} className="relative pl-20 group">
                        {/* Timeline Dot */}
                        <div className={cn(
                          "absolute left-6 top-1.5 w-4 h-4 rounded-full border-2 border-[#E4E3E0] z-10 transition-all",
                          isPast ? "bg-[#141414]" : "bg-white border-[#141414]/20"
                        )} />
                        
                        <div className="flex gap-8 items-start">
                          <div className="w-32 pt-1">
                            <p className="text-xs font-mono font-bold">{format(date, 'yyyy/MM/dd')}</p>
                            <p className="text-[10px] uppercase tracking-widest opacity-40">{format(date, 'EEEE', { locale: ja })}</p>
                          </div>
                          
                          <div className="flex-1 bg-white border border-[#141414]/10 rounded-2xl p-6 group-hover:border-[#141414] transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-bold",
                                  task.category === 'planning' && "bg-blue-100 text-blue-800",
                                  task.category === 'booth' && "bg-purple-100 text-purple-800",
                                  task.category === 'marketing' && "bg-orange-100 text-orange-800",
                                  task.category === 'logistics' && "bg-green-100 text-green-800",
                                  task.category === 'followup' && "bg-slate-100 text-slate-800",
                                )}>
                                  {task.category}
                                </span>
                                {task.category === 'booth' && (
                                  <a 
                                    href="https://www.hakuten.co.jp/contents/service/paketen/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[9px] flex items-center gap-1 text-purple-600 hover:underline font-bold"
                                  >
                                    <ExternalLink size={10} /> Paketenで発注
                                  </a>
                                )}
                              </div>
                              {isPast ? (
                                <CheckCircle2 size={16} className="text-green-600" />
                              ) : (
                                <Clock size={16} className="text-orange-400" />
                              )}
                            </div>
                            <h4 className="text-lg font-bold mb-1">{task.title}</h4>
                            <p className="text-sm text-[#141414]/60 leading-relaxed">{task.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#E4E3E0]/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative">
              <Loader2 size={48} className="animate-spin text-[#141414]" />
              <div className="absolute inset-0 blur-xl bg-[#141414]/10 animate-pulse" />
            </div>
            <h3 className="mt-8 text-2xl font-serif italic">AIが最適なプランを構築中...</h3>
            <p className="mt-2 text-sm text-[#141414]/60 max-w-xs">
              業界トレンドと予算を分析し、貴社に最適な展示会戦略を導き出しています。少々お待ちください。
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
