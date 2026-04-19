export type FeatureTeam = {
  id: string;
  city: string;
  teamName: string;
  fullName: string;
  color: string;
  stadium: string;
  slogan: string;
  badgeDesc: string;
  seasonHighlights: string[];
  lastSeasonRecord: string;
  story: string;
  voteBase: number;
  lat: number;
  lng: number;
};

export type LiveReport = {
  id: string;
  type: 'live' | 'upcoming' | 'finished';
  title: string;
  matchTime: string;
  stadium: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  summary: string;
};

export type FanMessage = {
  id: string;
  teamId: string;
  teamName: string;
  nickname: string;
  content: string;
  createdAt: string;
};

export type PoiLayer = 'team' | 'stadium' | 'food' | 'hotel' | 'parking' | 'cuisine';

export type H5Poi = {
  id: string;
  layer: PoiLayer;
  city: string;
  title: string;
  subtitle: string;
  detail: string;
  lat: number;
  lng: number;
  color?: string;
};

export const featureTeams: FeatureTeam[] = [
  {
    id: 'changsha',
    city: '长沙',
    teamName: '长沙队',
    fullName: '湘超长沙队',
    color: '#FF4444',
    stadium: '长沙贺龙体育场',
    slogan: '星城出征，所向披靡！',
    badgeDesc: '五星形态融合足球五边形，结合杜鹃花、岳麓山与湘江流线，体现星城的城市气质。',
    seasonHighlights: ['常规赛保持不败', '防守端仅失 4 球', '揭幕战点燃全场氛围'],
    lastSeasonRecord: '上赛季常规赛第 1，最终获得季军。',
    story: '长沙队以速度和整体推进见长，是最具主场号召力的湘超球队之一。',
    voteBase: 980,
    lat: 28.23,
    lng: 112.97,
  },
  {
    id: 'zhuzhou',
    city: '株洲',
    teamName: '株洲队',
    fullName: '湘超株洲队',
    color: '#FF6B35',
    stadium: '株洲体育中心体育场',
    slogan: '动力之都，全速冲锋！',
    badgeDesc: '盾牌造型叠加齿轮皇冠与火车头轮廓，突出工业城市与交通枢纽特征。',
    seasonHighlights: ['联赛进球火力最猛', '多场比赛高位压迫', '客场胜率表现亮眼'],
    lastSeasonRecord: '上赛季常规赛第 2，最终位列第 4。',
    story: '株洲队节奏鲜明，转换速度快，极具视觉冲击力。',
    voteBase: 905,
    lat: 27.83,
    lng: 113.13,
  },
  {
    id: 'xiangtan',
    city: '湘潭',
    teamName: '湘潭队',
    fullName: '湘超湘潭队',
    color: '#B74BFF',
    stadium: '湘潭市体育中心',
    slogan: '红色热土，敢打敢拼！',
    badgeDesc: '以湘江水纹和城市桥梁结构为原型，搭配锐利线条，突出拼搏与连接感。',
    seasonHighlights: ['中场组织稳定', '青年球员成长迅速', '主场球迷互动活跃'],
    lastSeasonRecord: '上赛季位列中游，杯赛阶段表现稳健。',
    story: '湘潭队注重控制与中场硬度，是典型的均衡型球队。',
    voteBase: 688,
    lat: 27.83,
    lng: 112.94,
  },
  {
    id: 'hengyang',
    city: '衡阳',
    teamName: '衡阳队',
    fullName: '湘超衡阳队',
    color: '#2196F3',
    stadium: '衡阳体育中心体育场',
    slogan: '雁城雄飞，势不可挡！',
    badgeDesc: '队徽以领头雁和数字线框结合，兼顾传统城市意象与现代感。',
    seasonHighlights: ['边路推进效率高', '主场升级后观赛体验提升', '高比分胜场令人印象深刻'],
    lastSeasonRecord: '上赛季排名第 6。',
    story: '衡阳队的边中结合能力强，比赛观感充满冲击力。',
    voteBase: 756,
    lat: 26.89,
    lng: 112.57,
  },
  {
    id: 'shaoyang',
    city: '邵阳',
    teamName: '邵阳队',
    fullName: '湘超邵阳队',
    color: '#795548',
    stadium: '邵阳市体育中心体育场',
    slogan: '宝庆竹韵，坚韧如竹！',
    badgeDesc: '借鉴宝庆竹刻的刀锋与篆刻感，让队徽兼具非遗文化与运动力量。',
    seasonHighlights: ['平局场次较多', '顽强防守体现韧性', '文化主题传播度高'],
    lastSeasonRecord: '上赛季排名第 10。',
    story: '邵阳队虽然成绩不算突出，但球队气质极为鲜明。',
    voteBase: 602,
    lat: 27.24,
    lng: 111.47,
  },
  {
    id: 'yueyang',
    city: '岳阳',
    teamName: '岳阳队',
    fullName: '湘超岳阳队',
    color: '#4CAF50',
    stadium: '岳阳市体育中心体育场',
    slogan: '洞庭之滨，先忧后乐！',
    badgeDesc: '稻穗、洞庭湖水纹与岳阳楼轮廓融合在盾形结构中，识别度鲜明。',
    seasonHighlights: ['防守端稳定', '主客场节奏反差明显', '淘汰赛门票竞争激烈'],
    lastSeasonRecord: '上赛季排名第 8。',
    story: '岳阳队强调纪律性和防守层次，擅长打强弱转换战。',
    voteBase: 721,
    lat: 29.37,
    lng: 113.13,
  },
  {
    id: 'changde',
    city: '常德',
    teamName: '常德队',
    fullName: '湘超常德队',
    color: '#C8A84E',
    stadium: '常德体育中心体育场',
    slogan: '常德伢子，霸蛮上场！',
    badgeDesc: '足球元素与盾牌轮廓叠加，体现强对抗与稳定防线。',
    seasonHighlights: ['淘汰赛表现极强', '防线压迫感十足', '多场焦点战制造热度'],
    lastSeasonRecord: '上赛季获得亚军。',
    story: '常德队在关键战中表现成熟，是冠军争夺的常客。',
    voteBase: 863,
    lat: 29.05,
    lng: 111.69,
  },
  {
    id: 'zhangjiajie',
    city: '张家界',
    teamName: '张家界队',
    fullName: '湘超张家界队',
    color: '#00A9A5',
    stadium: '张家界市人民体育场',
    slogan: '奇峰云海，向上出发！',
    badgeDesc: '以峰林轮廓与飞旋足球轨迹构成主图，突出城市地貌辨识度。',
    seasonHighlights: ['文旅联动话题度高', '快攻反击效率突出', '年轻阵容活力强'],
    lastSeasonRecord: '上赛季未能进入前八，但市场热度持续上升。',
    story: '张家界队具备鲜明的旅游城市标签，非常适合做文旅联动传播。',
    voteBase: 645,
    lat: 29.12,
    lng: 110.48,
  },
  {
    id: 'yiyang',
    city: '益阳',
    teamName: '益阳队',
    fullName: '湘超益阳队',
    color: '#8BC34A',
    stadium: '益阳奥林匹克公园体育场',
    slogan: '银城铁骨，永不言弃！',
    badgeDesc: 'Y 字母、足球和山水轮廓相结合，整体年轻轻快。',
    seasonHighlights: ['主场氛围热烈', '青年梯队关注度提升', '多场比赛悬念延续到最后'],
    lastSeasonRecord: '上赛季排名第 9。',
    story: '益阳队是典型的潜力型球队，拥有较强的本土凝聚力。',
    voteBase: 612,
    lat: 28.55,
    lng: 112.36,
  },
  {
    id: 'chenzhou',
    city: '郴州',
    teamName: '郴州队',
    fullName: '湘超郴州队',
    color: '#00BCD4',
    stadium: '郴州市体育中心体育场',
    slogan: '林中之城，并肩作战！',
    badgeDesc: '以“郴”字图形和并肩作战的人形构图为基础，辨识度强。',
    seasonHighlights: ['平局场次较多', '韧性顽强', '末轮抢分能力突出'],
    lastSeasonRecord: '上赛季排名第 7。',
    story: '郴州队很擅长把比赛拖入拼意志和细节的阶段。',
    voteBase: 694,
    lat: 25.77,
    lng: 113.01,
  },
  {
    id: 'yongzhou',
    city: '永州',
    teamName: '永州队',
    fullName: '湘超永州队',
    color: '#E63B2E',
    stadium: '永州市体育场',
    slogan: '永冲锋！不喊口号不吹牛',
    badgeDesc: '主体“走”字像一名冲刺中的球员，整体视觉直接有力。',
    seasonHighlights: ['黑马逆袭夺冠', '决赛一球制胜', '冠军故事最具传播张力'],
    lastSeasonRecord: '上赛季冠军。',
    story: '永州队的冠军气质最鲜明，是当前最具冠军辨识度的球队。',
    voteBase: 1028,
    lat: 26.42,
    lng: 111.61,
  },
  {
    id: 'huaihua',
    city: '怀化',
    teamName: '怀化队',
    fullName: '湘超怀化队',
    color: '#5C6BC0',
    stadium: '怀化市体育中心',
    slogan: '山水怀化，硬朗出击！',
    badgeDesc: '以山体折线和跑动轨迹形成速度感，整体视觉沉稳。',
    seasonHighlights: ['中后场身体对抗强', '雨战表现突出', '区域协同组织清晰'],
    lastSeasonRecord: '上赛季处于中下游，但主场表现稳定。',
    story: '怀化队具备强烈的地域性格，比赛风格硬朗直接。',
    voteBase: 633,
    lat: 27.55,
    lng: 109.97,
  },
  {
    id: 'loudi',
    city: '娄底',
    teamName: '娄底队',
    fullName: '湘超娄底队',
    color: '#9C27B0',
    stadium: '娄底市体育中心体育场',
    slogan: '钢铁筑魂，牛气冲天！',
    badgeDesc: '火焰斗牛形象与工业质感配色结合，体现强悍与爆发力。',
    seasonHighlights: ['防守稳固', '反击效率高', '队徽传播度较高'],
    lastSeasonRecord: '上赛季排名第 5。',
    story: '娄底队是典型的强硬派球队，打硬仗时极具韧性。',
    voteBase: 777,
    lat: 27.73,
    lng: 112.0,
  },
  {
    id: 'xiangxi',
    city: '湘西',
    teamName: '湘西队',
    fullName: '湘超湘西队',
    color: '#26A69A',
    stadium: '湘西民族体育中心',
    slogan: '山门同心，热血集结！',
    badgeDesc: '融合苗绣纹样与山形结构，让队徽更具民族文化辨识度。',
    seasonHighlights: ['民族文化联动出圈', '主场仪式感强', '球迷氛围极具地方特色'],
    lastSeasonRecord: '上赛季成绩一般，但主场文化表达最有记忆点。',
    story: '湘西队非常适合以文化叙事增强球队辨识度和观赛体验。',
    voteBase: 671,
    lat: 28.31,
    lng: 109.74,
  },
];

