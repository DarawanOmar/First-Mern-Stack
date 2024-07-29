export function requiredString(label) {
  return {
    "any.required": `${label} is required`,
    "string.empty": `${label} is required`,
    "string.base": `${label} should be string`,
  };
}

export function requiredPhotos(label) {
  return {
    "any.required": `${label} is required`,
    "any.invalid": `invailed photo`,
    "array.max": `${label} must contain less than or equal to 7 photos.`,
  };
}
