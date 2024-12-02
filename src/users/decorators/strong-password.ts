import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, _args: ValidationArguments) {
          const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return strongPasswordRegex.test(value);
        },
        defaultMessage(_args: ValidationArguments) {
          if (typeof validationOptions?.message === 'string') {
            return validationOptions.message;
          }
          return 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
        },
      },
    });
  };
}