export const liveReports: LiveReport[] = [
  {
    id: 'r1',
    type: 'live',
    title: '焦点战进行中',
    matchTime: '今天 19:35',
    stadium: '长沙贺龙体育场',
    homeTeam: '长沙队',
    awayTeam: '株洲队',
    homeScore: 2,
    awayScore: 1,
    minute: '76′',
    summary: '长沙队通过边路持续施压，比赛节奏快速，现场氛围持续升温。',
  },
  {
    id: 'r2',
    type: 'upcoming',
    title: '今晚即将开赛',
    matchTime: '今天 20:00',
    stadium: '常德体育中心体育场',
    homeTeam: '常德队',
    awayTeam: '永州队',
    summary: '一场兼具冠军气质与防守强度的硬仗，赛前关注度持续攀升。',
  },
  {
    id: 'r3',
    type: 'finished',
    title: '比赛已结束',
    matchTime: '昨天 19:30',
    stadium: '岳阳市体育中心体育场',
    homeTeam: '岳阳队',
    awayTeam: '衡阳队',
    homeScore: 0,
    awayScore: 0,
    summary: '双方攻防节奏谨慎，最终以平局收场，岳阳队守住主场。',
  },
  {
    id: 'r4',
    type: 'finished',
    title: '赛果速递',
    matchTime: '前天 19:35',
    stadium: '娄底市体育中心体育场',
    homeTeam: '娄底队',
    awayTeam: '郴州队',
    homeScore: 1,
    awayScore: 3,
    summary: '郴州队在下半场连入两球完成反超，比赛转折点十分清晰。',
  },
];

