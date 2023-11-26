import _ from 'lodash';

export async function wait(ms: number): Promise<unknown> {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

export function formatIntegerByDigits(num: number, minimumDigits: number) {
  return num.toLocaleString('en-US', {
    minimumIntegerDigits: minimumDigits,
    useGrouping: false
  });
}

export function randomUid() {
  const S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getTimeMilisecond() {
  return Date.now();
}

export function getTimeSecond() {
  return parseInt((getTimeMilisecond() / 1000).toString());
}

export function isObject(variable: any) {
  try {
    return Object.keys(variable).length > 0;
  }
  catch(error) {
    return false;
  }
}

export function camelCaseToSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelCaseToSnakeCase(item));
  }

  if (obj._id && typeof obj._id === 'object' && obj._id.toHexString) {
    obj._id = obj._id.toHexString();
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeCaseKey = _.snakeCase(key);

      if (isObject(obj[key])) {
        result[snakeCaseKey] = camelCaseToSnakeCase(obj[key]);
      } else {
        result[snakeCaseKey] = obj[key];
      }
    }
  }

  return result;
}

export function snackCaseToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snackCaseToCamelCase);
  }

  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelCaseKey = _.camelCase(key);
      result[camelCaseKey] = snackCaseToCamelCase(obj[key]);
    }
  }
  return result;
}

export function stringToBoolean(str: string) {
  return /^true$/i.test(str);
}

export function promiseState<T>(p: Promise<T>): Promise<string> {
  const t = {};
  return Promise.race([p, Promise.resolve(t)])
    .then((v) => (v === t) ? "pending" : "fulfilled")
    .catch(() => "rejected");
}

export async function deleteNonRunningPromises<T>(promises: Promise<T>[]) {
  for (let i = promises.length - 1; i >= 0; i--) {
    if ((await promiseState(promises[i])) !== "pending") {
      promises.splice(i, 1);
    }
  }
}