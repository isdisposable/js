export interface IsDisposableResult {
  disposable: boolean;
  email: string;
  domain: string;
  score: number;
  reason: string;
  mx_valid?: boolean;
  domain_age_days?: number;
  cached: boolean;
}

export interface IsDisposableConfig {
  apiKey?: string;
  apiUrl?: string;
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export type SimpleResult = boolean;
export type DetailedResult = IsDisposableResult;
