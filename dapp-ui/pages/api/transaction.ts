import type { NextApiRequest, NextApiResponse } from 'next';
import HttpErrorHandler from '../../helpers/HttpError';
import { getRecords, saveRecord, updateRecord } from '../../helpers/store';
import { TransactionRecord } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  HttpErrorHandler(req, res, {
    getFn: async (query) => {
      const results = await getRecords(query, req);
      return results;
    },
    postFn: async (body) => {
      const param: TransactionRecord = {
        ...body,
        timestamp: new Date(),
      }

      const result = await saveRecord(param);
      return result;
    },
    putFn: async (body: TransactionRecord) => {
      const result = await updateRecord(body);
      return result;
    },
  });
}
