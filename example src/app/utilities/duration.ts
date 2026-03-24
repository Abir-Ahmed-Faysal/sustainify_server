import ms, { StringValue } from "ms";

export const toSeconds = (value: StringValue) =>
  Math.floor(ms(value) / 1000);