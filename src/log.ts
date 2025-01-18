import { LogSync, Logging } from "@google-cloud/logging";

const logging = new Logging();

/**
 * getLogger returns a synchronous logger (LogSync) to a log named using `name`.
 * Using `logSync` is specifically recommended for Google Cloud serverless
 * Using the asynchronous logger (`Log`) risks dropping logs
 * https://cloud.google.com/nodejs/docs/reference/logging/latest/logging/logsync
 * @param {string} name The name to give the log.
 * @return {LogSync} A synchronous logger.
 */
export function getLogger(name: string): LogSync {
  return logging.logSync(name);
}

/**
 * getDefaultLogger returns a synchronous logger to a log named after this
 * package.
 * @return {LogSync} A synchronous logger.
 * @throws Error if `npm_package_name` isn't set (either set explicitly or use
 * npm (`npm start|test`). See [package.json vars](https://docs.npmjs.com/cli/v10/using-npm/scripts#packagejson-vars).
 */
export function getDefaultLogger(): LogSync {
  const name = process.env.npm_package_name;
  if (!name) {
    throw new Error(
      "npm_package_name not set (use `npm start` or explicitly set env var)",
    );
  }
  return getLogger(name);
}
