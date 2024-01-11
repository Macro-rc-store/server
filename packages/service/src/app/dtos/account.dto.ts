import { IRecaptchaDTO } from "./reCaptcha.dto";

export interface IAccountLoginDTO {
  username: string;
  password: string;
  remember: boolean;
  role: string;
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
  role: string;
}

export interface IAccountChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}