/* eslint-disable */
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

// so input field takes any props a regular input would take
type InputfieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string; // name defaults optional but needs to be required for useField
  label: string;
  textarea?: boolean;
};

export const Inputfield: React.FC<InputfieldProps> = ({
  label,
  textarea,
  size, // Input couldnt take size, so destructored out
  ...props
}) => {
  let InputOrTextarea = Input;
  if (textarea) {
    InputOrTextarea = Textarea as any;
  }
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextarea {...field} {...props} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
