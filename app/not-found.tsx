import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() { return <div className="not-found page-shell"><SearchX size={42} /><p className="eyebrow">ERROR / 404</p><h1>这条梗，还没被记下来。</h1><p>可能是链接写错了，也可能你刚好发现了一个档案空缺。</p><div><Link className="button-secondary" href="/"><ArrowLeft size={17} /> 返回首页</Link><Link className="button-primary" href="/submit">提交新梗 ↗</Link></div></div>; }
