import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MessageSquare,
  Radio,
  Send,
  Shield,
  Sparkles,
  Trophy,
  Vote,
} from 'lucide-react';
import LogoBadge from '@/components/LogoBadge';
import { routePath } from '@/lib/sitePaths';
import {
  featureTeams,
  initialFanMessages,
  liveReports,
  moduleStats,
  type FanMessage,
  type FeatureTeam,
  type LiveReport,
} from '@/data/feature-data';

const VOTE_STORAGE_KEY = 'xiangchao_vote_extras_v1';
const VOTED_TEAM_STORAGE_KEY = 'xiangchao_voted_team_v1';
const MESSAGE_STORAGE_KEY = 'xiangchao_messages_v1';

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function FeatureModules() {
  const [activeTeam, setActiveTeam] = useState<FeatureTeam>(featureTeams[0]);
  const [voteExtras, setVoteExtras] = useState<Record<string, number>>({});
  const [votedTeamId, setVotedTeamId] = useState<string | null>(null);
  const [messages, setMessages] = useState<FanMessage[]>(initialFanMessages);
  const [nickname, setNickname] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageTeamId, setMessageTeamId] = useState(featureTeams[0].id);

  useEffect(() => {
    setVoteExtras(loadJson<Record<string, number>>(VOTE_STORAGE_KEY, {}));
    setVotedTeamId(loadJson<string | null>(VOTED_TEAM_STORAGE_KEY, null));
    setMessages(loadJson<FanMessage[]>(MESSAGE_STORAGE_KEY, initialFanMessages));
  }, []);

  const rankedTeams = useMemo(() => {
    return featureTeams
      .map((team) => ({
        ...team,
        totalVotes: team.voteBase + (voteExtras[team.id] ?? 0),
      }))
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }, [voteExtras]);

  const handleVote = (teamId: string) => {
    if (votedTeamId) return;
    const nextExtras = {
      ...voteExtras,
      [teamId]: (voteExtras[teamId] ?? 0) + 1,
    };
    setVoteExtras(nextExtras);
    setVotedTeamId(teamId);
    window.localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(nextExtras));
    window.localStorage.setItem(VOTED_TEAM_STORAGE_KEY, JSON.stringify(teamId));
  };

  const handleSubmitMessage = () => {
    const trimmedNickname = nickname.trim();
    const trimmedContent = messageContent.trim();
    if (!trimmedNickname || !trimmedContent) return;

    const team = featureTeams.find((item) => item.id === messageTeamId) ?? featureTeams[0];
    const nextMessages = [
      {
        id: `${Date.now()}`,
        teamId: team.id,
        teamName: team.teamName,
        nickname: trimmedNickname,
        content: trimmedContent,
        createdAt: '刚刚',
      },
      ...messages,
    ].slice(0, 12);

    setMessages(nextMessages);
    window.localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(nextMessages));
    setNickname('');
    setMessageContent('');
  };

  return (
    <div className="min-h-screen bg-[oklch(0.96_0.005_220)] text-[oklch(0.18_0.02_260)]">
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #C62828 0%, #D32F2F 30%, #E53935 60%, #B71C1C 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={routePath('/')}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/15">
                  <ArrowLeft className="h-4 w-4" />
                </div>
              </Link>
              <LogoBadge light subtitle="湘超功能模块扩展页" />
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Link href={routePath('/map')}>
                <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md transition hover:bg-white/15">
                  返回地图
                </div>
              </Link>
              <Link href={routePath('/h5')}>
                <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md transition hover:bg-white/15">
                  查看 H5
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/80 backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm tracking-[0.2em]">FEATURE MODULES</span>
              </div>
              <h1
                className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                湘超功能模块
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
                在不改动现有地图主体设计和整体氛围的前提下，新增球队风采、人气投票、留言板与实时战报模块，并统一接入湘超 LOGO，方便后续延展为完整服务页或活动专题页。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {moduleStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md">
                  <div className="text-2xl font-black" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs tracking-[0.18em] text-white/65">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[oklch(0.55_0.02_260)]">Module 01</p>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  球队风采页
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">
              这一部分保留当前项目偏运动化、明亮且有红金点缀的版式语言，重点补足 14 支地市球队的卡片化展示能力，并增加队徽解读、赛季亮点与上赛季战绩三个字段，适合作为专题页或活动期扩展模块。
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {featureTeams.map((team) => {
                const isActive = team.id === activeTeam.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => setActiveTeam(team)}
                    className={`rounded-3xl border p-4 text-left transition-all ${
                      isActive
                        ? 'border-transparent shadow-lg shadow-black/5'
                        : 'border-[oklch(0.90_0.005_260)] bg-[oklch(0.985_0.002_260)] hover:-translate-y-0.5 hover:border-[#D32F2F]/20'
                    }`}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${team.color}15 0%, rgba(255,255,255,0.98) 55%)`,
                            boxShadow: `0 16px 32px ${team.color}18`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-lg font-black" style={{ color: team.color, fontFamily: "'Noto Serif SC', serif" }}>
                          {team.teamName}
                        </div>
                        <div className="mt-1 text-xs tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{team.city}</div>
                      </div>
                      <div
                        className="h-12 w-12 rounded-2xl"
                        style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}BB)` }}
                      />
                    </div>
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-[oklch(0.42_0.02_260)]">{team.badgeDesc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[oklch(0.55_0.02_260)]">Team Focus</p>
                <h3 className="mt-1 text-3xl font-black" style={{ color: activeTeam.color, fontFamily: "'Noto Serif SC', serif" }}>
                  {activeTeam.fullName}
                </h3>
              </div>
              <LogoBadge compact subtitle={activeTeam.city} />
            </div>

            <div
              className="mt-5 rounded-[28px] p-5"
              style={{ background: `linear-gradient(135deg, ${activeTeam.color}14, rgba(255,255,255,0.9))` }}
            >
              <p className="text-lg font-semibold" style={{ color: activeTeam.color }}>
                「{activeTeam.slogan}」
              </p>
              <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{activeTeam.story}</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoCard title="主场场馆" content={activeTeam.stadium} accent={activeTeam.color} />
              <InfoCard title="上赛季战绩" content={activeTeam.lastSeasonRecord} accent={activeTeam.color} />
            </div>

            <div className="mt-5 rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-[oklch(0.55_0.02_260)]">队徽解读</div>
              <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{activeTeam.badgeDesc}</p>
            </div>

            <div className="mt-5 rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-[oklch(0.55_0.02_260)]">赛季亮点</div>
              <div className="mt-4 space-y-3">
                {activeTeam.seasonHighlights.map((item, index) => (
                  <div key={item} className="flex items-start gap-3">
                    <div
                      className="mt-1.5 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: activeTeam.color, opacity: 1 - index * 0.15 }}
                    />
                    <p className="text-sm leading-6 text-[oklch(0.42_0.02_260)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                <Vote className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[oklch(0.55_0.02_260)]">Module 02</p>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  人气球队投票
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[oklch(0.45_0.02_260)]">
              当前版本采用前端本地存储方式，适合先完成页面演示与交互走查。后续若你需要正式上线版本，我可以再继续接成接口与真实票数统计逻辑。
            </p>

            <div className="mt-6 space-y-3">
              {rankedTeams.slice(0, 8).map((team, index) => (
                <div key={team.id} className="flex items-center gap-4 rounded-2xl border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-[oklch(0.28_0.02_260)] shadow-sm">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: team.color }}>{team.teamName}</span>
                      {index < 3 ? <Trophy className="h-4 w-4 text-amber-500" /> : null}
                    </div>
                    <div className="mt-1 text-xs text-[oklch(0.55_0.02_260)]">{team.city} · {team.lastSeasonRecord}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black" style={{ fontFamily: "'DM Mono', monospace" }}>{team.totalVotes}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">Votes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="flex items-center gap-2 text-[oklch(0.55_0.02_260)]">
                  <Trophy className="h-4 w-4 text-[#D32F2F]" />
                  <span className="text-xs uppercase tracking-[0.25em]">我最喜爱球队</span>
                </div>
                <div className="mt-4 grid gap-2">
                  {featureTeams.map((team) => {
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
                            : 'border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] hover:border-[#D32F2F]/20'
                        } ${disabled && !isSelected ? 'opacity-60' : ''}`}
                        style={
                          isSelected
                            ? {
                                background: `linear-gradient(135deg, ${team.color}, ${team.color}CC)`,
                                boxShadow: `0 12px 28px ${team.color}26`,
                              }
                            : undefined
                        }
                      >
                        <div className="font-semibold">{team.teamName}</div>
                        <div className={`mt-1 text-xs ${isSelected ? 'text-white/75' : 'text-[oklch(0.55_0.02_260)]'}`}>
                          {isSelected ? '本机已投票' : '点击投出 1 票'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[oklch(0.55_0.02_260)]">
                  <MessageSquare className="h-4 w-4 text-[#D32F2F]" />
                  <span className="text-xs uppercase tracking-[0.25em]">我想对他说</span>
                </div>
                <div className="mt-4 rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
                  <div className="grid gap-3">
                    <input
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      placeholder="你的昵称"
                      className="h-11 rounded-2xl border border-[oklch(0.90_0.005_260)] bg-white px-4 text-sm outline-none transition focus:border-[#D32F2F]/40"
                    />
                    <select
                      value={messageTeamId}
                      onChange={(event) => setMessageTeamId(event.target.value)}
                      className="h-11 rounded-2xl border border-[oklch(0.90_0.005_260)] bg-white px-4 text-sm outline-none transition focus:border-[#D32F2F]/40"
                    >
                      {featureTeams.map((team) => (
                        <option key={team.id} value={team.id}>{team.teamName}</option>
                      ))}
                    </select>
                    <textarea
                      value={messageContent}
                      onChange={(event) => setMessageContent(event.target.value)}
                      placeholder="写下你想对球队说的话"
                      className="min-h-[118px] rounded-3xl border border-[oklch(0.90_0.005_260)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#D32F2F]/40"
                    />
                    <button
                      onClick={handleSubmitMessage}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D32F2F] to-[#E53935] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#D32F2F]/20 transition hover:translate-y-[-1px]"
                    >
                      <Send className="h-4 w-4" />
                      发送留言
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {messages.slice(0, 5).map((message) => (
                    <div key={message.id} className="rounded-3xl border border-[oklch(0.92_0.005_260)] bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-[oklch(0.26_0.02_260)]">{message.nickname}</div>
                        <div className="text-xs text-[oklch(0.55_0.02_260)]">{message.createdAt}</div>
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#D32F2F]">{message.teamName}</div>
                      <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[oklch(0.90_0.005_260)] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#D32F2F]/10 p-3 text-[#D32F2F]">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[oklch(0.55_0.02_260)]">Module 03</p>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  实时战报页
                </h2>
              </div>
            </div>
            <div className="rounded-full bg-[#D32F2F]/10 px-4 py-2 text-sm text-[#D32F2F]">
              采用卡片式信息排布，不破坏现有设计氛围
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {liveReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[28px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{report.title}</div>
                    <div className="mt-2 text-lg font-black text-[oklch(0.20_0.02_260)]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                      {report.homeTeam} VS {report.awayTeam}
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClassName(report.type)}`}>
                    {badgeLabel(report.type, report.minute)}
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="text-sm leading-7 text-[oklch(0.45_0.02_260)]">
                    <div>{report.matchTime}</div>
                    <div>{report.stadium}</div>
                  </div>
                  {typeof report.homeScore === 'number' && typeof report.awayScore === 'number' ? (
                    <div className="text-3xl font-black text-[oklch(0.18_0.02_260)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {report.homeScore}:{report.awayScore}
                    </div>
                  ) : (
                    <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#D32F2F]">待开赛</div>
                  )}
                </div>

                <p className="mt-4 text-sm leading-7 text-[oklch(0.42_0.02_260)]">{report.summary}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({ title, content, accent }: { title: string; content: string; accent: string }) {
  return (
    <div className="rounded-[24px] border border-[oklch(0.92_0.005_260)] bg-[oklch(0.985_0.002_260)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[oklch(0.55_0.02_260)]">{title}</div>
      <div className="mt-3 text-sm font-medium leading-7" style={{ color: accent }}>
        {content}
      </div>
    </div>
  );
}

function badgeClassName(type: LiveReport['type']) {
  if (type === 'live') return 'bg-[#D32F2F]/10 text-[#D32F2F]';
  if (type === 'upcoming') return 'bg-[#FFB300]/12 text-[#B26A00]';
  return 'bg-[oklch(0.92_0.005_260)] text-[oklch(0.45_0.02_260)]';
}

function badgeLabel(type: LiveReport['type'], minute?: string) {
  if (type === 'live') return minute ? `LIVE · ${minute}` : 'LIVE';
  if (type === 'upcoming') return 'PREVIEW';
  return 'FULL TIME';
}
