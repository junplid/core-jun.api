export interface ErrorResponse {
  statusCode: number;
  message: string;
  detail: {
    message: string;
    path: string[];
    type: string;
  }[];
}
