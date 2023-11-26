export interface IRecaptchaDTO {
  token?: string;
  success: boolean;
  expired: boolean;
  error: boolean;
}