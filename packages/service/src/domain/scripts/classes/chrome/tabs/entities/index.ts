export interface ExecuteScriptOptions {
  timeout?: number
}

export interface ICommandResponse {
  cmd: string;
  cid: string;
  result?: any;
  error?: {
    name: string;
    message: string;
    stack?: string | undefined
  };
}

export default interface IEventData {
  cmd: string;
  params: {
    script?: string,
    args?: Array<any>;
    cid: string
  }
}