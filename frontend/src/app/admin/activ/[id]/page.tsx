import { ACTIVS } from "@/lib/roles";
import { FicheActiv } from "./FicheActiv";

export function generateStaticParams() {
  return ACTIVS.map((activ) => ({ id: activ.id }));
}

export default async function PageFicheActiv({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FicheActiv id={id} />;
}
