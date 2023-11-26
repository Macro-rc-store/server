export interface IResponseError {
  code?: number | string;
  message: string;
  description?: string;
  summary?: string;
  detail?: string;
}

export interface IResponse {
  data?: Array<object> | string | number | object | Array<number> | Array<string>;
  error?: IResponseError;
  errors?: Array<IResponseError>;
  message: string;
}