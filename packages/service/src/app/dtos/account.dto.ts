import { IRecaptchaDTO } from "./reCaptcha.dto";

export interface IAccountLoginDTO {
  username: string;
  password: string;
  remember: boolean;
  responseRecaptcha: IRecaptchaDTO;
}

export interface IAccountRegisterDTO {
  email: string;
  username: string;
  password: string;
  responseRecaptcha: IRecaptchaDTO;
}

export interface IAuthenticatedUser {
  id: string;
  username: string;
}

export interface IAccountChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}