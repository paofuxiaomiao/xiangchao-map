import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Flag,
  Heart,
  MessageSquare,
  Send,
  Shield,
  Star,
  Trophy,
  Users,
  Vote,
  Zap,
} from 'lucide-react';
import LogoBadge from '@/components/LogoBadge';
import { assetPath, routePath } from '@/lib/sitePaths';
import {
  featureTeams,
  getTeamCultureProfile,
  getTeamDashboardProfile,
  initialFanMessages,
  leagueLeaders,
  liveReports,
  type FanMessage,
  type FeatureTeam,
  type TeamPlayerProfile,
} from '@/data/feature-data';

/* ─── Types ─── */
type ModuleView = 'dashboard' | 'interactive' | 'culture';
type DashboardTab = 'overview' | 'roster' | 'leaders';
type InteractiveTab = 'vote' | 'rate' | 'cheer' | 'comment';
type PlayerRatingEntry = { count: number; total: number; userScore?: number };

/* ─── Storage keys ─── */
const VOTE_STORAGE_KEY = 'xiangchao_vote_extras_v1';
const VOTED_TEAM_STORAGE_KEY = 'xiangchao_voted_team_v1';
const MESSAGE_STORAGE_KEY = 'xiangchao_messages_v1';
const PLAYER_RATING_STORAGE_KEY = 'xiangchao_player_ratings_v1';
const CHEER_STORAGE_KEY = 'xiangchao_cheer_counts_v1';

/* ─── Design tokens ─── */
const R = '#8F1F1F';
const R_SOFT = '#A62C2C';

/* ─── Config ─── */
const viewConfig: Array<{ id: ModuleView; label: string; icon: typeof BarChart3 }> = [
  { id: 'dashboard', label: '数字看板', icon: BarChart3 },
  { id: 'interactive', label: '互动中心', icon: MessageSquare },
  { id: 'culture', label: '主场文化', icon: Flag },
];

const interactiveTabs: Array<{ id: InteractiveTab; label: string; icon: typeof Vote }> = [
  { id: 'vote', label: '投票', icon: Vote },
  { id: 'rate', label: '打分', icon: Star },
  { id: 'cheer', label: '打气', icon: Zap },
  { id: 'comment', label: '留言', icon: MessageSquare },
];

const dashboardTabs: Array<{ id: DashboardTab; label: string }> = [
  { id: 'overview', label: '球队总览' },
  { id: 'roster', label: '阵容档案' },
  { id: 'leaders', label: '联赛榜单' },
];

const cultureThemeMap: Partial<Record<string, { image: string }>> = {
  zhuzhou: { image: assetPath('assets/zhuzhou_yandi_bg.jpg') },
  yongzhou: { image: assetPath('assets/yongzhou_shundi_bg.jpg') },
};

/* ─── Helpers ─── */
function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function resolveInitialView(): ModuleView {
  if (typeof window === 'undefined') return 'dashboard';
  const v = new URLSearchParams(window.location.search).get('view');
  return v === 'interactive' || v === 'culture' || v === 'dashboard' ? v : 'dashboard';
}

