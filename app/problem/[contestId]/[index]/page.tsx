import { redirect } from "next/navigation";

export default async function LegacyCodeforcesProblemPage({
  params,
}: {
  params: Promise<{ contestId: string; index: string }>;
}) {
  const { contestId, index } = await params;
  redirect(`/dashboard/problems/cf/${contestId}/${index}`);
}
