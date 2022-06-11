import HttpErrorHandler from '../../helpers/HttpError';
import { getRecords, saveRecord, updateRecord } from '../../helpers/store';

export default async function handler(req, res) {
  HttpErrorHandler(req, res, {
    getFn: async (query) => {
      const results = await getRecords(query, req);
      return results;
    },
    postFn: async (body) => {
      const param = {
        ...body,
        timestamp: new Date(),
      }

      const result = await saveRecord(param);
      return result;
    },
    putFn: async (body) => {
      const result = await updateRecord(body);
      return result;
    },
  });
}
