export interface DownloadInfo {
  link: string;
  sdkVersion: number;
}

export interface AppMetadata {
  title?: string;
  developer?: string;
  version?: string;
}

export interface AppResult extends AppMetadata {
  packageName: string;
  link: string;
  sdkVersion: number;
}

export interface FetchOptions {
  fetchImpl?: typeof fetch;
}

export interface DownloadLinkOptions extends FetchOptions {
  sdkVersions?: number[];
}

export interface ResolveAppOptions extends FetchOptions {
  sdkVersions?: number[];
  metadata?: boolean;
}

export interface FormatResultOptions {
  json?: boolean;
  linkOnly?: boolean;
}

export interface CliIoOptions extends FetchOptions {
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
}

export interface CliOptions {
  json?: boolean;
  linkOnly?: boolean;
  metadata?: boolean;
  sdk?: number;
}

interface AppDownloadInfoReply {
  token?: string;
  cdnPrefix?: string[];
}

export interface BazaarApiResponse {
  singleReply?: {
    appDownloadInfoReply?: AppDownloadInfoReply;
  };
}
