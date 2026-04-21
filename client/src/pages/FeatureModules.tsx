import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  Flag,
  Megaphone,
  MessageSquare,
  Radio,
  Send,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users,
  Vote,
} from 'lucide-react';
import LogoBadge from '@/components/LogoBadge';
import { routePath } from '@/lib/sitePaths';
import {
  featureTeams,
  getTeamCultureProfile,
  getTeamDashboardProfile,
  initialFanMessages,
  leagueLeaders,
  liveReports,
  moduleStats,
  type FanMessage,
  type FeatureTeam,
  type TeamPlayerProfile,
} from '@/data/feature-data';

type ModuleView = 'dashboard' | 'interactive' | 'culture';
type DashboardTab = 'overview' | 'roster' | 'leaders';
type PlayerRatingEntry = { count: number; total: number; userScore?: number };

const VOTE_STORAGE_KEY = 'xiangchao_vote_extras_v1';
const VOTED_TEAM_STORAGE_KEY = 'xiangchao_voted_team_v1';
const MESSAGE_STORAGE_KEY = 'xiangchao_messages_v1';
const PLAYER_RATING_STORAGE_KEY = 'xiangchao_player_ratings_v1';
const CHEER_STORAGE_KEY = 'xiangchao_cheer_counts_v1';

const moduleViews: Array<{ id: ModuleView; label: string; desc: string; icon: typeof BarChart3 }> = [
  { id: 'dashboard', label: '数字看板', desc: '积分、阵容、教练与榜单', icon: BarChart3 },
  { id: 'interactive', label: '互动中心', desc: '评论、打分、投票与打气', icon: MessageSquare },
  { id: 'culture', label: '主场文化', desc: '城市故事、粉丝队与横幅墙', icon: Flag },
];

const dashboardTabs: Array<{ id: DashboardTab; label: string }> = [
  { id: 'overview', label: '球队总览' },
  { id: 'roster', label: '阵容档案' },
  { id: 'leaders', label: '联赛榜单' },
];

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function resolveInitialView(): ModuleView {
  if (typeof window === 'undefined') return 'dashboard';
  const view = new URLSearchParams(window.location.search).get('view');
  return view === 'interactive' || view === 'culture' || view === 'dashboard' ? view : 'dashboard';
}

