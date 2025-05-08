import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsLargerThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsLargerThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const targetName = args.constraints[0];
          const targetValue = args.object[targetName];
          const currentValue = value;

          return currentValue > targetValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `to must be larger than ${args.targetName}.${args.constraints[0]}`;
        },
      },
    });
  };
}
