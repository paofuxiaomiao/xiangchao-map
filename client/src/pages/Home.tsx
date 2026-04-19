/**
 * Home - 湘超数字地图看板主页
 * Design: 「湘火燎原」明亮清晰版 - 白底红金点缀
 * 
 * Layout:
 * - 顶部: 标题栏 + 数据统计（红色渐变header）
 * - 左侧: 队伍排行列表 (260px)
 * - 中央: GIS地图 (主视觉 - 明亮底图)
 * - 右侧: 队伍详情面板 (弹出式)
 */

import { useState, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import HunanMap from '@/components/HunanMap';
import TeamList from '@/components/TeamList';
import TeamDetail from '@/components/TeamDetail';
import StatsBar from '@/components/StatsBar';
import LogoBadge from '@/components/LogoBadge';
import { teams, type Team, HERO_BANNER, leagueStats } from '@/data/teams';
import { Trophy, Map, ArrowLeft } from 'lucide-react';
import { assetPath, routePath } from '@/lib/sitePaths';

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [show3D, setShow3D] = useState(false);

  const handleTeamSelect = useCallback((team: Team | null) => {
    if (team === null) {
      setSelectedTeam(null);
      setShow3D(false);
    } else {
      setSelectedTeam((prev) => (prev?.id === team.id ? null : team));
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedTeam(null);
    setShow3D(false);
  }, []);

  const handleToggle3D = useCallback(() => {
    setShow3D((prev) => !prev);
  }, []);

  const handleResetView = useCallback(() => {
    setShow3D(false);
    setSelectedTeam(null);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[oklch(0.96_0.005_220)] flex flex-col">
      {/* Top Header Bar - Red gradient */}
      <header className="relative z-10 shrink-0">
        {/* Background - deep red gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #C62828 0%, #D32F2F 30%, #E53935 60%, #B71C1C 100%)',
            }}
          />
          {/* Subtle texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url(${HERO_BANNER})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              mixBlendMode: 'overlay',
            }}
          />
          {/* Noise grain */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
          }} />
        </div>
        
        <div className="relative px-5 py-3.5 flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-4">
            {/* Back to Landing */}
            <Link href={routePath('/')}>
              <motion.div
                whileHover={{ x: -3 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-white/80" />
              </motion.div>
            </Link>

            {/* Logo/Brand mark - White seal on red */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="relative"
            >
              <div className="w-11 h-11 rounded-sm flex items-center justify-center relative"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
              >
                <img src={assetPath('/assets/xiangchao-logo.png')} alt="湘超 LOGO" className="w-7 h-7 object-contain" />
                <div className="absolute inset-[3px] border border-white/10 rounded-[1px]" />
              </div>
              {/* Outer seal corner marks */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-white/30" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-white/30" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-white/30" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-white/30" />
            </motion.div>

            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1"
              >
                <span
                  className="text-[22px] font-black text-white tracking-wide"
                  style={{ fontFamily: "'Noto Serif SC', serif", textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                >
                  湘超
                </span>
                <span className="text-[22px] font-light text-white/40 mx-0.5">·</span>
                <span
                  className="text-[22px] font-black text-white/95 tracking-wide"
                  style={{ fontFamily: "'Noto Serif SC', serif", textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                >
                  数字地图看板
                </span>
              </motion.h1>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2.5 mt-0.5"
              >
                <span
                  className="text-[10px] text-white/50 tracking-[0.15em] uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Hunan Football League 2025
                </span>
                <div className="w-px h-3 bg-white/20" />
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white/10 border border-white/15">
                  <Trophy className="w-2.5 h-2.5 text-amber-300" />
                  <span className="text-[9px] text-amber-200 font-bold tracking-wider">
                    {leagueStats.champion}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href={routePath('/modules')}>
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/88 backdrop-blur-md transition hover:bg-white/15">
                功能模块
              </div>
            </Link>
            <Link href={routePath('/h5')}>
              <div className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-white/88 backdrop-blur-md transition hover:bg-black/30">
                H5
              </div>
            </Link>
            <div className="hidden xl:block">
              <StatsBar />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Team List - hidden in 3D mode */}
        <AnimatePresence>
          {!show3D && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              className="w-[260px] shrink-0 border-r border-[oklch(0.90_0.005_260)] bg-white hidden lg:block"
            >
              <TeamList selectedTeam={selectedTeam} onTeamSelect={handleTeamSelect} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center: Map */}
        <div className="flex-1 relative">
          <HunanMap
            onTeamSelect={handleTeamSelect}
            selectedTeam={selectedTeam}
            show3D={show3D}
            onToggle3D={handleToggle3D}
            onResetView={handleResetView}
          />
          
          {/* Floating info when no team selected */}
          <AnimatePresence>
            {!selectedTeam && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[600] hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/90 backdrop-blur-md border border-[oklch(0.90_0.005_260)] shadow-lg shadow-black/5"
              >
                <Map className="w-3.5 h-3.5 text-[#D32F2F]/60" />
                <span className="text-xs text-[oklch(0.45_0.02_260)]" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                  点击地图标记或左侧列表查看队伍详情
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mobile: Bottom team selector */}
          <div className="lg:hidden absolute bottom-4 left-4 right-4 z-[600]">
            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
              {teams.map((team) => {
                const isActive = selectedTeam?.id === team.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => handleTeamSelect(team)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isActive
                        ? 'text-white shadow-lg border-transparent'
                        : 'bg-white/90 text-[oklch(0.40_0.02_260)] backdrop-blur-sm border-[oklch(0.88_0.005_260)] shadow-sm'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: team.color,
                            boxShadow: `0 4px 12px ${team.color}40`,
                          }
                        : {}
                    }
                  >
                    {team.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team Detail Panel (overlays map on right) */}
          <TeamDetail team={selectedTeam} onClose={handleCloseDetail} />

          {/* Map control buttons - ABOVE TeamDetail in z-index */}
          <div className="absolute top-4 right-4 z-[1100] flex items-center gap-2">
            {/* 3D Satellite toggle button - only show when team selected and NOT in 3D */}
            <AnimatePresence>
              {selectedTeam && !show3D && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  onClick={handleToggle3D}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#D32F2F] to-[#E53935] hover:from-[#C62828] hover:to-[#D32F2F] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#D32F2F]/25 hover:shadow-xl hover:shadow-[#D32F2F]/30 border border-white/15 group"
                  style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                >
                  <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  实景三维
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md ml-0.5">3D</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Reset view button */}
            <button
              onClick={handleResetView}
              className="flex items-center gap-2 bg-white/90 hover:bg-white text-[oklch(0.35_0.02_260)] hover:text-[#D32F2F] px-4 py-2 rounded-lg text-sm font-medium transition-all border border-[oklch(0.88_0.005_260)] backdrop-blur-md shadow-md shadow-black/5 hover:shadow-lg hover:border-[#D32F2F]/20 group"
              style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
            >
              <svg className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              全省总览
            </button>
          </div>
        </div>
      </main>

      {/* Mobile stats bar */}
      <div className="lg:hidden shrink-0 border-t border-[oklch(0.90_0.005_260)] bg-white px-4 py-2 overflow-x-auto">
        <div className="mb-2 flex items-center justify-between gap-3">
          <LogoBadge compact subtitle="已接入官方 LOGO" />
          <div className="flex items-center gap-2">
            <Link href={routePath('/modules')}>
              <div className="rounded-full bg-[oklch(0.97_0.003_260)] px-3 py-1.5 text-xs font-medium text-[oklch(0.35_0.02_260)]">模块</div>
            </Link>
            <Link href={routePath('/h5')}>
              <div className="rounded-full bg-[#D32F2F] px-3 py-1.5 text-xs font-medium text-white">H5</div>
            </Link>
          </div>
        </div>
        <StatsBar />
      </div>
    </div>
  );
}
