import { useCallback, useMemo, useState } from 'react';

/**
 * Validator می‌تواند:
 * - boolean برگرداند
 * - آرایه‌ای از پیام خطا برگرداند (invalid)
 * - آبجکتی با { valid: boolean; issues?: string[] } برگرداند
 */
type ValidationOutput<E = string> =
  | boolean
  | E[]
  | { valid: boolean; issues?: E[] };

export function useArtifactValidation<T, E = string>(
  validator: (data: T) => ValidationOutput<E>
) {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [issues, setIssues] = useState<E[]>([]);

  const normalize = useCallback((out: ValidationOutput<E>) => {
    if (typeof out === 'boolean') {
      return out ? { valid: true, issues: [] as E[] } : { valid: false, issues: [] as E[] };
    }
    if (Array.isArray(out)) {
      return out.length === 0
        ? { valid: true, issues: [] as E[] }
        : { valid: false, issues: out };
    }
    return { valid: Boolean(out.valid), issues: out.issues ?? ([] as E[]) };
  }, []);

  const validate = useCallback((data: T) => {
    const out = validator(data);
    const { valid, issues } = normalize(out);
    setIsValid(valid);
    setIssues(issues);
    return valid;
  }, [validator, normalize]);

  const reset = useCallback(() => {
    setIsValid(false);
    setIssues([]);
  }, []);

  return useMemo(
    () => ({ isValid, issues, validate, reset }),
    [isValid, issues, validate, reset]
  );
}