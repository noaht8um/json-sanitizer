export type JsonPrimitive = boolean | null | number | string;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };
export const ARRAY_MODES = ['all', 'first', 'empty'] as const;
export type ArrayMode = (typeof ARRAY_MODES)[number];

/**
 * Sanitization options for the `sanitize` function.
 * - `arrayMode`: Determines how arrays are sanitized. Options are:
 *   - `"all"`: Sanitize all elements in the array (default).
 *   - `"first"`: Keep only the first element and sanitize it.
 *   - `"empty"`: Replace with an empty array.
 * - `preserveBooleans`: Whether to preserve boolean values (default: true) or replace them with `true`.
 * - `stringPlaceholder`: The placeholder string to use when sanitizing string values (default: "string").
 * - `numberPlaceholder`: The placeholder number to use when sanitizing number values (default: 0).
 */
export interface SanitizeOptions {
  arrayMode?: ArrayMode;
  preserveBooleans?: boolean;
  stringPlaceholder?: string;
  numberPlaceholder?: number;
}
/**
 * Default sanitization options. Users can override these by passing an options object to the `sanitize` function.
 */
const defaults: Required<SanitizeOptions> = {
  arrayMode: 'all',
  preserveBooleans: true,
  stringPlaceholder: 'string',
  numberPlaceholder: 0,
};
/**
 * Checks if a value is a valid JSON value.
 * @param value The value to check.
 * @returns Whether the value is a valid JSON value (i.e., can be serialized to JSON).
 */
export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true;

  switch (typeof value) {
    case 'string':
    case 'boolean':
      return true;
    case 'number':
      return Number.isFinite(value);
    case 'object':
      if (Array.isArray(value)) {
        return value.every(isJsonValue);
      }
      return Object.values(value as Record<string, unknown>).every(isJsonValue);
    default:
      return false;
  }
}

/**
 * Sanitizes a JSON value by replacing strings and numbers with placeholders, and optionally preserving booleans.
 * Arrays can be sanitized by either keeping the first element (default) or replacing with an empty array.
 * @param value The JSON value to sanitize.
 * @param opts Sanitization options.
 * @returns The sanitized JSON value.
 */
export function sanitize(
  value: JsonValue,
  opts: SanitizeOptions = {},
): JsonValue {
  const options = { ...defaults, ...opts };

  if (value === null) return null;

  switch (typeof value) {
    case 'string':
      return options.stringPlaceholder;
    case 'boolean':
      return options.preserveBooleans ? value : true;
    case 'number':
      return options.numberPlaceholder;
    case 'object': {
      if (Array.isArray(value)) {
        if (value.length === 0 || options.arrayMode === 'empty') {
          return [];
        }
        if (options.arrayMode === 'all') {
          return value.map((item) => sanitize(item, options));
        }
        return [sanitize(value[0], options)];
      }

      const out: Record<string, JsonValue> = {};
      for (const [key, val] of Object.entries(value)) {
        out[key] = sanitize(val, options);
      }
      return out;
    }
  }
}
