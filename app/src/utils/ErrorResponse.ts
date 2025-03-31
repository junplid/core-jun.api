interface ErrorResponse_I {
  toast: {
    title: string;
    duration?: number;
    description?: string;
    type?: "info" | "success" | "loading" | "error";
    placement?:
      | "top"
      | "top-start"
      | "top-end"
      | "bottom"
      | "bottom-start"
      | "bottom-end";
  }[];
  container?: string;
  input: {
    path: string;
    text: string;
  }[];
  statusCode: number;
}

export class ErrorResponse {
  private response: ErrorResponse_I;
  constructor(statusCode: number) {
    this.response = {
      toast: [],
      input: [],
      statusCode,
    };
  }

  toast(toast: ErrorResponse_I["toast"][0]) {
    if (!this.response.toast?.length) {
      this.response.toast = [toast];
    } else {
      this.response.toast.push(toast);
    }
    return this;
  }

  container(message: string) {
    this.response.container = message;
    return this;
  }

  input(input: ErrorResponse_I["input"][0]) {
    if (!this.response.input?.length) {
      this.response.input = [input];
    } else {
      this.response.input.push(input);
    }
    return this;
  }

  getResponse() {
    return this.response;
  }
}
