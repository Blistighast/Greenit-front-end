import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[] ) => {
  // record is type for a map, w/ string key & string value
  const errorMap: Record<string, string> = {}; 
  errors.forEach(({field, message}) => {
    errorMap[field] = message;
  });

  return errorMap;
};