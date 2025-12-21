"use client";

import { useCallback, useRef } from "react";

type TransitionSnapshot<T> = {
  from: T;
  to: T;
  progress: number;
  duration: number;
};

type SetTargetOptions = {
  immediate?: boolean;
};

export function useTransitionState<T>(
  initialState: T,
  mappingFunc: (from: T, to: T, progress: number) => T,
  durationMs: number = 150,
) {
  const valueRef = useRef<T>(initialState);
  const transitionRef = useRef<TransitionSnapshot<T>>({
    from: initialState,
    to: initialState,
    progress: 1,
    duration: Math.max(1, durationMs),
  });

  const jumpTo = useCallback((nextState: T) => {
    valueRef.current = nextState;
    transitionRef.current = {
      ...transitionRef.current,
      from: nextState,
      to: nextState,
      progress: 1,
    };
  }, []);

  const startTransition = useCallback(
    (nextState: T, options?: SetTargetOptions) => {
      if (options?.immediate) {
        jumpTo(nextState);
        return;
      }

      transitionRef.current = {
        ...transitionRef.current,
        from: valueRef.current,
        to: nextState,
        progress: 0,
      };
    },
    [jumpTo],
  );

  const step = useCallback(
    (deltaMs: number) => {
      const transition = transitionRef.current;

      if (transition.progress >= 1) {
        valueRef.current = transition.to;
        return valueRef.current;
      }

      const nextProgress = Math.min(
        1,
        transition.progress + deltaMs / transition.duration,
      );
      transition.progress = nextProgress;

      valueRef.current = mappingFunc(
        transition.from,
        transition.to,
        transition.progress,
      );

      return valueRef.current;
    },
    [mappingFunc],
  );

  const getProgress = useCallback(() => transitionRef.current.progress, []);

  const getValue = useCallback(() => valueRef.current, []);

  return {
    valueRef,
    step,
    startTransition,
    jumpTo,
    getProgress,
    getValue,
  };
}
