export class BusinessException extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;
  public traceId: string;

  constructor(message: string, statusCode: number, errorCode: string, details?: any, traceId?: string) {
    super(message);
    this.name = 'BusinessException';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.traceId = traceId || BusinessException.generateTraceId();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessException);
    }
  }

  private static generateTraceId(): string {
    // Simple UUID v4 generator (non-cryptographic)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
