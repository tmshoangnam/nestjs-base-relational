import { Session } from '../../../session/domain/session';
import { User } from '../../../users/domain/user';

export type JwtPayloadType = Pick<User, 'id'> & {
  role: User['roles'][0] | null;
  sessionId: Session['id'];
  roles?: string[];
  iat: number;
  exp: number;
};
