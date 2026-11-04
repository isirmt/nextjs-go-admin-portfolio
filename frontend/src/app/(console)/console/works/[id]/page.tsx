import WorkEditor from "@/components/console/workEditor";

type EditWorkPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkPage({ params }: EditWorkPageProps) {
  const { id } = await params;

  return <WorkEditor workId={id} />;
}
