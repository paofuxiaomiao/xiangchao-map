/**
 * StatsBar - 顶部赛事数据统计栏
 * Design: 明亮版 - 白色文字在红色header上
 * 赛程项hover弹出6个月时间线
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { leagueStats } from '@/data/teams';
import { Flame, Calendar, MapPin, Timer, Target } from 'lucide-react';

// 6个月赛程时间线数据
const scheduleTimeline = [
  { month: '5月', label: '开幕', desc: '揭幕战·常规赛开始', active: true },
  { month: '6月', label: '常规赛', desc: '小组循环赛阶段', active: true },
  { month: '7月', label: '常规赛', desc: '积分排名白热化', active: true },
  { month: '8月', label: '淘汰赛', desc: '八强·四强·半决赛', active: true },
  { month: '9月', label: '决赛', desc: '总决赛·冠军诞生', active: true },
  { month: '10月', label: '收官', desc: '颁奖典礼·赛季总结', active: false },
];

const stats = [
  { label: '总比赛', value: String(leagueStats.totalMatches), suffix: '场', icon: <Flame className="w-3 h-3" />, hasTimeline: false },
  { label: '总进球', value: String(leagueStats.totalGoals), suffix: '球', icon: <Target className="w-3 h-3" />, hasTimeline: false },
  { label: '参赛城市', value: String(leagueStats.cities), suffix: '城', icon: <MapPin className="w-3 h-3" />, hasTimeline: false },
  { label: '赛程', value: leagueStats.duration, suffix: '', icon: <Timer className="w-3 h-3" />, hasTimeline: true },
  { label: '今日日期', value: (() => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`; })(), suffix: '', icon: <Calendar className="w-3 h-3" />, hasTimeline: false },
];

export default function StatsBar() {
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <div className="flex items-center gap-5 overflow-x-auto px-1 py-0.5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 + index * 0.08 }}
          className="flex items-center gap-2 shrink-0 relative"
          onMouseEnter={() => stat.hasTimeline && setShowTimeline(true)}
          onMouseLeave={() => stat.hasTimeline && setShowTimeline(false)}
        >
          <div
            className="w-6 h-6 rounded-sm flex items-center justify-center bg-white/10 text-white/70"
          >
            {stat.icon}
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span
                className="text-white font-bold text-sm"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="text-[10px] text-white/50">
                  {stat.suffix}
                </span>
              )}
            </div>
            <span className="text-[9px] text-white/45 tracking-wider">{stat.label}</span>
          </div>

          {/* 赛程时间线弹出层 */}
          {stat.hasTimeline && (
            <AnimatePresence>
              {showTimeline && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 w-[360px] p-4 rounded-xl bg-white shadow-2xl shadow-black/15 border border-[oklch(0.90_0.005_260)]"
                >
                  {/* 箭头 */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-l border-t border-[oklch(0.90_0.005_260)]" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <Timer className="w-4 h-4 text-[#D32F2F]" />
                      <span className="text-sm font-black text-[oklch(0.20_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                        赛程时间线
                      </span>
                      <span className="text-[10px] text-[oklch(0.55_0.02_260)] ml-auto">2024赛季</span>
                    </div>

                    {/* 时间线 */}
                    <div className="relative">
                      {/* 连接线 */}
                      <div className="absolute left-[22px] top-3 bottom-3 w-[2px] bg-[oklch(0.92_0.005_260)]" />
                      
                      <div className="space-y-0">
                        {scheduleTimeline.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 py-1.5 relative">
                            {/* 圆点 */}
                            <div className="relative z-10 shrink-0 w-[46px] text-right">
                              <span className="text-[11px] font-bold text-[oklch(0.35_0.02_260)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                                {item.month}
                              </span>
                            </div>
                            <div
                              className={`relative z-10 mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ring-2 ${
                                item.active
                                  ? 'bg-[#D32F2F] ring-[#D32F2F]/20'
                                  : 'bg-[oklch(0.80_0.005_260)] ring-[oklch(0.90_0.005_260)]'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className={`text-xs font-bold ${item.active ? 'text-[#D32F2F]' : 'text-[oklch(0.55_0.02_260)]'}`}>
                                {item.label}
                              </div>
                              <div className="text-[10px] text-[oklch(0.55_0.02_260)] mt-0.5">
                                {item.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {index < stats.length - 1 && (
            <div className="w-px h-5 bg-white/15 ml-1" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
