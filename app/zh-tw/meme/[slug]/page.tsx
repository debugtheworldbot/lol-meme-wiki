import { generateMetadata as simplifiedMetadata } from "@/app/(zh-cn)/meme/[slug]/page";
import { localizeMetadata } from "@/lib/locale-seo";
export async function generateMetadata(props: Parameters<typeof simplifiedMetadata>[0]) {
  return localizeMetadata(await simplifiedMetadata(props), "zh-TW");
}
export { default } from "@/app/(zh-cn)/meme/[slug]/page";
export { generateStaticParams } from "@/app/(zh-cn)/meme/[slug]/page";
export const dynamicParams = false;
