import Joi from "joi";
import { requiredPhotos, requiredString } from "../functions/joiFunction.js";
export class PostValidates {
  static addPost(body) {
    const schema = Joi.object({
      title: Joi.string()
        .required()
        .label("Title")
        .messages(requiredString("Title")),

      content: Joi.string()
        .required()
        .label("Content")
        .messages(requiredString("Content")),
      image: Joi.any()
        .optional()
        .label("Image")
        .messages(requiredPhotos("Image")),
    });

    return schema.validate(body, { abortEarly: false, convert: true });
  }
  static updatePost(body) {
    const schema = Joi.object({
      title: Joi.string()
        .optional()
        .label("Title")
        .messages(requiredString("Title")),

      content: Joi.string()
        .optional()
        .label("Content")
        .messages(requiredString("Content")),
      image: Joi.any()
        .optional()
        .label("Image")
        .messages(requiredPhotos("Image")),
    });

    return schema.validate(body, { abortEarly: false, convert: true });
  }
}
