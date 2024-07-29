export function changeToErrorObject(error) {
  const errorObject = {};

  error.details.forEach((detail) => {
    errorObject[detail.context.key] = detail.message;
  });
  return errorObject;
}
