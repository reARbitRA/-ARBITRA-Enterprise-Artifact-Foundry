export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
export type JsonObject = { [k: string]: JsonValue };

export type ArtifactStatus = 'pending' | 'complete' | 'error';

export type ISODateString = string;

/**
 * آرتیفکت با جنریک دیتا (به‌صورت پیش‌فرض JSON)
 */
export type Artifact<Data = JsonValue> = {
  id: string;
  name: string;
  status: ArtifactStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  data?: Data;
};

export type DashboardMetric = {
  key: string;
  value: number;
  label: string;
};

export type AIToolkitConfig = {
  model: string;
  provider: 'openai' | 'google' | 'azure' | 'custom';
  temperature: number;
  maxTokens: number;
};

/**
 * خطای استاندارد برنامه
 */
export interface AppError extends Error {
  code: string;
  status?: number;
  cause?: unknown;
  meta?: Record<string, unknown>;
}

/**
 * نتیجه‌ی امن عملیات‌ها
 */
export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type ErrorContextType = {
  errors: AppError[];
  addError: (err: AppError) => void;
  clearErrors: () => void;
};