export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  errors?: Record<string, string>;
  details?: string[];
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  [key: string]: any; // Allow other fields that might be returned
}
