import { AppError } from './App-error';

export const getErrorString = (exceptionsArray: AppError[]): string => {
  let errorString = '';

  errorString += `\n >>>>> MAIN APP EXCEPTIONS HANDLER: <<<<<<`;
  errorString += `\n > FULL EXCEPTIONS LIST: < \n`;
  exceptionsArray.forEach(
    (appError: AppError, i: number) =>
      (errorString += `>>> Error no ${
        exceptionsArray.length - i
      } ${appError}\n`),
  );
  errorString += `\n > SHORT EXCEPTIONS LIST: < \n`;
  exceptionsArray.forEach(
    (appError: AppError, i: number) =>
      (errorString += `>>> Error no ${
        exceptionsArray.length - i
      } \n Err name -> ${appError.name} \n Err message -> ${
        appError.message
      } \n`),
  );

  return errorString;
};

export const makeFlatAppErrorsArr = (appErrorOrginal: any): AppError[] => {
  let errorsArr: AppError[] = [];
  const run = (appError: AppError) => {
    errorsArr = [...errorsArr, appError];
    if (!!appError?.causeErrors) run(appError.causeErrors);
  };
  run(appErrorOrginal);
  return errorsArr;
};
