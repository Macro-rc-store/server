import passport from 'passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import config from '../../../config/index.config';
import { AccountDocument } from '../../../domain/entities/account.entity';
import { IAuthenticatedUser } from '../../dtos/account.dto';

const strategy = new Strategy({
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    ExtractJwt.fromUrlQueryParameter('access_token')
  ]),
  secretOrKey: config.jwt.secretKey
}, function(payload: AccountDocument, next) {
  const user: IAuthenticatedUser = {
    id: payload.id,
    username: payload.username
  };

  next(null, user);
});

passport.use(strategy);

export default passport;