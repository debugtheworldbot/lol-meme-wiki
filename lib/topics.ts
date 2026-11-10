import type { MemeEntry } from "@/lib/types";

export interface TopicDefinition {
  slug: string;
  tag: string;
  title: string;
  description: string;
  seo_description?: string;
  introduction: string;
  player?: string;
}

export const topicDefinitions: TopicDefinition[] = [
  {
    slug: "bin-geng",
    tag: "Bin",
    player: "bin",
    title: "Bin 梗导读：世一上、电竞李鸿章与 48bin 的区别",
    description: "区分 Bin 的选手自称、赛后比喻与数字黑称，沿具体语境查看原帖、比赛记录和相关词条。",
    introduction: "同样在说 Bin，不同称呼可能是在引用选手原话、改写赛果，也可能在攻击家属。从三种表达的区别入手，再继续查阅同一选手的其他词条。",
  },
  {
    slug: "xuanshou-geng",
    tag: "选手梗",
    title: "LOL 选手梗大全：外号、语录和名场面出处",
    description: "按选手整理英雄联盟职业赛场流传的外号、语录与名场面，查看每个 LPL、LCK 选手梗的含义和出处。",
    introduction: "选手外号、采访金句、直播切片和赛场操作，都可能被做成梗。词条按选手归在一起，说明原本在说什么、后来怎么被复读。",
  },
  {
    slug: "saishi-geng",
    tag: "赛事梗",
    title: "LOL 赛事梗大全：LPL 与世界赛名场面出处",
    description: "整理 LPL、MSI、全球总决赛等英雄联盟赛事梗，回看经典比赛、赛后名场面和社区用法。",
    seo_description: "LPL、MSI 和全球总决赛的比分、解说原话、选手采访与赛后名场面，按词条整理出处和用法。可查数字梗、关键操作及相关选手、战队与赛事，也可对照同一句话在赢、输之后的不同语气。首次传播和计时有争议的地方，见词条来源与编辑注。",
    introduction: "从比分、解说原话到赛后采访，查找比赛里留下的梗。词条附有相关选手、战队和赛事链接，方便对照当时的情况。",
  },
  {
    slug: "youxi-geng",
    tag: "游戏梗",
    title: "LOL 游戏梗大全：英雄台词、技能与排位黑话",
    description: "收录英雄联盟游戏内流传的英雄台词、技能梗、排位黑话和玩家常用表达，解释含义与使用场景。",
    introduction: "游戏机制、英雄语音、技能名和排位里的经历，都能成为梗。这类梗不必对应某场职业比赛，平时打游戏就能碰到。",
  },
  {
    slug: "yingxiong-taici",
    tag: "英雄台词",
    title: "LOL 英雄台词梗大全：经典语音和二创出处",
    description: "整理英雄联盟经典英雄台词、中文语音空耳和社区二创，解释原句、角色及流行用法。",
    introduction: "英雄台词交代角色设定，玩家又把它们截出来、听成别的词，或套到比赛里。这里对照常被复读的原句、空耳和二创版本。",
  },
  {
    slug: "chuquan-geng",
    tag: "出圈梗",
    title: "LOL 出圈梗大全：从电竞社区传到全网的热梗",
    description: "盘点从英雄联盟和 LPL 社区传播到全网的出圈梗，解释原始出处、含义和后续演变。",
    seo_description: "从 LOL 与 LPL 传到直播、短视频和日常聊天的梗，包括外号、空耳与表情包。词条写明原话、含义、传播背景和二创接法，对照电竞圈内外的用法，并附相关选手、战队与赛事链接。首创者和时间未确认的，见来源与编辑注。",
    introduction: "有些话从 LOL 传到了直播、短视频和日常聊天里。回看最初的电竞出处，也看看离开游戏之后，大家怎么用。",
  },
  {
    slug: "lpl-2026",
    tag: "2026",
    title: "2026 LPL 新梗盘点：比赛热梗和出处时间线",
    description: "持续整理 2026 年 LPL、MSI 与英雄联盟赛事新梗，按出现时间记录比赛背景、原话和传播过程。",
    seo_description: "2026 年英雄联盟赛事与社区的新梗，按首次出现时间排序。对照比赛、采访和直播片段，查选手语录、队内语音及赛后讨论的原话、赛果和背景，也看后来的调侃与回旋镖用法。词条附相关选手、战队和赛事链接；首发未确认或细节有争议的，见考证说明。",
    introduction: "本页追踪 2026 年英雄联盟赛事与社区的新梗。词条按首次出现时间排序，方便从一场比赛、一次采访或一段队内语音追溯当年的热门表达。",
  },
  {
    slug: "xuanshou-yulu",
    tag: "选手语录",
    title: "LOL 选手经典语录：采访、直播与赛后原话",
    description: "收录英雄联盟职业选手经典语录，整理采访、直播、队内语音中的原句、背景和衍生用法。",
    introduction: "采访、直播或队内语音里的一句话，被截出来后可能变了意思。词条尽量写清谁说的、什么时候说的，以及前后在聊什么。",
  },
  {
    slug: "xieyin-geng",
    tag: "谐音梗",
    title: "LOL 谐音梗大全：选手 ID、英雄名与空耳解释",
    description: "整理英雄联盟社区的选手 ID 谐音、英雄名改写和语音空耳，解释文字玩法与最初出处。",
    introduction: "选手 ID、战队名和英雄语音，换个听法或写法就能成梗。这里对照常见谐音、空耳和简繁写法，说明它们如何随赛果被赋予新意思。",
  },
  {
    slug: "zhandui-geng",
    tag: "战队梗",
    title: "LOL 战队梗大全：LPL、LCK 队伍外号和名场面",
    description: "按词条整理英雄联盟战队外号、队史名场面和赛区梗，查看 LPL、LCK 队伍梗的来源。",
    introduction: "队史成绩、主场、粉丝称呼和关键比赛，都能给战队留下外号。词条记录叫法的来历，以及同一个称呼在不同赛季怎么用。",
  },
  {
    slug: "shuzi-geng",
    tag: "数字梗",
    title: "LOL 数字梗大全：4396、2200 等比分数据出处",
    description: "解释英雄联盟社区常见数字梗，追溯伤害、比分、日期和选手 ID 背后的比赛与传播来源。",
    introduction: "4396、2200 这类数字，单看不知在说什么，找到比赛就明白了。这里解释伤害、比分、日期和选手 ID 相关的数字梗，也记录它们后来怎么被复读。",
  },
];

export function getTopic(slug: string) {
  return topicDefinitions.find((topic) => topic.slug === slug);
}

export function getTopicForTag(tag: string) {
  return topicDefinitions.find((topic) => topic.tag === tag);
}

export function getMemesForTopic(memes: MemeEntry[], topic: TopicDefinition) {
  const matching = memes.filter((meme) => topic.player ? meme.players.includes(topic.player) : meme.tags.includes(topic.tag));
  if (topic.tag === "2026") {
    return matching.sort((a, b) => (b.first_seen ?? "").localeCompare(a.first_seen ?? ""));
  }
  return matching.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
}
