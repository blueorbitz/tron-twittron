import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';
import { twitterHandle, timeSince, copyToClipboard } from '../helpers/utils';
import { TransactionRecord } from '../types';
import 'react-toastify/dist/ReactToastify.css'

const Received: NextPage = () => {
  const { data: session } = useSession();
  const [skip, setSkip] = useState(0);
  const limit = 5;
  const [transactions, setTransactions] = useState([]);
  console.log(session)

  const fetchData = async () => {
    if (skip === -1) return;

    const params = {
      skip, limit,
      handle: twitterHandle(session),
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

  const redeem = async (trx) => {

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
          <h4 className="py-3">Received History</h4>
        </ColCenter>

        <ColCenter>
          <ListGroup>
            {
              transactions.map((trx: TransactionRecord, index: number) => {
                return (
                  <ListGroup.Item key={trx._id} className="d-flex flex-row gap-3 py-2">
                    <div className="d-flex gap-2 w-100 justify-content-between">
                      <div>
                        <h6 className="mb-0">
                          {`Received ${trx.amount} TRX from `}
                          <a href={`https://twitter.com/${trx.sender}`} rel="noreferrer" target="_blank">
                            <strong><i>{trx.sender}</i></strong>
                            {
                              <i className="bi bi-patch-check-fill text-primary mx-1"></i>
                            }
                          </a>
                        </h6>
                        <div className="mb-0 mt-1 opacity-75">
                          <pre className="mb-0 d-inline-block text-truncate hash-display-width">
                            <Icon.Clipboard role="button" onClick={() => copyToClipboard(trx.trxId)} />
                            <span>&nbsp;</span>
                            {'TransId:' + trx.trxId}
                          </pre>
                        </div>
                        <small className="opacity-50 text-nowrap">{timeSince(new Date(trx.timestamp)) + ' ago'}</small>
                      </div>
                      <OverlayTrigger placement='bottom' overlay={
                        <Tooltip id="tronLink-tooltip">
                          Redeem fund
                        </Tooltip>
                      }>
                        {
                          trx.claimTrx
                            ? <Button disabled><Icon.CartCheckFill /></Button>
                            : <Button onClick={() => redeem(trx)}><Icon.Cart /></Button>
                        }
                      </OverlayTrigger>
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
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        pauseOnHover
      />
    </div>
  )
}

export default Received;