export const initialFanMessages: FanMessage[] = [
  {
    id: 'm1',
    teamId: 'yongzhou',
    teamName: '永州队',
    nickname: '湘超老球迷',
    content: '希望冠军气势延续到新赛季，继续把永州主场打成最燃看台。',
    createdAt: '今天 09:10',
  },
  {
    id: 'm2',
    teamId: 'changsha',
    teamName: '长沙队',
    nickname: '星城支持者',
    content: '长沙队今年的阵容厚度不错，期待把控球优势转成更多进球。',
    createdAt: '今天 10:26',
  },
  {
    id: 'm3',
    teamId: 'xiangxi',
    teamName: '湘西队',
    nickname: '边城看台',
    content: '希望球队把地域文化表达做得更足，球迷会更有归属感。',
    createdAt: '今天 11:40',
  },
];

export const h5LayerOptions: Array<{ id: PoiLayer; label: string }> = [
  { id: 'team', label: '球队' },
  { id: 'stadium', label: '场馆' },
  { id: 'food', label: '餐饮' },
  { id: 'hotel', label: '住宿' },
  { id: 'parking', label: '停车' },
  { id: 'cuisine', label: '湘菜' },
];

export const h5Pois: H5Poi[] = [
  {
    id: 'team-changsha',
    layer: 'team',
    city: '长沙',
    title: '湘超长沙队',
    subtitle: '星城主场热度担当',
    detail: '球队以速度与压迫感见长，主场话题度和球迷黏性都很高。',
    lat: 28.23,
    lng: 112.97,
    color: '#FF4444',
  },
  {
    id: 'stadium-changsha',
    layer: 'stadium',
    city: '长沙',
    title: '长沙贺龙体育场',
    subtitle: '核心场馆',
    detail: '适合承接焦点战和城市级活动，交通与周边服务较完整。',
    lat: 28.224,
    lng: 112.973,
    color: '#C62828',
  },
  {
    id: 'food-changsha',
    layer: 'food',
    city: '长沙',
    title: '球迷餐吧街区',
    subtitle: '赛前聚餐推荐',
    detail: '适合球迷赛前集合，偏年轻化、社交属性强。',
    lat: 28.229,
    lng: 112.985,
    color: '#FF8A65',
  },
  {
    id: 'hotel-changsha',
    layer: 'hotel',
    city: '长沙',
    title: '贺龙周边酒店圈',
    subtitle: '住宿集散',
    detail: '以赛事观赛人群为主，步行到场馆较方便。',
    lat: 28.217,
    lng: 112.979,
    color: '#5C6BC0',
  },
  {
    id: 'parking-changsha',
    layer: 'parking',
    city: '长沙',
    title: '场馆 P1 停车区',
    subtitle: '停车建议',
    detail: '适合短时停靠，建议比赛日提前入场。',
    lat: 28.222,
    lng: 112.968,
    color: '#607D8B',
  },
  {
    id: 'cuisine-changsha',
    layer: 'cuisine',
    city: '长沙',
    title: '辣椒炒肉推荐点',
    subtitle: '特色湘菜',
    detail: '更适合作为赛后本地特色体验，适合游客打卡。',
    lat: 28.235,
    lng: 112.99,
    color: '#FFC107',
  },
  {
    id: 'team-changde',
    layer: 'team',
    city: '常德',
    title: '湘超常德队',
    subtitle: '防守强队',
    detail: '关键战经验丰富，战术执行稳定。',
    lat: 29.05,
    lng: 111.69,
    color: '#C8A84E',
  },
  {
    id: 'stadium-changde',
    layer: 'stadium',
    city: '常德',
    title: '常德体育中心体育场',
    subtitle: '主场地标',
    detail: '是常德球迷观赛与赛事活动的集中空间。',
    lat: 29.055,
    lng: 111.697,
    color: '#B68A2F',
  },
  {
    id: 'food-changde',
    layer: 'food',
    city: '常德',
    title: '河街观赛餐区',
    subtitle: '赛前赛后都适合',
    detail: '兼具旅游与夜间消费属性，适合球迷聚会。',
    lat: 29.041,
    lng: 111.68,
    color: '#FF8A65',
  },
  {
    id: 'team-yongzhou',
    layer: 'team',
    city: '永州',
    title: '湘超永州队',
    subtitle: '卫冕关注焦点',
    detail: '作为冠军球队，传播势能和球迷关注度都很高。',
    lat: 26.42,
    lng: 111.61,
    color: '#E63B2E',
  },
  {
    id: 'stadium-yongzhou',
    layer: 'stadium',
    city: '永州',
    title: '永州市体育场',
    subtitle: '冠军主场',
    detail: '适合打造冠军叙事与城市荣誉主题传播。',
    lat: 26.425,
    lng: 111.618,
    color: '#D84315',
  },
  {
    id: 'cuisine-yongzhou',
    layer: 'cuisine',
    city: '永州',
    title: '血鸭主题店',
    subtitle: '地方湘菜推荐',
    detail: '适合做球队主题餐饮联动，话题性强。',
    lat: 26.431,
    lng: 111.626,
    color: '#FFC107',
  },
  {
    id: 'hotel-zhangjiajie',
    layer: 'hotel',
    city: '张家界',
    title: '景区联动酒店',
    subtitle: '文旅住宿',
    detail: '适合将观赛和旅游打包成一体化路线。',
    lat: 29.11,
    lng: 110.49,
    color: '#5C6BC0',
  },
  {
    id: 'parking-yueyang',
    layer: 'parking',
    city: '岳阳',
    title: '岳阳体育中心停车区',
    subtitle: '停车引导',
    detail: '建议与赛事时间联动提示高峰拥堵时段。',
    lat: 29.365,
    lng: 113.124,
    color: '#607D8B',
  },
  {
    id: 'food-xiangxi',
    layer: 'food',
    city: '湘西',
    title: '民族风味夜市',
    subtitle: '球迷补给点',
    detail: '可结合主场活动形成夜间消费与打卡路线。',
    lat: 28.315,
    lng: 109.748,
    color: '#FF8A65',
  },
];

export const moduleStats = [
  { label: '覆盖球队', value: '14' },
  { label: '功能模块', value: '3' },
  { label: 'H5 页面', value: '6' },
  { label: '服务图层', value: '6' },
];

export const projectLogo = '/assets/xiangchao-logo.png';
