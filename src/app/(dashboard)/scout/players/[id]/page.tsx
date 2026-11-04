import { ScoutPlayerDetails } from "./ScoutPlayerDetails";

export const instant = false;

export default async function ScoutPlayerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScoutPlayerDetails playerId={id} />;
}
