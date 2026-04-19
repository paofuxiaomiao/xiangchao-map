/**
 * TeamList - 左侧队伍排行列表
 * Design: 明亮版 - 白底 + 红金点缀
 */

import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import { teams, type Team } from '@/data/teams';

interface TeamListProps {
  selectedTeam: Team | null;
  onTeamSelect: (team: Team) => void;
}

export default function TeamList({ selectedTeam, onTeamSelect }: TeamListProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm flex items-center justify-center bg-[#D32F2F]/8">
            <Trophy className="w-3.5 h-3.5 text-[#D32F2F]" />
          </div>
          <h3
            className="text-sm font-black tracking-wider text-[oklch(0.25_0.02_260)]"
            style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
          >
            队伍排行
          </h3>
        </div>
        <p className="text-[10px] text-[oklch(0.55_0.02_260)] mt-1.5 ml-[34px]" style={{ fontFamily: "'DM Mono', monospace" }}>
          2025 XIANGCHAO · TOP 10
        </p>
        <div className="mt-3 h-px bg-gradient-to-r from-[#D32F2F]/15 to-transparent" />
      </div>

      {/* Team list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
        {teams.map((team, index) => {
          const isSelected = selectedTeam?.id === team.id;
          return (
            <motion.button
              key={team.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.05, type: 'spring', damping: 20 }}
              onClick={() => onTeamSelect(team)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-left relative overflow-hidden ${
                isSelected
                  ? 'bg-[oklch(0.97_0.005_25)] shadow-sm'
                  : 'bg-transparent hover:bg-[oklch(0.97_0.003_260)]'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
                  style={{ backgroundColor: team.color }}
                />
              )}

              {/* Rank number */}
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-black relative"
                style={{
                  background: team.rank <= 3
                    ? `linear-gradient(135deg, ${team.color}18, ${team.color}08)`
                    : 'oklch(0.96 0.003 260)',
                  color: team.rank <= 3 ? team.color : 'oklch(0.55 0.02 260)',
                  fontFamily: "'DM Mono', monospace",
                  border: team.rank <= 3 ? `1px solid ${team.color}20` : '1px solid oklch(0.92 0.005 260)',
                }}
              >
                {team.rank}
              </div>

              {/* Team info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {/* Team color dot */}
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: team.color, boxShadow: `0 0 6px ${team.color}30` }}
                  />
                  <span
                    className={`text-sm font-bold truncate transition-colors ${
                      isSelected ? 'text-[oklch(0.20_0.02_260)]' : 'text-[oklch(0.30_0.02_260)] group-hover:text-[oklch(0.20_0.02_260)]'
                    }`}
                    style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                  >
                    {team.name}
                  </span>
                  {team.rank <= 3 && (
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider"
                      style={{
                        backgroundColor: `${team.color}12`,
                        color: team.color,
                        border: `1px solid ${team.color}18`,
                      }}
                    >
                      {team.rankLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 ml-4">
                  <span
                    className="text-[10px] text-[oklch(0.50_0.02_260)] font-medium"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {team.stats.points}pts
                  </span>
                  <span className="text-[8px] text-[oklch(0.80_0.005_260)]">|</span>
                  <span
                    className="text-[10px] text-[oklch(0.55_0.02_260)]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {team.stats.won}W {team.stats.drawn}D {team.stats.lost}L
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-all duration-200 ${
                  isSelected
                    ? 'text-[oklch(0.50_0.02_260)] opacity-100'
                    : 'text-[oklch(0.75_0.005_260)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[oklch(0.93_0.005_260)]">
        <p className="text-[9px] text-[oklch(0.65_0.01_260)] text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
          DATA SOURCE: 2025 XIANGCHAO LEAGUE
        </p>
      </div>
    </div>
  );
}
