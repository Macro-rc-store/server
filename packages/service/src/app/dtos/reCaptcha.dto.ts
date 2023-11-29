export enum reCaptchaStatus {
  SUCCESS = "success",
  EXPIRED = "expired",
  ERROR = "error"
}

export interface IRecaptchaDTO {
  token?: string;
  status: reCaptchaStatus;
}