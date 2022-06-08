import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ListGroup } from 'react-bootstrap';
import axios from 'axios';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';
import { twitterId, timeSince } from '../helpers/utils';
import { TransactionRecord } from '../types';

const Transfer: NextPage = () => {
  const { data: session } = useSession();
  const [skip, setSkip] = useState(0);
  const limit = 5;
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    if (skip === -1) return;

    const params = {
      skip, limit,
      sender: twitterId(session),
    }
    const results = await axios.get('/api/transaction', { params });

    setSkip(skip + limit);
    return results.data;
  }

  const fetchNext = async () => {
    if (skip === -1) return;

    const data = await fetchData();
    if (data.length === 0)
      setSkip(-1)

    const trxs = transactions.concat(data);
    setTransactions(trxs);
  }

  useEffect(() => {
    (async function () {
      const data = await fetchData();
      setTransactions(data);
      console.log(data);
    })();
  }, [])

  return (
    <div className="container">
      <AppHeader />
      <AppNavbar />

      <div className="row">
        <ColCenter>
          <h4 className="py-3">Transfer History</h4>
        </ColCenter>

        <ColCenter>
          <ListGroup>
            {
              transactions.map((trx: TransactionRecord, index: number) => {
                const profileImg = trx.twitter.profile_image_url ?? "https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg";
                return (
                  <ListGroup.Item key={trx._id} className="d-flex flex-row gap-3 py-2">
                    <img src={profileImg} alt={trx.handle} width="32" height="32" className="rounded-circle flex-shrink-0" />
                    <div className="d-flex gap-2 w-100 justify-content-between">
                      <div>
                        <h6 className="mb-0">
                          {`${trx.amount} TRX to `}
                          <a href={`https://twitter.com/${trx.handle}`} rel="noreferrer" target="_blank">
                            <strong><i>{trx.handle}</i></strong>
                            {
                              <i className="bi bi-patch-check-fill text-primary mx-1"></i>
                            }
                          </a>
                        </h6>
                        <div className="mb-0 mt-1 opacity-75"><pre className='mb-0'>{trx._id}</pre></div>
                      </div>
                      <small className="opacity-50 text-nowrap">{timeSince(new Date(trx.timestamp)) + ' ago'}</small>
                    </div>
                  </ListGroup.Item>
                );
              })
            }
            {
              transactions.length === 0 || skip === -1 ? null :
                <ListGroup.Item key={"more"} className="d-flex flex-row gap-3 py-3" action onClick={fetchNext}>
                  <div className="d-flex gap-2 w-100 justify-content-center">
                    <small className="opacity-50 text-nowrap">more...</small>
                  </div>
                </ListGroup.Item>
            }
          </ListGroup>
        </ColCenter>
      </div>
    </div>
  )
}

export default Transfer;
