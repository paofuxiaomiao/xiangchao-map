/**
 * StatsBar - 顶部赛事数据统计栏
 * Design: 明亮版 - 白色文字在红色header上
 */

import { motion } from 'framer-motion';
import { leagueStats } from '@/data/teams';
import { Flame, Users, MapPin, Timer, Target } from 'lucide-react';

const stats = [
  { label: '总比赛', value: String(leagueStats.totalMatches), suffix: '场', icon: <Flame className="w-3 h-3" />, },
  { label: '总进球', value: String(leagueStats.totalGoals), suffix: '球', icon: <Target className="w-3 h-3" />, },
  { label: '参赛城市', value: String(leagueStats.cities), suffix: '城', icon: <MapPin className="w-3 h-3" />, },
  { label: '赛程', value: leagueStats.duration, suffix: '', icon: <Timer className="w-3 h-3" />, },
  { label: '文旅消费', value: leagueStats.tourismRevenue, suffix: '', icon: <Users className="w-3 h-3" />, },
];

export default function StatsBar() {
  return (
    <div className="flex items-center gap-5 overflow-x-auto px-1 py-0.5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 + index * 0.08 }}
          className="flex items-center gap-2 shrink-0"
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
          {index < stats.length - 1 && (
            <div className="w-px h-5 bg-white/15 ml-1" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