export default function FeatureModules() {
  const [activeTeam, setActiveTeam] = useState<FeatureTeam>(featureTeams[0]);
  const [activeView, setActiveView] = useState<ModuleView>(resolveInitialView);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [voteExtras, setVoteExtras] = useState<Record<string, number>>({});
  const [votedTeamId, setVotedTeamId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FanMessage[]>(initialFanMessages);
  const [nickname, setNickname] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageTeamId, setMessageTeamId] = useState(featureTeams[0].id);
  const [playerRatings, setPlayerRatings] = useState<Record<string, PlayerRatingEntry>>({});
  const [cheerCounts, setCheerCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setVoteExtras(loadJson<Record<string, number>>(VOTE_STORAGE_KEY, {}));
    setVotedTeamId(loadJson<string | null>(VOTED_TEAM_STORAGE_KEY, null));
    setMessages(loadJson<FanMessage[]>(MESSAGE_STORAGE_KEY, initialFanMessages));
    setPlayerRatings(loadJson<Record<string, PlayerRatingEntry>>(PLAYER_RATING_STORAGE_KEY, {}));
    setCheerCounts(loadJson<Record<string, number>>(CHEER_STORAGE_KEY, {}));
  }, []);

  useEffect(() => {
    setMessageTeamId(activeTeam.id);
  }, [activeTeam.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search);
    search.set('view', activeView);
    const next = `${window.location.pathname}?${search.toString()}`;
    window.history.replaceState({}, '', next);
  }, [activeView]);

  const rankedTeams = useMemo(() => {
    return featureTeams
      .map((team) => ({
        ...team,
        totalVotes: team.voteBase + (voteExtras[team.id] ?? 0),
      }))
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }, [voteExtras]);

  const activeDashboard = useMemo(() => getTeamDashboardProfile(activeTeam.id), [activeTeam.id]);
  const activeCulture = useMemo(() => getTeamCultureProfile(activeTeam.id), [activeTeam.id]);

  const totalMessages = messages.length;
  const totalCheers = Object.entries(cheerCounts)
    .filter(([key]) => key.startsWith(`${activeTeam.id}:`))
    .reduce((sum, [, value]) => sum + value, 0);

  const averagePlayerRating = useMemo(() => {
    const players = activeDashboard.players;
    if (!players.length) return 4.2;
    const total = players.reduce((sum, player) => {
      const entry = playerRatings[player.id];
      const baseVotes = 12;
      const baseTotal = player.ratingBase * baseVotes;
      const avg = (baseTotal + (entry?.total ?? 0)) / (baseVotes + (entry?.count ?? 0));
      return sum + avg;
    }, 0);
    return total / players.length;
  }, [activeDashboard.players, playerRatings]);

  function handleVote(teamId: string) {
    if (votedTeamId) return;
    const next = { ...voteExtras, [teamId]: (voteExtras[teamId] ?? 0) + 1 };
    setVoteExtras(next);
    setVotedTeamId(teamId);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(next));
      window.localStorage.setItem(VOTED_TEAM_STORAGE_KEY, JSON.stringify(teamId));
    }
  }

  function handleSubmitMessage() {
    if (!nickname.trim() || !messageContent.trim()) return;
    const team = featureTeams.find((item) => item.id === messageTeamId) ?? activeTeam;
    const nextMessage: FanMessage = {
      id: `${Date.now()}`,
      teamId: team.id,
      teamName: team.teamName,
      nickname: nickname.trim(),
      content: messageContent.trim(),
      createdAt: '刚刚',
    };
    const next = [nextMessage, ...messages];
    setMessages(next);
    setNickname('');
    setMessageContent('');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(next));
    }
  }

  function handleRatePlayer(player: TeamPlayerProfile, score: number) {
    const current = playerRatings[player.id] ?? { count: 0, total: 0 };
    const nextEntry = current.userScore
      ? { ...current, total: current.total - current.userScore + score, userScore: score }
      : { count: current.count + 1, total: current.total + score, userScore: score };

    const next = { ...playerRatings, [player.id]: nextEntry };
    setPlayerRatings(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PLAYER_RATING_STORAGE_KEY, JSON.stringify(next));
    }
  }

  function handleCheer(template: string) {
    const key = `${activeTeam.id}:${template}`;
    const next = { ...cheerCounts, [key]: (cheerCounts[key] ?? 0) + 1 };
    setCheerCounts(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CHEER_STORAGE_KEY, JSON.stringify(next));
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(211,47,47,0.12),_transparent_28%),linear-gradient(180deg,#fff7f6_0%,#fffdfb_48%,#fff7f5_100%)] text-[oklch(0.22_0.02_260)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-[#D32F2F]/10 bg-white/88 p-5 shadow-[0_20px_70px_rgba(211,47,47,0.08)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <Link href={routePath('/')}>
                <a className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] px-4 py-2 text-sm text-[oklch(0.45_0.02_260)] transition hover:border-[#D32F2F]/20 hover:text-[#D32F2F]">
                  <ArrowLeft className="h-4 w-4" />
                  返回首页
                </a>
              </Link>

              <div className="mt-5 inline-flex rounded-[24px] border border-[#D32F2F]/10 bg-[#D32F2F]/[0.04] px-4 py-3">
                <LogoBadge subtitle="湘超数字看板与球迷互动中心" />
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D32F2F]/10 bg-[#D32F2F]/[0.05] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#D32F2F]">
                <Sparkles className="h-3.5 w-3.5" />
                湘超球队主题中心
              </div>

              <h1 className="mt-4 text-3xl font-black leading-tight text-[oklch(0.18_0.02_260)] sm:text-5xl" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                一站看懂球队实力、
                <span className="bg-gradient-to-r from-[#D32F2F] via-[#E53935] to-[#FF8A65] bg-clip-text text-transparent"> 主场氛围与球迷热度</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[oklch(0.45_0.02_260)] sm:text-base">
                在这里可以围绕当前球队查看 <strong>数字看板、互动中心、主场文化</strong> 三类内容，既能快速了解积分与阵容，也能继续浏览球迷声音、主场故事与城市特色。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
              {moduleStats.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-[oklch(0.92_0.005_260)] bg-[linear-gradient(180deg,#fff,#fff8f7)] p-4 shadow-sm">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{item.label}</div>
                  <div className="mt-2 text-2xl font-black text-[#D32F2F]" style={{ fontFamily: "'DM Mono', monospace" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {moduleViews.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`rounded-[28px] border p-5 text-left transition-all ${
                    isActive
                      ? 'border-transparent text-white shadow-[0_18px_50px_rgba(211,47,47,0.22)]'
                      : 'border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] hover:border-[#D32F2F]/20'
                  }`}
                  style={
                    isActive
                      ? { background: 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 45%, #FF7043 100%)' }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl p-3 ${isActive ? 'bg-white/10' : 'bg-[#D32F2F]/10 text-[#D32F2F]'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className={`text-xs uppercase tracking-[0.2em] ${isActive ? 'text-white/70' : 'text-[oklch(0.55_0.02_260)]'}`}>功能入口</div>
                      <div className="mt-1 text-xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{view.label}</div>
                    </div>
                  </div>
                  <p className={`mt-4 text-sm leading-6 ${isActive ? 'text-white/78' : 'text-[oklch(0.45_0.02_260)]'}`}>{view.desc}</p>
                </button>
              );
            })}
          </div>
        </header>

        <section className="sticky top-3 z-20 mt-6 rounded-[24px] border border-white/60 bg-white/90 p-3 shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">当前球队</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {featureTeams.map((team) => {
                  const active = activeTeam.id === team.id;
                  return (
                    <button
                      key={team.id}
                      onClick={() => setActiveTeam(team)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active ? 'border-transparent text-white shadow-lg' : 'border-[oklch(0.92_0.005_260)] bg-white text-[oklch(0.38_0.02_260)]'
                      }`}
                      style={active ? { backgroundColor: team.color, boxShadow: `0 12px 28px ${team.color}2E` } : undefined}
                    >
                      {team.teamName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {moduleViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeView === view.id ? 'bg-[#D32F2F] text-white shadow-lg shadow-[#D32F2F]/20' : 'bg-[oklch(0.985_0.002_260)] text-[oklch(0.46_0.02_260)]'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <main className="mt-6 space-y-6 pb-10">
          {activeView === 'dashboard' ? (
            <section className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[32px] border border-[#D32F2F]/10 bg-[linear-gradient(135deg,#fff4f2_0%,#ffffff_56%,#fff7f5_100%)] p-6 shadow-[0_18px_50px_rgba(211,47,47,0.08)] sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#D32F2F]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#D32F2F]">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Dashboard
                      </div>
                      <h2 className="mt-4 text-3xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                        {activeTeam.fullName}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-[oklch(0.45_0.02_260)]">{activeTeam.story}</p>
                    </div>
                    <div className="rounded-[28px] border border-white/70 bg-white/80 p-4 text-right shadow-sm">
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球队积分标签</div>
                      <div className="mt-2 text-2xl font-black" style={{ color: activeTeam.color, fontFamily: "'DM Mono', monospace" }}>{activeDashboard.pointsLabel}</div>
                      <div className="mt-2 text-xs text-[oklch(0.5_0.02_260)]">结合积分、阵容与教练信息，快速形成对球队状态的整体判断。</div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard title="主教练" value={activeDashboard.coach.name} helper={activeDashboard.coach.style} accent={activeTeam.color} />
                    <MetricCard title="阵容规模" value={activeDashboard.rosterSize} helper={activeDashboard.dataStatus} accent={activeTeam.color} />
                    <MetricCard title="平均身高" value={activeDashboard.averageHeight} helper={`平均体重 ${activeDashboard.averageWeight}`} accent={activeTeam.color} />
                    <MetricCard title="得分焦点" value={activeDashboard.scoringLeader} helper={activeTeam.lastSeasonRecord} accent={activeTeam.color} />
                  </div>
                </div>

                <div className="rounded-[32px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球队观察</div>
                      <h3 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球队焦点</h3>
                    </div>
                  </div>
                  <div className="mt-5 space-y-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">
                    <p>{activeTeam.fullName}当前以 <strong>{activeDashboard.pointsLabel}</strong> 作为赛季核心标签，结合主教练风格、阵容厚度与得分重点，能够较快勾勒出球队的竞争力轮廓。</p>
                    <p>{activeDashboard.coach.name}所代表的战术气质，与 {activeDashboard.scoringLeader} 的前场表现一起，构成了球队在本阶段最值得关注的攻防脉络。</p>
                  </div>
                  <div className="mt-5 rounded-[24px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4 text-sm leading-7 text-[oklch(0.42_0.02_260)]">
                    {activeDashboard.dataStatus}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap gap-2">
                  {dashboardTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setDashboardTab(tab.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        dashboardTab === tab.id ? 'bg-[#D32F2F] text-white shadow-lg shadow-[#D32F2F]/20' : 'bg-[oklch(0.985_0.002_260)] text-[oklch(0.46_0.02_260)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {dashboardTab === 'overview' ? (
                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[linear-gradient(180deg,#ffffff,#fff7f5)] p-5">
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球队气质</div>
                      <h3 className="mt-3 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif", color: activeTeam.color }}>{activeTeam.slogan}</h3>
                      <p className="mt-4 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{activeTeam.badgeDesc}</p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <InfoCard title="主场场馆" content={activeTeam.stadium} accent={activeTeam.color} />
                        <InfoCard title="上赛季结果" content={activeTeam.lastSeasonRecord} accent={activeTeam.color} />
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-5">
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">赛季亮点</div>
                      <div className="mt-4 space-y-3">
                        {activeTeam.seasonHighlights.map((item, index) => (
                          <div key={item} className="flex items-start gap-3">
                            <div className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeTeam.color, opacity: 1 - index * 0.16 }} />
                            <p className="text-sm leading-6 text-[oklch(0.42_0.02_260)]">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {dashboardTab === 'roster' ? (
                  <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Coach Profile</div>
                          <h3 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeDashboard.coach.name}</h3>
                        </div>
                      </div>
                      <div className="mt-5 rounded-[24px] border border-white/80 bg-white p-4 shadow-sm">
                        <div className="text-sm font-semibold" style={{ color: activeTeam.color }}>{activeDashboard.coach.title}</div>
                        <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{activeDashboard.coach.style}</p>
                      </div>
                      <div className="mt-4 rounded-[24px] border border-[oklch(0.92_0.005_260)] bg-white/80 p-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">
                        {activeDashboard.dataStatus}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {activeDashboard.players.map((player) => {
                        const ratingMeta = buildPlayerRatingMeta(player, playerRatings[player.id]);
                        return (
                          <div key={player.id} className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">#{player.jerseyNumber} · {player.position}</div>
                                <h4 className="mt-2 text-xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{player.name}</h4>
                              </div>
                              <div className="rounded-2xl px-3 py-1 text-sm font-black" style={{ backgroundColor: `${activeTeam.color}12`, color: activeTeam.color }}>
                                {ratingMeta.average.toFixed(1)}
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[oklch(0.45_0.02_260)]">
                              <MiniStat label="身高" value={player.height} />
                              <MiniStat label="体重" value={player.weight} />
                              <MiniStat label="进球" value={`${player.goals}`} />
                              <MiniStat label="评分票数" value={`${ratingMeta.count}`} />
                            </div>
                            <p className="mt-4 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{player.contribution}</p>
                            {player.dataStatus ? <div className="mt-3 text-xs text-[oklch(0.55_0.02_260)]">{player.dataStatus}</div> : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {dashboardTab === 'leaders' ? (
                  <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-4">
                      {leagueLeaders.map((leader) => (
                        <div key={leader.title} className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[linear-gradient(180deg,#ffffff,#fff9f7)] p-5 shadow-sm">
                          <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{leader.title}</div>
                          <div className="mt-2 text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif", color: leader.accent }}>{leader.value}</div>
                          <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{leader.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">League Ranking</div>
                          <h3 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球队热度与积分入口</h3>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {rankedTeams.slice(0, 8).map((team, index) => (
                          <div key={team.id} className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[oklch(0.985_0.002_260)] text-sm font-black text-[oklch(0.28_0.02_260)]">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold" style={{ color: team.color }}>{team.teamName}</div>
                              <div className="mt-1 text-xs text-[oklch(0.55_0.02_260)]">{team.lastSeasonRecord}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black" style={{ fontFamily: "'DM Mono', monospace" }}>{team.totalVotes}</div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Votes</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {activeView === 'interactive' ? (
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard title="球队热度票数" value={`${rankedTeams.find((team) => team.id === activeTeam.id)?.totalVotes ?? activeTeam.voteBase}`} helper="承接球队支持投票" accent={activeTeam.color} />
                <MetricCard title="球员平均评分" value={averagePlayerRating.toFixed(1)} helper="本地实时反馈，可继续接接口" accent={activeTeam.color} />
                <MetricCard title="线上打气次数" value={`${totalCheers}`} helper={`评论数 ${totalMessages}`} accent={activeTeam.color} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
                <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                      <Vote className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球迷互动</div>
                      <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球队热度投票</h2>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">为你支持的球队投出一票，实时查看当前人气变化与球迷热度排行。</p>
                  <div className="mt-5 space-y-3">
                    {rankedTeams.slice(0, 6).map((team, index) => (
                      <div key={team.id} className="flex items-center gap-4 rounded-2xl border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black">{index + 1}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold" style={{ color: team.color }}>{team.teamName}</div>
                          <div className="mt-1 text-xs text-[oklch(0.55_0.02_260)]">{team.city}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black" style={{ fontFamily: "'DM Mono', monospace" }}>{team.totalVotes}</div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Votes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {featureTeams.slice(0, 8).map((team) => {
                      const disabled = Boolean(votedTeamId);
                      const isSelected = votedTeamId === team.id;
                      return (
                        <button
                          key={team.id}
                          onClick={() => handleVote(team.id)}
                          disabled={disabled}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            isSelected
                              ? 'border-transparent text-white shadow-lg'
                              : 'border-[oklch(0.92_0.005_260)] bg-white hover:border-[#D32F2F]/20'
                          } ${disabled && !isSelected ? 'opacity-60' : ''}`}
                          style={isSelected ? { background: `linear-gradient(135deg, ${team.color}, ${team.color}CC)` } : undefined}
                        >
                          <div className="font-semibold">{team.teamName}</div>
                          <div className={`mt-1 text-xs ${isSelected ? 'text-white/75' : 'text-[oklch(0.55_0.02_260)]'}`}>{isSelected ? '本机已投票' : '点击投出 1 票'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                        <Star className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球迷互动</div>
                        <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球员打分</h2>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">为球员送出你的赛场评分，直观看到当前阵容在球迷视角中的关注度与表现印象。</p>
                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                      {activeDashboard.players.map((player) => {
                        const ratingMeta = buildPlayerRatingMeta(player, playerRatings[player.id]);
                        return (
                          <div key={player.id} className="rounded-[24px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">#{player.jerseyNumber} · {player.position}</div>
                                <div className="mt-1 text-lg font-black">{player.name}</div>
                              </div>
                              <div className="rounded-full px-3 py-1 text-sm font-black" style={{ backgroundColor: `${activeTeam.color}12`, color: activeTeam.color }}>{ratingMeta.average.toFixed(1)}</div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {[1, 2, 3, 4, 5].map((score) => (
                                <button
                                  key={score}
                                  onClick={() => handleRatePlayer(player, score)}
                                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${ratingMeta.userScore === score ? 'bg-[#D32F2F] text-white' : 'bg-white text-[oklch(0.45_0.02_260)]'}`}
                                >
                                  {score} 分
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 text-xs text-[oklch(0.55_0.02_260)]">已采集 {ratingMeta.count} 次评分，当前设备评分：{ratingMeta.userScore ?? '未选择'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                          <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球迷互动</div>
                          <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>线上打气</h2>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {activeCulture.cheerTemplates.map((template) => {
                          const count = cheerCounts[`${activeTeam.id}:${template}`] ?? 0;
                          return (
                            <button
                              key={template}
                              onClick={() => handleCheer(template)}
                              className="flex w-full items-center justify-between rounded-2xl border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] px-4 py-3 text-left transition hover:border-[#D32F2F]/20"
                            >
                              <div>
                                <div className="font-semibold">{template}</div>
                                <div className="mt-1 text-xs text-[oklch(0.55_0.02_260)]">点击一次即可加入线上应援热度</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-black" style={{ color: activeTeam.color, fontFamily: "'DM Mono', monospace" }}>{count}</div>
                                <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Heat</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                          <Send className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">球迷互动</div>
                          <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>比赛评论区</h2>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3">
                        <input
                          value={nickname}
                          onChange={(event) => setNickname(event.target.value)}
                          placeholder="你的昵称"
                          className="h-11 rounded-2xl border border-[oklch(0.90_0.005_260)] bg-[oklch(0.985_0.002_260)] px-4 text-sm outline-none transition focus:border-[#D32F2F]/40"
                        />
                        <select
                          value={messageTeamId}
                          onChange={(event) => setMessageTeamId(event.target.value)}
                          className="h-11 rounded-2xl border border-[oklch(0.90_0.005_260)] bg-[oklch(0.985_0.002_260)] px-4 text-sm outline-none transition focus:border-[#D32F2F]/40"
                        >
                          {featureTeams.map((team) => (
                            <option key={team.id} value={team.id}>{team.teamName}</option>
                          ))}
                        </select>
                        <textarea
                          value={messageContent}
                          onChange={(event) => setMessageContent(event.target.value)}
                          placeholder={`写下你对 ${featureTeams.find((team) => team.id === messageTeamId)?.teamName ?? activeTeam.teamName} 的评价或赛前打气`}
                          className="min-h-[118px] rounded-3xl border border-[oklch(0.90_0.005_260)] bg-[oklch(0.985_0.002_260)] px-4 py-3 text-sm outline-none transition focus:border-[#D32F2F]/40"
                        />
                        <button
                          onClick={handleSubmitMessage}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D32F2F] to-[#E53935] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#D32F2F]/20 transition hover:translate-y-[-1px]"
                        >
                          <Send className="h-4 w-4" />
                          发送评论
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Live Community</div>
                    <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>最新评论与战报联动</h2>
                  </div>
                </div>
                <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-3">
                    {messages.slice(0, 6).map((message) => (
                      <div key={message.id} className="rounded-3xl border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold">{message.nickname}</div>
                          <div className="text-xs text-[oklch(0.55_0.02_260)]">{message.createdAt}</div>
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#D32F2F]">{message.teamName}</div>
                        <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{message.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {liveReports.slice(0, 3).map((report) => (
                      <motion.div key={report.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[linear-gradient(180deg,#ffffff,#fff8f6)] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{report.title}</div>
                            <div className="mt-2 text-lg font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{report.homeTeam} VS {report.awayTeam}</div>
                          </div>
                          <div className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClassName(report.type)}`}>{badgeLabel(report.type, report.minute)}</div>
                        </div>
                        <div className="mt-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{report.summary}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeView === 'culture' ? (
            <section className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
                <div className="rounded-[32px] border border-[#D32F2F]/10 bg-[linear-gradient(135deg,#fff5f3_0%,#ffffff_48%,#fff9f7_100%)] p-6 shadow-[0_18px_50px_rgba(211,47,47,0.08)] sm:p-7">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#D32F2F]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#D32F2F]">
                    <Flag className="h-3.5 w-3.5" />
                    Home Culture
                  </div>
                  <h2 className="mt-4 text-3xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeCulture.title}</h2>
                  <p className="mt-4 text-sm leading-8 text-[oklch(0.42_0.02_260)]">{activeCulture.culturalStory}</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <InfoCard title="文化锚点" content={activeCulture.culturalAnchor} accent={activeTeam.color} />
                    <InfoCard title="主场标语" content={activeTeam.slogan} accent={activeTeam.color} />
                  </div>
                </div>

                <div className="grid gap-4">
                  <InfoCard title="啦啦队" content={activeCulture.cheerSquad} accent={activeTeam.color} />
                  <InfoCard title="粉丝队" content={activeCulture.supporterGroup} accent={activeTeam.color} />
                  <div className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-white p-5 shadow-sm">
                    <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">主场导览</div>
                    <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">从城市锚点、球迷组织到横幅记忆，这里汇集了最能代表 {activeTeam.city} 主场气质的观赛线索与氛围内容。</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
                <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Cheer Ritual</div>
                      <h3 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>啦啦队与看台仪式</h3>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {activeCulture.rituals.map((item, index) => (
                      <div key={item} className="flex gap-4 rounded-2xl border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ backgroundColor: activeTeam.color }}>{index + 1}</div>
                        <p className="text-sm leading-7 text-[oklch(0.42_0.02_260)]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                      <Flag className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Banner Wall</div>
                      <h3 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球迷横幅墙</h3>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4">
                    {activeCulture.bannerSamples.map((banner, index) => (
                      <div key={banner} className="rounded-[24px] border border-dashed border-[#D32F2F]/20 bg-[linear-gradient(135deg,rgba(211,47,47,0.06),rgba(255,255,255,0.92))] p-5">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.55_0.02_260)]">Banner {index + 1}</div>
                        <div className="mt-2 text-lg font-black" style={{ color: activeTeam.color, fontFamily: "'Noto Serif SC', serif" }}>{banner}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function MetricCard({ title, value, helper, accent }: { title: string; value: string; helper: string; accent: string }) {
  return (
    <div className="rounded-[24px] border border-[oklch(0.92_0.005_260)] bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{title}</div>
      <div className="mt-3 text-2xl font-black leading-tight" style={{ color: accent, fontFamily: "'Noto Serif SC', serif" }}>{value}</div>
      <div className="mt-2 text-xs leading-6 text-[oklch(0.55_0.02_260)]">{helper}</div>
    </div>
  );
}

function InfoCard({ title, content, accent }: { title: string; content: string; accent: string }) {
  return (
    <div className="rounded-[24px] border border-[oklch(0.92_0.005_260)] bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{title}</div>
      <div className="mt-3 text-sm font-medium leading-7" style={{ color: accent }}>{content}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{label}</div>
      <div className="mt-2 text-sm font-black">{value}</div>
    </div>
  );
}

function buildPlayerRatingMeta(player: TeamPlayerProfile, entry?: PlayerRatingEntry) {
  const baseVotes = 12;
  const totalVotes = baseVotes + (entry?.count ?? 0);
  const average = (player.ratingBase * baseVotes + (entry?.total ?? 0)) / totalVotes;
  return {
    average,
    count: totalVotes,
    userScore: entry?.userScore,
  };
}

function badgeClassName(type: 'live' | 'upcoming' | 'finished') {
  if (type === 'live') return 'bg-[#D32F2F]/10 text-[#D32F2F]';
  if (type === 'upcoming') return 'bg-[#FFB300]/12 text-[#B26A00]';
  return 'bg-[oklch(0.92_0.005_260)] text-[oklch(0.45_0.02_260)]';
}

function badgeLabel(type: 'live' | 'upcoming' | 'finished', minute?: string) {
  if (type === 'live') return minute ? `LIVE · ${minute}` : 'LIVE';
  if (type === 'upcoming') return 'PREVIEW';
  return 'FULL TIME';
}
