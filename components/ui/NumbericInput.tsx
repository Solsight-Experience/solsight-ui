'use client'

import { ChangeEvent, ComponentProps, useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { INumberFormatter } from "@/lib/number-formatters";

type InputProps = Omit<ComponentProps<"input">, 'type' | 'value' | 'onChange' | 'onBlur'>

type NumbericInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  formatter: INumberFormatter;
} & InputProps;

export const NumbericInput = ({
  value,
  onChange,
  formatter,
  ...rest
}: NumbericInputProps) => {
  const [display, setDisplay] = useState("");
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setDisplay(formatter.format(value));
    }
  }, [value, formatter]);


  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const validPattern = /^[0-9.,]*$/;
    if (!validPattern.test(raw)) return;

    setDisplay(raw);

    const num = formatter.convertBack(raw) || 0;
    onChange(num);
  }

  const handleBlur = () => {
    setDisplay(formatter.format(value));
  }

  const handleFocus = () => {
    isFocused.current = true;
    // convert formatted value to raw number string on focus
    const num = formatter.convertBack(display);
    setDisplay(num !== null ? num.toString() : "");
  }

  return (
    <Input type="text" onFocusCapture={handleFocus} value={display} onChange={handleInput} onBlur={handleBlur} {...rest} />
  )
}

