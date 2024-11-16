import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

//@ValidatorConstraint의 옵션 객체로 {async: true}를 넣어주면 비동기로도 검증 어노테이션을 적용할 수 있다.(해서 이점이 뭘까 싶긴 하다.)
@ValidatorConstraint()
class PasswordValidator implements ValidatorConstraintInterface {
  defaultMessage(validationArguments?: ValidationArguments): string {
    return '비밀번호의 길이는 4~8자 이어야 합니다. ($value)';
  }

  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    //비밀번호 길이는 4-8
    return value.length > 4 && value.length < 8;
  }
}

//이렇게 하면 class-validator에서 @IsPasswordValid라는 검증 데코레이터를 등록해줘서 우리가 사용할 수 있음
//앱을 실행할 때 이 isPasswordValid 함수가 실행될텐데, 데코레이터에 test값을 넘겨주면 확인 가능하다.
function isPasswordValid(
  validationOptions?: ValidationOptions,
  //test?: string
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor, //생성자 넣어줌
      propertyName, //검증 데코레이터를 적용한 프로퍼티 키
      options: validationOptions, // validationOptions는 검증 데코레이터의 파라미터로 객체를 넣어주는데, 그 객체가 validationOptions다
      validator: PasswordValidator,
    });
  };
}

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @IsOptional()
  genreIds?: number[];

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  detail?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  directorId?: number;
}
