import { IsEmail, isEmail, isEmpty, Length } from "class-validator";

export class CreateCustomerInputs {
  @IsEmail()
  email: string;
  @Length(7, 12)
  phone: string;
  @Length(7, 12)
  password: string;
}

export class UserLoginInputs {
  @IsEmail()
  email: string;

  @Length(7, 12)
  password: string;
}
export class EditCustomerProfileInputs {
  @Length(7, 12)
  firstName: string;
  @Length(7, 12)
  lastName: string;
  @Length(7, 12)
  address: string;
}

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}

export class OrderInputs {
  _id: string;
  unit: number;
}