function buildPlayerRatingMeta(player: TeamPlayerProfile, entry?: PlayerRatingEntry) {
  const base = 12;
  const total = base + (entry?.count ?? 0);
  return { average: (player.ratingBase * base + (entry?.total ?? 0)) / total, count: total, userScore: entry?.userScore };
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function FeatureModules() {
  /* ── State ── */
  const [activeTeam, setActiveTeam] = useState<FeatureTeam>(featureTeams[0]);
  const [activeView, setActiveView] = useState<ModuleView>(resolveInitialView);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [interactiveTab, setInteractiveTab] = useState<InteractiveTab>('vote');
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);

  const [voteExtras, setVoteExtras] = useState<Record<string, number>>({});
  const [votedTeamId, setVotedTeamId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FanMessage[]>(initialFanMessages);
  const [nickname, setNickname] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageTeamId, setMessageTeamId] = useState(featureTeams[0].id);
  const [playerRatings, setPlayerRatings] = useState<Record<string, PlayerRatingEntry>>({});
  const [cheerCounts, setCheerCounts] = useState<Record<string, number>>({});

  /* ── Effects ── */
  useEffect(() => {
    setVoteExtras(loadJson(VOTE_STORAGE_KEY, {}));
    setVotedTeamId(loadJson(VOTED_TEAM_STORAGE_KEY, null));
    setMessages(loadJson(MESSAGE_STORAGE_KEY, initialFanMessages));
    setPlayerRatings(loadJson(PLAYER_RATING_STORAGE_KEY, {}));
    setCheerCounts(loadJson(CHEER_STORAGE_KEY, {}));
  }, []);

  useEffect(() => { setMessageTeamId(activeTeam.id); }, [activeTeam.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = new URLSearchParams(window.location.search);
    s.set('view', activeView);
    window.history.replaceState({}, '', `${window.location.pathname}?${s}`);
  }, [activeView]);

  /* ── Derived ── */
  const rankedTeams = useMemo(() =>
    featureTeams
      .map((t) => ({ ...t, totalVotes: t.voteBase + (voteExtras[t.id] ?? 0) }))
      .sort((a, b) => b.totalVotes - a.totalVotes),
    [voteExtras],
  );

  const dash = useMemo(() => getTeamDashboardProfile(activeTeam.id), [activeTeam.id]);
  const culture = useMemo(() => getTeamCultureProfile(activeTeam.id), [activeTeam.id]);
  const teamRank = rankedTeams.findIndex((t) => t.id === activeTeam.id) + 1;
  const teamVotes = rankedTeams.find((t) => t.id === activeTeam.id)?.totalVotes ?? activeTeam.voteBase;
  const teamCheers = Object.entries(cheerCounts)
    .filter(([k]) => k.startsWith(`${activeTeam.id}:`))
    .reduce((s, [, v]) => s + v, 0);

  /* ── Handlers ── */
  function handleVote(teamId: string) {
    if (votedTeamId) return;
    const next = { ...voteExtras, [teamId]: (voteExtras[teamId] ?? 0) + 1 };
    setVoteExtras(next);
    setVotedTeamId(teamId);
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(VOTED_TEAM_STORAGE_KEY, JSON.stringify(teamId));
  }

  function handleRate(player: TeamPlayerProfile, score: number) {
    const cur = playerRatings[player.id] ?? { count: 0, total: 0 };
    const entry = cur.userScore
      ? { ...cur, total: cur.total - cur.userScore + score, userScore: score }
      : { count: cur.count + 1, total: cur.total + score, userScore: score };
    const next = { ...playerRatings, [player.id]: entry };
    setPlayerRatings(next);
    localStorage.setItem(PLAYER_RATING_STORAGE_KEY, JSON.stringify(next));
  }

  function handleCheer(tpl: string) {
    const key = `${activeTeam.id}:${tpl}`;
    const next = { ...cheerCounts, [key]: (cheerCounts[key] ?? 0) + 1 };
    setCheerCounts(next);
    localStorage.setItem(CHEER_STORAGE_KEY, JSON.stringify(next));
  }

  function handleSubmitMessage() {
    if (!nickname.trim() || !messageContent.trim()) return;
    const team = featureTeams.find((t) => t.id === messageTeamId) ?? activeTeam;
    const msg: FanMessage = {
      id: `${Date.now()}`,
      teamId: team.id,
      teamName: team.teamName,
      nickname: nickname.trim(),
      content: messageContent.trim(),
      createdAt: '刚刚',
    };
    const next = [msg, ...messages];
    setMessages(next);
    setNickname('');
    setMessageContent('');
    localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(next));
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[oklch(0.22_0.02_260)]">
      {/* ────────────────── TOP BAR ────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#ece4db] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          {/* Logo & back */}
          <Link href={routePath('/')}>
            <a className="flex items-center gap-2 text-sm text-[oklch(0.45_0.02_260)] transition hover:text-[#8F1F1F]">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">首页</span>
            </a>
          </Link>

          <div className="h-5 w-px bg-[#e5ddd5]" />

          {/* Team picker */}
          <div className="relative">
            <button
              onClick={() => setTeamPickerOpen(!teamPickerOpen)}
              className="flex items-center gap-2 rounded-full border border-[#e5ddd5] bg-white px-3 py-1.5 text-sm font-bold transition hover:border-[#8F1F1F]/20"
            >
              <div className="h-5 w-5 rounded-full" style={{ background: activeTeam.color }} />
              {activeTeam.teamName}
              <ChevronDown className={`h-3.5 w-3.5 text-[oklch(0.55_0.02_260)] transition ${teamPickerOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {teamPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-[#e5ddd5] bg-white p-2 shadow-xl"
                >
                  {featureTeams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTeam(t); setTeamPickerOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                        activeTeam.id === t.id ? 'bg-[#8F1F1F]/6 font-bold text-[#8F1F1F]' : 'hover:bg-[#faf5f0]'
                      }`}
                    >
                      <div className="h-3.5 w-3.5 rounded-full" style={{ background: t.color }} />
                      {t.teamName}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* View switcher */}
          <nav className="flex gap-1 rounded-full border border-[#e5ddd5] bg-[#faf8f5] p-1">
            {viewConfig.map((v) => {
              const Icon = v.icon;
              const active = activeView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active ? 'bg-[#8F1F1F] text-white shadow-sm' : 'text-[oklch(0.45_0.02_260)] hover:bg-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ────────────────── CONTENT ────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* ═══ DASHBOARD VIEW ═══ */}
        {activeView === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Team hero */}
            <section className="relative overflow-hidden rounded-3xl border border-[#e5ddd5] bg-white">
              <div className="absolute inset-y-0 right-0 w-1/3 opacity-[0.06]" style={{ background: `linear-gradient(135deg, ${activeTeam.color}, transparent)` }} />
              <div className="relative px-8 py-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.55_0.02_260)]">球队中心 · TOP {teamRank}</p>
                <h1 className="mt-3 text-4xl font-black" style={{ fontFamily: "'Noto Serif SC', serif", color: R }}>{activeTeam.fullName}</h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[oklch(0.45_0.02_260)]">{activeTeam.slogan} — {activeTeam.story}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Chip label="积分" value={dash.pointsLabel} />
                  <Chip label="主教练" value={dash.coach.name} />
                  <Chip label="阵容" value={dash.rosterSize} />
                  <Chip label="主场" value={activeTeam.stadium} />
                </div>
              </div>
            </section>

            {/* Dashboard tabs */}
            <div className="flex gap-2">
              {dashboardTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDashboardTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    dashboardTab === tab.id ? 'bg-[#8F1F1F] text-white' : 'bg-white border border-[#e5ddd5] text-[oklch(0.45_0.02_260)] hover:border-[#8F1F1F]/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {dashboardTab === 'overview' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardLabel>球队气质</CardLabel>
                  <h3 className="mt-2 text-xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeTeam.slogan}</h3>
                  <p className="mt-3 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{activeTeam.story}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <MiniStat label="平均身高" value={dash.averageHeight} />
                    <MiniStat label="平均体重" value={dash.averageWeight} />
                    <MiniStat label="得分焦点" value={dash.scoringLeader} />
                    <MiniStat label="上赛季" value={activeTeam.lastSeasonRecord} />
                  </div>
                </Card>
                <Card>
                  <CardLabel>赛季看点</CardLabel>
                  <div className="mt-3 space-y-3">
                    {activeTeam.seasonHighlights.map((h, i) => (
                      <div key={h} className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: i === 0 ? R : R_SOFT }} />
                        <p className="text-sm leading-7 text-[oklch(0.45_0.02_260)]">{h}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl bg-[#faf8f5] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">教练观察</p>
                    <p className="mt-2 text-sm font-bold">{dash.coach.name} · {dash.coach.title}</p>
                    <p className="mt-1 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{dash.coach.style}。{dash.coach.note}</p>
                  </div>
                </Card>
              </div>
            )}

            {dashboardTab === 'roster' && (
              <div className="space-y-6">
                <Card>
                  <CardLabel>教练团队</CardLabel>
                  <h3 className="mt-2 text-xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{dash.coach.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{dash.coach.title} · {dash.coach.style}</p>
                  <p className="mt-2 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{dash.coach.note}</p>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {dash.players.map((p) => {
                    const meta = buildPlayerRatingMeta(p, playerRatings[p.id]);
                    return (
                      <Card key={p.id}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-[oklch(0.55_0.02_260)]">#{p.jerseyNumber} · {p.position}</p>
                            <h4 className="mt-1 text-lg font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{p.name}</h4>
                          </div>
                          <div className="rounded-full bg-[#8F1F1F]/8 px-2.5 py-1 text-sm font-black text-[#8F1F1F]">{meta.average.toFixed(1)}</div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <MiniStat label="进球" value={`${p.goals}`} />
                          <MiniStat label="身高" value={p.height} />
                          <MiniStat label="体重" value={p.weight} />
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{p.contribution}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {dashboardTab === 'leaders' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  {leagueLeaders.map((l) => (
                    <Card key={l.title}>
                      <CardLabel>{l.title}</CardLabel>
                      <div className="mt-2 text-2xl font-black" style={{ color: l.accent, fontFamily: "'Noto Serif SC', serif" }}>{l.value}</div>
                      <p className="mt-2 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{l.detail}</p>
                    </Card>
                  ))}
                </div>
                <Card>
                  <CardLabel>球队热度排行</CardLabel>
                  <div className="mt-4 space-y-2">
                    {rankedTeams.slice(0, 8).map((t, i) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-xl bg-[#faf8f5] px-4 py-3">
                        <span className="w-6 text-center text-sm font-black text-[oklch(0.40_0.02_260)]">{i + 1}</span>
                        <div className="h-3 w-3 rounded-full" style={{ background: t.color }} />
                        <span className="flex-1 text-sm font-bold" style={{ color: t.color }}>{t.teamName}</span>
                        <span className="text-sm font-black" style={{ fontFamily: "'DM Mono', monospace" }}>{t.totalVotes}</span>
                        <span className="text-[10px] text-[oklch(0.55_0.02_260)]">票</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ INTERACTIVE VIEW ═══ */}
        {activeView === 'interactive' && (
          <motion.div key="interactive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Sub-tab bar */}
            <div className="flex items-center gap-6 border-b border-[#ece4db]">
              {interactiveTabs.map((tab) => {
                const Icon = tab.icon;
                const active = interactiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInteractiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-semibold transition ${
                      active ? 'border-[#8F1F1F] text-[#8F1F1F]' : 'border-transparent text-[oklch(0.50_0.02_260)] hover:text-[oklch(0.30_0.02_260)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── VOTE TAB ── */}
            {interactiveTab === 'vote' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球队热度投票</h2>
                  <p className="mt-2 text-sm text-[oklch(0.50_0.02_260)]">每人限投一票，为你支持的球队加油</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {rankedTeams.map((team, index) => {
                    const isVoted = votedTeamId === team.id;
                    const disabled = Boolean(votedTeamId);
                    return (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group relative overflow-hidden rounded-2xl border bg-white p-5 transition ${
                          isVoted ? 'border-[#8F1F1F]/30 shadow-md' : 'border-[#e5ddd5] hover:shadow-sm'
                        }`}
                      >
                        {isVoted && <div className="absolute inset-x-0 top-0 h-1" style={{ background: team.color }} />}
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black" style={{ background: `${team.color}12`, color: team.color }}>{index + 1}</div>
                          <div className="flex-1">
                            <div className="font-bold" style={{ color: team.color }}>{team.teamName}</div>
                            <div className="mt-0.5 text-xs text-[oklch(0.55_0.02_260)]">{team.totalVotes} 票</div>
                          </div>
                          {!disabled ? (
                            <button
                              onClick={() => handleVote(team.id)}
                              className="rounded-full bg-[#8F1F1F] px-4 py-1.5 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
                            >
                              投票
                            </button>
                          ) : isVoted ? (
                            <span className="rounded-full bg-[#8F1F1F]/8 px-3 py-1 text-xs font-bold text-[#8F1F1F]">已投</span>
                          ) : null}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── RATE TAB ── */}
            {interactiveTab === 'rate' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{activeTeam.teamName} · 球员打分</h2>
                  <p className="mt-2 text-sm text-[oklch(0.50_0.02_260)]">点击星星为球员评分，可随时修改</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {dash.players.map((player) => {
                    const meta = buildPlayerRatingMeta(player, playerRatings[player.id]);
                    return (
                      <Card key={player.id}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-[oklch(0.55_0.02_260)]">#{player.jerseyNumber} · {player.position}</p>
                            <h4 className="mt-1 text-lg font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>{player.name}</h4>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#8F1F1F]" style={{ fontFamily: "'DM Mono', monospace" }}>{meta.average.toFixed(1)}</div>
                            <div className="text-[10px] text-[oklch(0.55_0.02_260)]">{meta.count} 票</div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[oklch(0.45_0.02_260)]">{player.contribution}</p>
                        {/* Stars */}
                        <div className="mt-4 flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleRate(player, s)}
                              className="transition hover:scale-110"
                            >
                              <Star
                                className="h-6 w-6"
                                fill={s <= (meta.userScore ?? 0) ? '#FACC15' : 'none'}
                                stroke={s <= (meta.userScore ?? 0) ? '#FACC15' : '#d4c8bc'}
                                strokeWidth={1.5}
                              />
                            </button>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CHEER TAB ── */}
            {interactiveTab === 'cheer' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>为 {activeTeam.teamName} 打气</h2>
                  <p className="mt-2 text-sm text-[oklch(0.50_0.02_260)]">点击口号为球队加油，不限次数</p>
                </div>

                {/* Cheer count */}
                <div className="flex items-center gap-4 rounded-2xl border border-[#e5ddd5] bg-white px-6 py-5">
                  <Heart className="h-8 w-8 text-[#8F1F1F]" fill="#8F1F1F" />
                  <div>
                    <div className="text-3xl font-black text-[#8F1F1F]" style={{ fontFamily: "'DM Mono', monospace" }}>{teamCheers}</div>
                    <div className="text-xs text-[oklch(0.55_0.02_260)]">累计打气次数</div>
                  </div>
                </div>

                {/* Templates */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {culture.cheerTemplates.map((tpl) => {
                    const key = `${activeTeam.id}:${tpl}`;
                    const count = cheerCounts[key] ?? 0;
                    return (
                      <button
                        key={tpl}
                        onClick={() => handleCheer(tpl)}
                        className="group flex items-center justify-between rounded-2xl border border-[#e5ddd5] bg-white px-5 py-4 text-left transition hover:border-[#8F1F1F]/20 hover:shadow-sm active:scale-[0.98]"
                      >
                        <div>
                          <div className="text-sm font-bold text-[oklch(0.30_0.02_260)]">{tpl}</div>
                          {count > 0 && <div className="mt-1 text-xs text-[oklch(0.55_0.02_260)]">已打气 {count} 次</div>}
                        </div>
                        <Zap className="h-5 w-5 text-[oklch(0.75_0.02_260)] transition group-hover:text-[#8F1F1F]" />
                      </button>
                    );
                  })}
                </div>

                {/* Banner samples */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">主场横幅</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {culture.bannerSamples.map((b) => (
                      <span key={b} className="rounded-full border border-[#e5ddd5] bg-white px-3 py-1.5 text-sm text-[oklch(0.40_0.02_260)]">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── COMMENT TAB ── */}
            {interactiveTab === 'comment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>球迷留言板</h2>
                  <p className="mt-2 text-sm text-[oklch(0.50_0.02_260)]">共 {messages.length} 条留言</p>
                </div>

                {/* Input */}
                <Card>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="你的昵称"
                        className="w-32 rounded-xl border border-[#e5ddd5] bg-[#faf8f5] px-3 py-2 text-sm outline-none transition focus:border-[#8F1F1F]/30"
                      />
                      <select
                        value={messageTeamId}
                        onChange={(e) => setMessageTeamId(e.target.value)}
                        className="rounded-xl border border-[#e5ddd5] bg-[#faf8f5] px-3 py-2 text-sm outline-none"
                      >
                        {featureTeams.map((t) => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder={`写下你对 ${featureTeams.find((t) => t.id === messageTeamId)?.teamName ?? ''} 的评价或打气…`}
                        rows={2}
                        className="flex-1 resize-none rounded-xl border border-[#e5ddd5] bg-[#faf8f5] px-3 py-2 text-sm outline-none transition focus:border-[#8F1F1F]/30"
                      />
                      <button
                        onClick={handleSubmitMessage}
                        className="self-end rounded-xl bg-[#8F1F1F] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#7a1a1a] active:scale-[0.97]"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Messages */}
                <div className="space-y-3">
                  {messages.slice(0, 12).map((msg) => (
                    <div key={msg.id} className="flex gap-4 rounded-2xl border border-[#e5ddd5] bg-white px-5 py-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: featureTeams.find((t) => t.id === msg.teamId)?.color ?? R }}>
                        {msg.nickname.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{msg.nickname}</span>
                          <span className="rounded-full bg-[#faf8f5] px-2 py-0.5 text-[10px] font-semibold" style={{ color: featureTeams.find((t) => t.id === msg.teamId)?.color ?? R }}>{msg.teamName}</span>
                          <span className="text-[10px] text-[oklch(0.60_0.02_260)]">{msg.createdAt}</span>
                        </div>
                        <p className="mt-1 text-sm leading-7 text-[oklch(0.40_0.02_260)]">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live reports - compact strip at bottom */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_260)]">近期赛况</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {liveReports.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-[#e5ddd5] bg-white px-5 py-4">
                    <div className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      r.type === 'live' ? 'bg-[#8F1F1F]/10 text-[#8F1F1F]' : r.type === 'upcoming' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.type === 'live' ? 'LIVE' : r.type === 'upcoming' ? '预告' : '已结束'}
                    </div>
                    <div className="flex-1 text-sm">
                      <span className="font-bold">{r.homeTeam}</span>
                      <span className="mx-2 font-black text-[#8F1F1F]" style={{ fontFamily: "'DM Mono', monospace" }}>{r.homeScore ?? '-'} : {r.awayScore ?? '-'}</span>
                      <span className="font-bold">{r.awayTeam}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* ═══ CULTURE VIEW ═══ */}
        {activeView === 'culture' && (
          <motion.div key="culture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Culture hero */}
            <section className="relative overflow-hidden rounded-3xl border border-[#e5ddd5] bg-white">
              {cultureThemeMap[activeTeam.id] && (
                <div className="absolute inset-0 bg-cover bg-center opacity-[0.08]" style={{ backgroundImage: `url(${cultureThemeMap[activeTeam.id]!.image})` }} />
              )}
              <div className="absolute inset-y-0 right-0 w-1/3 opacity-[0.06]" style={{ background: `linear-gradient(135deg, ${activeTeam.color}, transparent)` }} />
              <div className="relative px-8 py-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.55_0.02_260)]">主场文化</p>
                <h1 className="mt-3 text-4xl font-black" style={{ fontFamily: "'Noto Serif SC', serif", color: R }}>{culture.title}</h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[oklch(0.45_0.02_260)]">{culture.culturalAnchor}</p>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: rituals & story */}
              <div className="space-y-6">
                <Card>
                  <CardLabel>文化故事</CardLabel>
                  <p className="mt-3 text-sm leading-8 text-[oklch(0.42_0.02_260)]">{culture.culturalStory}</p>
                </Card>
                <Card>
                  <CardLabel>主场仪式</CardLabel>
                  <div className="mt-3 space-y-3">
                    {culture.rituals.map((r, i) => (
                      <div key={r} className="flex items-start gap-3">
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8F1F1F]/8 text-xs font-bold text-[#8F1F1F]">{i + 1}</div>
                        <p className="text-sm leading-7 text-[oklch(0.42_0.02_260)]">{r}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right: orgs & banners */}
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardLabel>啦啦队</CardLabel>
                    <p className="mt-2 text-sm font-bold" style={{ color: R }}>{culture.cheerSquad}</p>
                  </Card>
                  <Card>
                    <CardLabel>粉丝队</CardLabel>
                    <p className="mt-2 text-sm font-bold" style={{ color: R }}>{culture.supporterGroup}</p>
                  </Card>
                </div>
                <Card>
                  <CardLabel>横幅墙</CardLabel>
                  <div className="mt-3 space-y-2">
                    {culture.bannerSamples.map((b) => (
                      <div key={b} className="rounded-xl bg-[#faf8f5] px-4 py-3 text-sm font-medium text-[oklch(0.35_0.02_260)]">{b}</div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardLabel>应援口号</CardLabel>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {culture.cheerTemplates.map((t) => (
                      <span key={t} className="rounded-full border border-[#e5ddd5] px-3 py-1.5 text-sm text-[oklch(0.40_0.02_260)]">{t}</span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#e5ddd5] bg-white p-5">{children}</div>;
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{children}</p>;
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5ddd5] bg-[#faf8f5] px-3 py-1.5 text-sm">
      <span className="text-[oklch(0.55_0.02_260)]">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#faf8f5] p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{label}</div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}
