import { AppError } from './App-error';

export const logError = (exceptionsArray: AppError[]): void => {
  console.log(
    '\n',
    '>>>>>          MAIN APP EXCEPTIONS HANDLER:          <<<<<<',
  );
  console.log('\n', '> FULL EXCEPTIONS LIST: <', '\n');
  exceptionsArray.forEach((appError: AppError, i: number) =>
    console.error(`>>> Error no ${exceptionsArray.length - i}`, appError, '\n'),
  );
  console.log('\n', '> SHORT EXCEPTIONS LIST: <', '\n');
  exceptionsArray.forEach((appError: AppError, i: number) =>
    console.error(
      `>>> Error no ${exceptionsArray.length - i}`,
      '\n',
      'Err name -> ',
      appError.name,
      '\n',
      'Err message -> ',
      appError.message,
      '\n',
    ),
  );
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
