import { siteMetadata } from "../load";
import { LiveSitePage } from "./site-page";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return siteMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <LiveSitePage slug={(await params).slug} />;
}
