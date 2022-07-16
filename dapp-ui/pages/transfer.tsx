import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';
import { twitterHandle, timeSince, copyToClipboard } from '../helpers/utils';
import { TransactionRecord } from '../types';
import 'react-toastify/dist/ReactToastify.css';

const Transfer: NextPage = () => {
  const { data: session } = useSession();
  const [skip, setSkip] = useState(0);
  const limit = 5;
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    if (skip === -1) return;

    const params = {
      skip, limit,
      sender: twitterHandle(session),
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

    const txs = transactions.concat(data);
    setTransactions(txs);
  }

  useEffect(() => {
    (async function () {
      const data = await fetchData();
      setTransactions(data);
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
              transactions.length !== 0 ? null :
                <p>No transaction record was found.</p>
            }
            {
              transactions.map((tx: TransactionRecord, index: number) => {
                const profileImg = tx.twitter.profile_image_url ?? "https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg";
                return (
                  <ListGroup.Item key={tx._id} className="d-flex flex-row gap-3 py-2">
                    <img src={profileImg} alt={tx.handle} width="32" height="32" className="rounded-circle flex-shrink-0" />
                    <div className="d-flex gap-2 w-100 justify-content-between">
                      <div>
                        <h6 className="mb-0">
                          {
                            tx.claimTx && <React.Fragment>
                              <OverlayTrigger placement='bottom' overlay={
                                <Tooltip id="tronLink-tooltip">
                                  Fund has been claimed.
                                </Tooltip>
                              }>
                                <Icon.CheckCircle />
                              </OverlayTrigger>
                              <span>&nbsp;</span>
                            </React.Fragment>
                          }
                          {`${tx.amount} TRX to `}
                          <a href={`https://twitter.com/${tx.handle}`} rel="noreferrer" target="_blank">
                            <strong><i>{tx.handle}</i></strong>
                            {
                              <i className="bi bi-patch-check-fill text-primary mx-1"></i>
                            }
                          </a>
                        </h6>
                        <div className="mb-0 mt-1 opacity-75">
                          <pre className="mb-0 d-inline-block text-truncate hash-display-width">
                            <Icon.Clipboard role="button" onClick={() => copyToClipboard(tx.txId)} />
                            <span>&nbsp;</span>
                            {'TransId:' + tx.txId}
                          </pre>
                          {
                            tx.claimTx && <div>
                              <pre className="mb-0 d-inline-block text-truncate hash-display-width">
                                <Icon.Clipboard role="button" onClick={() => copyToClipboard(tx.txId)} />
                                <span>&nbsp;</span>
                                {'ClaimTx:' + tx.claimTx}
                              </pre>
                            </div>
                          }
                        </div>
                      </div>
                      <small className="opacity-50 text-nowrap">{timeSince(new Date(tx.timestamp)) + ' ago'}</small>
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

export default Transfer;
