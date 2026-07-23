import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'latinbrou_jwt_secret_streetwear_2026',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, isAdmin: payload.isAdmin };
  }
}
