"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorksContext } from "@/contexts/worksContext";
import WorkRegisterForm, {
  createWorkRegisterFormInitialValues,
} from "./workRegisterForm";

type WorkEditorProps = {
  workId?: string;
};

export default function WorkEditor({ workId }: WorkEditorProps) {
  const router = useRouter();
  const { works, isLoading, error } = useWorksContext();
  const work = workId ? works.find((item) => item.id === workId) : undefined;

  return (
    <main className="relative w-full space-y-8 px-2.5 py-8 lg:px-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#7e11d1]">
          {workId ? "制作物を編集" : "新規制作物を作成"}
        </h1>
        <Link
          className="text-sm font-bold text-[#7e11d1] underline-offset-4 hover:underline"
          href="/console/works"
        >
          制作物一覧へ戻る
        </Link>
      </header>
      {workId && isLoading ? (
        <p className="text-muted-foreground text-sm">読み込み中です</p>
      ) : null}
      {workId && error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : null}
      {workId && !isLoading && !error && !work ? (
        <p className="text-muted-foreground text-sm">制作物が見つかりません</p>
      ) : null}
      {!workId ? (
        <WorkRegisterForm
          onSubmitted={(createdWorkId) => {
            router.replace(
              createdWorkId
                ? `/console/works/${createdWorkId}`
                : "/console/works",
            );
          }}
        />
      ) : null}
      {workId && work ? (
        <WorkRegisterForm
          key={work.id}
          mode="put"
          workId={work.id}
          initialValues={createWorkRegisterFormInitialValues(work)}
        />
      ) : null}
    </main>
  );
}
