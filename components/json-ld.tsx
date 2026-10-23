import { LocalizedJsonLd } from "@/components/localized-json-ld";
import { siteConfig } from "@/lib/site";

export function JsonLd({ data }: { data: object }) {
  return <LocalizedJsonLd data={data} siteUrl={siteConfig.url} />;
}
