import { useCallback, useState } from "react";

type ConsoleMutationSuccess<T> = {
  ok: true;
  data: T;
};

type ConsoleMutationFailure = {
  ok: false;
};

type ConsoleMutationResult<T> =
  | ConsoleMutationSuccess<T>
  | ConsoleMutationFailure;

export default function useConsoleMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T>(
      operation: () => Promise<T>,
      fallbackError: string,
    ): Promise<ConsoleMutationResult<T>> => {
      setIsPending(true);
      setError(null);
      try {
        return { ok: true, data: await operation() };
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : fallbackError);
        return { ok: false };
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { isPending, error, setError, run } as const;
}
