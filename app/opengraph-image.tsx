import { ImageResponse } from "next/og";

export const alt = "LOL 梗 Wiki — 英雄联盟社区文化档案";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() { return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07110f", color: "#eee9d9", padding: "64px", border: "18px solid #d7ff43", fontFamily: "serif" }}><div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 24, color: "#d7ff43" }}><span>COMMUNITY ARCHIVE / 001</span><span>LOLGENG.WIKI</span></div><div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", fontSize: 116, lineHeight: 1, fontWeight: 800 }}>LOL 梗 Wiki</div><div style={{ display: "flex", marginTop: 32, fontSize: 36, color: "#b8c0b8" }}>记录那些莫名其妙，但大家都懂的东西。</div></div><div style={{ display: "flex", gap: 18, fontFamily: "monospace", fontSize: 24 }}><span>#4396</span><span>#红温</span><span>#1557</span><span>#忍界大战</span></div></div>, size); }
