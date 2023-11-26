import { Request, Response } from 'express';
import BaseController, { UtilityFunctions } from '../../../core/controller/index.controller';
import { body, query } from 'express-validator';
import AccountService from '../../../domain/services/account.service';
import { IAccountLoginDTO, IAccountRegisterDTO } from '../../dtos/account.dto';

class AuthController extends BaseController {
  private service: AccountService;
  
  constructor() {
    super();
    this.initialize([
      ['POST', '/login', this.login, [
        body('username')
          .notEmpty().withMessage('Username is required!'),
        body('password')
          .notEmpty().withMessage('Password is required!')
      ]],
      ['POST', '/register', this.register, [
        body('email')
          .notEmpty().withMessage('Email is required!')
          .isEmail().withMessage('Email format incorrect!'),
        body('username')
          .notEmpty().withMessage('Username is required!'),
        body('password')
          .notEmpty().withMessage('Password is required!'),
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

    if(responseRecaptcha.error) {
      return error({
        message: 'reCaptcha has error. Please come back later!'
      });
    }

    if(!responseRecaptcha.success) {
      return error({
        message: 'You have not verified the recaptcha. Please verify!'
      });
    }

    return success({
      data: {
        token: token
      },
      message: 'Login success'
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

    if(responseRecaptcha.error) {
      return error({
        message: 'reCaptcha has error. Please come back later!'
      });
    }

    if(!responseRecaptcha.success) {
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