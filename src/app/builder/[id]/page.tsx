import { notFound } from "next/navigation";
import { dbStore } from "@/lib/db/store";
import { BuilderWorkspace } from "@/components/builder/workspace";

export const dynamic = "force-dynamic";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = dbStore.getProject(id, "admin");

  if (!project) {
    notFound();
  }

  const files = dbStore.getProjectFiles(id);
  const checkpoints = dbStore.getCheckpoints(id);

  return (
    <BuilderWorkspace
      project={project}
      initialFiles={files}
      checkpoints={checkpoints}
    />
  );
}
