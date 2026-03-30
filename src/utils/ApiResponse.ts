export class ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data?: T;
  message?: string;

  constructor(statusCode: number, data?: T, message?: string) {
    this.success = true;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}

export class PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(
    statusCode: number,
    data: T[],
    meta: { page: number; limit: number; total: number; totalPages: number },
    message?: string
  ) {
    super(statusCode, data, message);
    this.meta = meta;
  }
}
