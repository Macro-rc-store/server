import { Request, Response } from 'express';
import BaseController, { UtilityFunctions } from '../../core/controller/index.controller';
import { body, query } from 'express-validator';
import AccountService from '../../domain/services/account.service';
import { IAccountLoginDTO, IAccountChangePasswordDTO } from '../dtos/account.dto';

class AccountController extends BaseController {
  private service: AccountService;
  
  constructor() {
    super();
    this.initialize([
      ['GET', '/session', this.session],
      ['GET', '/get-info', this.getAccountInfo],
      ['POST', '/change-password', this.changePassword, [
        body('currentPassword')
          .notEmpty().withMessage('current password is required'),
        body('newPassword')
          .notEmpty().withMessage('new password is required'),
        body('confirmPassword')
          .notEmpty().withMessage('confirm password is required'),
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

  private session(req: Request, res: Response, {success, error}: UtilityFunctions) {
    const user = req.user;

    if (!user) {
      return error({
        message: 'You are not logged in!'
      });
    }

    return success({
      data: {user},
      message: 'Get session profile success!'
    });
  }

  private async getAccountInfo(req: Request, res: Response, {success, error}: UtilityFunctions) {
    const user = req.user as Required<{ username: string }>;

    if (!user) {
      return error({
        message: 'You are not logged in!'
      });
    }

    const accountInfo = await this.service.getInfo(user.username);

    return success({
      data: accountInfo,
      message: 'Get account information success!'
    });
  }

  private async changePassword(req: Request, res: Response, {success, error}: UtilityFunctions) {
    const params: Required<IAccountChangePasswordDTO> = req.body as unknown as Required<IAccountChangePasswordDTO>;
    const user = req.user as Required<{
      id: string,
      username: string,
    }>;
    const {currentPassword, newPassword, confirmPassword} = params;

    if(confirmPassword !== newPassword) {
      return error({
        message: 'Confirm password and New password are not the same!'
      });
    }

    const token = await this.service.authenticate(user.username, currentPassword)
    if(!token) {
      return error({
        message: 'Current password is incorrect!'
      });
    }

    await this.service.changePassword(user.username, newPassword);
    return success({
      message: 'Change password success!'
    });
  }
}

export default AccountController;