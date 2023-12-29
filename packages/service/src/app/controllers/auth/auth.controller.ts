import { Request, Response } from 'express';
import BaseController, { UtilityFunctions } from '../../../core/controller/index.controller';
import { body, query } from 'express-validator';
import AccountService from '../../../domain/services/account.service';
import { IAccountLoginDTO, IAccountRegisterDTO } from '../../dtos/account.dto';
import { reCaptchaStatus } from '../../dtos/reCaptcha.dto';

class AuthController extends BaseController {
  private service: AccountService;
  
  constructor() {
    super();
    this.initialize([
      ['POST', '/login', this.login, [
        body('username')
          .notEmpty().withMessage('Phải nhập Username!')
          .custom(value => /^[a-zA-Z0-9]+$/.test(value)).withMessage('Username không được chứa ký tự đặc biệt!'),
        body('password')
          .notEmpty().withMessage('Phải nhập Password!')
      ]],
      ['POST', '/register', this.register, [
        body('email')
          .notEmpty().withMessage('Phải nhập Email!')
          .isEmail().withMessage('Sai định dạng Email!'),
        body('username')
          .notEmpty().withMessage('Phải nhập Username!')
          .isLength({ min: 6, max: 25 }).withMessage('Username phải từ 6-25 ký tự!')
          .custom(value => /^[a-zA-Z0-9]+$/.test(value)).withMessage('Username không được chứa ký tự đặc biệt!'),
        body('password')
          .notEmpty().withMessage('Phải nhập Password!')
          .isLength({ min: 8, max: 30 }).withMessage('Password phải từ 8-30 ký tự!'),
      ]]
    ]);
    
    /**
     * Services
     */
    this.service = new AccountService();
  }

  /**
   * Funcs
   */

  /**
   * Controllers
   */

  private async login(req: Request, res: Response, {success, error}: UtilityFunctions) {
    const params: Required<IAccountLoginDTO> = req.body as unknown as Required<IAccountLoginDTO>;
    const {username, password, remember, responseRecaptcha} = params;
    
    const token = await this.service.authenticate(username, password, remember as boolean);

    if (!token) {
      return error({
        message: 'Your username or password are incorrect!'
      });
    }

    if(responseRecaptcha.status == reCaptchaStatus.ERROR) {
      return error({
        message: 'reCaptcha has error. Please come back later!'
      });
    }

    if(responseRecaptcha.status != reCaptchaStatus.SUCCESS) {
      return error({
        message: 'You have not verified the recaptcha. Please verify!'
      });
    }

    return success({
      data: {
        token: token
      },
      message: 'Login success!'
    });
  }

  private async register(req: Request, res: Response, {success, error}: UtilityFunctions) {
    const params: Required<IAccountRegisterDTO> = req.body as unknown as Required<IAccountRegisterDTO>
    const {email, username, password, responseRecaptcha} = params;

    if(await this.service.hasExistUserName(username)) {
      return error({
        message: 'Username already exists!'
      });
    }

    if(responseRecaptcha.status == reCaptchaStatus.ERROR) {
      return error({
        message: 'reCaptcha has error. Please come back later!'
      });
    }

    if(responseRecaptcha.status != reCaptchaStatus.SUCCESS) {
      return error({
        message: 'You have not verified the recaptcha. Please verify!'
      });
    }

    await this.service.createOrUpdate(email, username, password);
    return success({
      message: 'Register account success!'
    });
  }
}

export default AuthController;