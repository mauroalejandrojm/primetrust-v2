declare module "primetrust-v2" {
    export class Client {
      get: (
        path: string,
        query?: { [prop: string]: string },
        headers?: { "Idempotency-Key"?: string } & { [prop: string]: string }
      ) => Promise<Response>;
      post: (
        path: string,
        body?: object,
        headers?: { "Idempotency-Key"?: string } & { [prop: string]: string }
      ) => Promise<Response>;
      delete: (path: string) => Promise<Response>;
      constructor(options: {
        userId: string;
        username: string;
        password: string;
        environment?: "sandbox" | "api";
      });
    }
  
    interface Response {
      status: number;
      headers: Headers;
      body: any;
    }
  }
  