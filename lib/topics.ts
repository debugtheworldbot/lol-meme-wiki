import type { MemeEntry } from "@/lib/types";

export interface TopicDefinition {
  slug: string;
  tag: string;
  title: string;
  description: string;
  introduction: string;
}

export const topicDefinitions: TopicDefinition[] = [
  {
    slug: "xuanshou-geng",
    tag: "选手梗",
    title: "LOL 选手梗大全：外号、语录和名场面出处",
    description: "按选手整理英雄联盟职业赛场流传的外号、语录与名场面，查看每个 LPL、LCK 选手梗的含义和出处。",
    introduction: "职业选手的操作、采访、直播和赛后讨论，是英雄联盟社区造梗最密集的来源。这里集中整理与选手直接相关的外号、语录和名场面，并保留原始语境与传播过程。",
  },
  {
    slug: "saishi-geng",
    tag: "赛事梗",
    title: "LOL 赛事梗大全：LPL 与世界赛名场面出处",
    description: "整理 LPL、MSI、全球总决赛等英雄联盟赛事梗，回看经典比赛、赛后名场面和社区用法。",
    introduction: "一场关键比赛往往会留下比分、解说原话、赛后采访和弹幕复读。这里按词条归档英雄联盟赛事中的代表性梗，并连接对应选手、战队与赛事背景。",
  },
  {
    slug: "youxi-geng",
    tag: "游戏梗",
    title: "LOL 游戏梗大全：英雄台词、技能与排位黑话",
    description: "收录英雄联盟游戏内流传的英雄台词、技能梗、排位黑话和玩家常用表达，解释含义与使用场景。",
    introduction: "游戏机制、英雄语音、技能名称和排位经历，构成了 LOL 玩家之间的共同语言。这里整理不依赖具体赛事也能被玩家理解和复用的游戏梗。",
  },
  {
    slug: "yingxiong-taici",
    tag: "英雄台词",
    title: "LOL 英雄台词梗大全：经典语音和二创出处",
    description: "整理英雄联盟经典英雄台词、中文语音空耳和社区二创，解释原句、角色及流行用法。",
    introduction: "英雄语音既是角色设定的一部分，也常被玩家截取、空耳或移植到比赛场景中。这里收录已经进入社区日常表达的经典台词及其二创版本。",
  },
  {
    slug: "chuquan-geng",
    tag: "出圈梗",
    title: "LOL 出圈梗大全：从电竞社区传到全网的热梗",
    description: "盘点从英雄联盟和 LPL 社区传播到全网的出圈梗，解释原始出处、含义和后续演变。",
    introduction: "有些 LOL 梗会越过游戏和赛事圈层，进入直播、短视频乃至日常聊天。这里区分它们的原始电竞语境与出圈后的泛化用法。",
  },
  {
    slug: "lpl-2026",
    tag: "2026",
    title: "2026 LPL 新梗盘点：比赛热梗和出处时间线",
    description: "持续整理 2026 年 LPL、MSI 与英雄联盟赛事新梗，按出现时间记录比赛背景、原话和传播过程。",
    introduction: "本页追踪 2026 年英雄联盟赛事与社区的新梗。词条按首次出现时间排序，方便从一场比赛、一次采访或一段队内语音追溯当年的热门表达。",
  },
  {
    slug: "xuanshou-yulu",
    tag: "选手语录",
    title: "LOL 选手经典语录：采访、直播与赛后原话",
    description: "收录英雄联盟职业选手经典语录，整理采访、直播、队内语音中的原句、背景和衍生用法。",
    introduction: "选手语录可能来自正式采访、直播切片或队内语音。这里尽量保留说话人、发生时间和上下文，避免只记录脱离语境的二手复读。",
  },
  {
    slug: "xieyin-geng",
    tag: "谐音梗",
    title: "LOL 谐音梗大全：选手 ID、英雄名与空耳解释",
    description: "整理英雄联盟社区的选手 ID 谐音、英雄名改写和语音空耳，解释文字玩法与最初出处。",
    introduction: "选手 ID、战队名和英雄语音经常被改写成中文谐音，再随比赛表现产生新的含义。这里集中解释这些文字玩法，兼顾常见写法和繁简体变体。",
  },
  {
    slug: "zhandui-geng",
    tag: "战队梗",
    title: "LOL 战队梗大全：LPL、LCK 队伍外号和名场面",
    description: "按词条整理英雄联盟战队外号、队史名场面和赛区梗，查看 LPL、LCK 队伍梗的来源。",
    introduction: "战队梗通常由队史成绩、主场文化、粉丝称呼和关键比赛共同形成。这里记录这些称呼如何出现，以及它们在不同赛季中的含义变化。",
  },
  {
    slug: "shuzi-geng",
    tag: "数字梗",
    title: "LOL 数字梗大全：4396、2200 等比分数据出处",
    description: "解释英雄联盟社区常见数字梗，追溯伤害、比分、日期和选手 ID 背后的比赛与传播来源。",
    introduction: "一局伤害、一个比分或一段日期，都可能被社区压缩成只有玩家看得懂的数字暗号。这里把数字重新放回原始比赛和传播语境中。",
  },
];

export function getTopic(slug: string) {
  return topicDefinitions.find((topic) => topic.slug === slug);
}

export function getTopicForTag(tag: string) {
  return topicDefinitions.find((topic) => topic.tag === tag);
}

export function getMemesForTopic(memes: MemeEntry[], topic: TopicDefinition) {
  const matching = memes.filter((meme) => meme.tags.includes(topic.tag));
  if (topic.tag === "2026") {
    return matching.sort((a, b) => (b.first_seen ?? "").localeCompare(a.first_seen ?? ""));
  }
  return matching.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
}
