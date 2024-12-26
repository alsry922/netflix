import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException } from '@nestjs/common';

@Catch(ForbiddenException)
export class forbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const http = host.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const status = exception.getStatus();

    // 요청 URL에서 호스트, 프로토콜, 쿼리스트링(query string) 등을 제외한 순수한 경로만
    console.log(`[UnauthorizedException] ${request.method} ${request.path}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url, //요청 URL 전체
      message: '권한이 없습니다',
    });
  }
  ㅁ;
}
