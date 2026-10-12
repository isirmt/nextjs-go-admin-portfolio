import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

type ConsoleTextFieldProps = {
  value: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

type ConsoleTextFieldController = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  inputProps: ConsoleTextFieldProps;
  reset: (nextValue?: string) => void;
};

export default function useConsoleTextField(
  initialValue = "",
): ConsoleTextFieldController {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(event.target.value);
    },
    [],
  );

  const reset = useCallback((nextValue = "") => {
    setValue(nextValue);
  }, []);

  const inputProps = useMemo(() => ({ value, onChange }), [value, onChange]);

  return { value, setValue, inputProps, reset };
}
