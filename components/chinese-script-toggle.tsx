"use client";

import { Suspense, useSyncExternalStore, type SyntheticEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { withLocalePath, type Locale } from "@/lib/locale-path";

function subscribeLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

function getHash() { return window.location.hash; }
function getServerHash() { return ""; }

function ScriptLink({ pathname, locale, suffix = "" }: { pathname: string; locale: Locale; suffix?: string }) {
  const traditional = locale === "zh-TW";
  const targetLocale = traditional ? "zh-CN" : "zh-TW";
  const label = traditional ? "切換為簡體中文" : "切换为繁体中文";
  function syncDestination(event: SyntheticEvent<HTMLAnchorElement>) {
    // 导航前再核对一次，覆盖查询提交与点击之间的极短时间窗口。
    event.currentTarget.href = withLocalePath(window.location.pathname + window.location.search + window.location.hash, targetLocale);
  }

  return (
    <div className="script-switch" translate="no">
      <a
        className="script-switch-button"
        href={withLocalePath(`${pathname}${suffix}`, targetLocale)}
        hrefLang={targetLocale}
        lang={targetLocale}
        aria-label={label}
        title={label}
        data-traditional={traditional ? "true" : "false"}
        onClick={syncDestination}
        onAuxClick={syncDestination}
        onContextMenu={syncDestination}
      >{traditional ? "简" : "繁"}</a>
    </div>
  );
}

function QueryAwareScriptLink({ pathname, locale }: { pathname: string; locale: Locale }) {
  const searchParams = useSearchParams();
  const hash = useSyncExternalStore(subscribeLocation, getHash, getServerHash);
  const query = searchParams.toString();
  return <ScriptLink pathname={pathname} locale={locale} suffix={`${query ? `?${query}` : ""}${hash}`} />;
}

export function ChineseScriptToggle() {
  const pathname = usePathname();
  const { locale } = useLocale();
  // 只延后查询相关的控件；正文及可抓取的语言链接仍在初始 HTML 中。
  return (
    <Suspense fallback={<ScriptLink pathname={pathname} locale={locale} />}>
      <QueryAwareScriptLink pathname={pathname} locale={locale} />
    </Suspense>
  );
}
