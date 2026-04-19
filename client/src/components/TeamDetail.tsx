/**
 * TeamDetail - 队伍详情面板
 * Design: 明亮版 - 白底卡片 + 彩色点缀
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Target, Shield, Zap, MapPin, Star } from 'lucide-react';
import type { Team } from '@/data/teams';
import Stadium3D from './Stadium3D';

interface TeamDetailProps {
  team: Team | null;
  onClose: () => void;
}

export default function TeamDetail({ team, onClose }: TeamDetailProps) {
  return (
    <AnimatePresence mode="wait">
      {team && (
        <motion.div
          key={team.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 250 }}
          className="absolute top-0 right-0 bottom-0 w-full max-w-[420px] z-[1000] overflow-hidden"
        >
          {/* Backdrop - white/frosted glass */}
          <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl" />
          
          {/* Accent color top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color}60, transparent)` }}
          />
          
          {/* Content */}
          <div className="relative h-full overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Header */}
            <div className="relative p-5 pb-3">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-[oklch(0.95_0.003_260)] hover:bg-[oklch(0.92_0.005_260)] transition-colors border border-[oklch(0.90_0.005_260)]"
              >
                <X className="w-4 h-4 text-[oklch(0.45_0.02_260)]" />
              </button>

              {/* Rank badge with stamp animation */}
              <motion.div
                initial={{ scale: 2.5, rotate: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', damping: 10, stiffness: 200 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div
                  className="relative px-3 py-1.5 rounded-md"
                  style={{
                    background: `linear-gradient(135deg, ${team.color}, ${team.color}DD)`,
                    boxShadow: `0 4px 16px ${team.color}25`,
                  }}
                >
                  <span className="text-white font-black text-sm tracking-wider" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                    {team.rankLabel}
                  </span>
                  {/* Stamp corner marks */}
                  <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-white/40" />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-t border-r border-white/40" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-b border-l border-white/40" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-white/40" />
                </div>
                <span className="text-[oklch(0.60_0.02_260)] text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                  #{String(team.rank).padStart(2, '0')}
                </span>
              </motion.div>

              {/* Team name */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2
                  className="text-3xl font-black text-[oklch(0.18_0.02_260)] leading-tight"
                  style={{ fontFamily: "'Noto Serif SC', serif" }}
                >
                  {team.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-[oklch(0.55_0.02_260)]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-sm">{team.city}</span>
                </div>
              </motion.div>

              {/* Slogan */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 origin-left"
              >
                <div
                  className="relative px-4 py-2.5 rounded-lg"
                  style={{ 
                    background: `linear-gradient(90deg, ${team.color}10, ${team.color}05)`,
                    borderLeft: `3px solid ${team.color}`,
                  }}
                >
                  <p
                    className="text-base font-medium"
                    style={{
                      color: team.color,
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                  >
                    「{team.slogan}」
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="px-5 pb-4"
            >
              <div className="grid grid-cols-4 gap-2">
                <StatCard label="场次" value={team.stats.played} icon={<Shield className="w-3.5 h-3.5" />} color={team.color} delay={0.3} />
                <StatCard label="胜" value={team.stats.won} icon={<Trophy className="w-3.5 h-3.5" />} color="#388E3C" delay={0.35} />
                <StatCard label="平" value={team.stats.drawn} icon={<Target className="w-3.5 h-3.5" />} color="#F57C00" delay={0.4} />
                <StatCard label="负" value={team.stats.lost} icon={<Zap className="w-3.5 h-3.5" />} color="#D32F2F" delay={0.45} />
              </div>

              {/* Extended stats */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-[oklch(0.97_0.003_260)] rounded-lg p-3 border border-[oklch(0.92_0.005_260)]"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[oklch(0.55_0.02_260)] uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>Goals</span>
                    <span className="text-[oklch(0.25_0.02_260)] font-bold text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {team.stats.goalsFor} / {team.stats.goalsAgainst}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 bg-[oklch(0.92_0.005_260)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(team.stats.goalsFor / (team.stats.goalsFor + team.stats.goalsAgainst)) * 100}%` }}
                      transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${team.color}, ${team.color}AA)`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-[oklch(0.60_0.02_260)]">进球</span>
                    <span className="text-[9px] text-[oklch(0.60_0.02_260)]">失球</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="bg-[oklch(0.97_0.003_260)] rounded-lg p-3 border border-[oklch(0.92_0.005_260)]"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[oklch(0.55_0.02_260)] uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>GD</span>
                    <span
                      className="font-bold text-sm"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        color: team.stats.goalDiff > 0 ? '#388E3C' : team.stats.goalDiff < 0 ? '#D32F2F' : '#F57C00',
                      }}
                    >
                      {team.stats.goalDiff > 0 ? '+' : ''}{team.stats.goalDiff}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[10px] text-[oklch(0.55_0.02_260)] uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>PTS</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: 'spring' }}
                      className="text-[oklch(0.18_0.02_260)] font-black text-2xl"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {team.stats.points}
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* 3D Stadium */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-5 pb-4"
            >
              <SectionTitle icon={<Star className="w-3 h-3" />} title="3D STADIUM" />
              <Stadium3D team={team} />
            </motion.div>

            {/* Badge description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-5 pb-4"
            >
              <SectionTitle icon={<Shield className="w-3 h-3" />} title="队徽解读" />
              <p className="text-sm text-[oklch(0.45_0.02_260)] leading-relaxed mt-2">
                {team.badgeDesc}
              </p>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="px-5 pb-10"
            >
              <SectionTitle icon={<Trophy className="w-3 h-3" />} title="赛季亮点" />
              <div className="space-y-2 mt-3">
                {team.highlights.map((highlight, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.75 + i * 0.08 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="mt-1 relative">
                      <div
                        className="w-2 h-2 rounded-full shrink-0 group-hover:scale-150 transition-transform"
                        style={{ backgroundColor: team.color }}
                      />
                      {i < team.highlights.length - 1 && (
                        <div className="absolute top-2 left-[3px] w-[2px] h-5 bg-[oklch(0.92_0.005_260)]" />
                      )}
                    </div>
                    <span className="text-sm text-[oklch(0.40_0.02_260)] leading-relaxed">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Left edge decorative border */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[2px]"
            style={{
              background: `linear-gradient(180deg, ${team.color}, ${team.color}40, transparent)`,
            }}
          />
          
          {/* Left shadow for depth */}
          <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="text-[#D32F2F]">{icon}</div>
      <h3
        className="text-xs font-bold text-[oklch(0.50_0.02_260)] tracking-wider uppercase"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {title}
      </h3>
      <div className="flex-1 h-px bg-[oklch(0.92_0.005_260)]" />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  delay,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-[oklch(0.97_0.003_260)] rounded-lg p-2.5 border border-[oklch(0.92_0.005_260)] text-center hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-center gap-1 mb-1.5" style={{ color }}>
        {icon}
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', damping: 12 }}
        className="text-xl font-black text-[oklch(0.20_0.02_260)]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {value}
      </motion.div>
      <div className="text-[9px] text-[oklch(0.55_0.02_260)] mt-1 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}
