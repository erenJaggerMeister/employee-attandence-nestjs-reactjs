const { Injectable, UnauthorizedException, ForbiddenException } = require('@nestjs/common');
const { JwtHelper } = require('./jwt.helper');

@Injectable()
class JwtAuthGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const token = JwtHelper.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Bearer token tidak ditemukan pada header Authorization');
    }

    const decoded = JwtHelper.verify(token);
    if (!decoded) {
      throw new UnauthorizedException('Bearer token tidak valid atau telah kedaluwarsa');
    }

    request.user = decoded;
    return true;
  }
}

function RoleGuard(requiredRole) {
  @Injectable()
  class RoleGuardClass {
    canActivate(context) {
      const request = context.switchToHttp().getRequest();
      const token = JwtHelper.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException('Bearer token tidak ditemukan pada header Authorization');
      }

      const decoded = JwtHelper.verify(token);
      if (!decoded) {
        throw new UnauthorizedException('Bearer token tidak valid atau telah kedaluwarsa');
      }

      request.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        throw new ForbiddenException(`Akses ditolak: Resource ini khusus untuk role ${requiredRole}`);
      }

      return true;
    }
  }
  return RoleGuardClass;
}

module.exports = { JwtAuthGuard, RoleGuard };
