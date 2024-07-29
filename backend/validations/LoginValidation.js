import Joi from "joi";
import { requiredString } from "../functions/joiFunction.js";
export class LoginValidation {
  static register(body) {
    const schema = Joi.object({
      name: Joi.string()
        .required()
        .label("Name")
        .messages(requiredString("Name")),

      email: Joi.string()
        .required()
        .label("Email")
        .messages(requiredString("Email")),
      password: Joi.string()
        .required()
        .label("Password")
        .messages(requiredString("Password")),
      gender: Joi.string()
        .optional()
        .label("Gender")
        .messages(requiredString("Gender")),
      confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref("password"))
        .label("Confirm Password")
        .messages(requiredString("Confirm Password")),
    });

    return schema.validate(body, { abortEarly: false, convert: true });
  }
  static login(body) {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .label("Email")
        .messages(requiredString("Email")),
      password: Joi.string()
        .required()
        .label("Password")
        .messages(requiredString("Password")),
    });

    return schema.validate(body, { abortEarly: false, convert: true });
  }
}
