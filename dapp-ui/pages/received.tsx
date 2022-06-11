import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, ListGroup, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';
import { twitterHandle, timeSince, copyToClipboard, handleAddress, releaseFund } from '../helpers/utils';
import { TransactionRecord } from '../types';
import 'react-toastify/dist/ReactToastify.css'

const Received: NextPage = () => {
  const { data: session } = useSession();
  const [loadModal, setLoadModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [claimWallet, setClaimWallet] = useState('');

  const [skip, setSkip] = useState(0);
  const limit = 5;
  const [transactions, setTransactions] = useState([]);

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

    const txs = transactions.concat(data);
    setTransactions(txs);
  }

  const redeem = async (tx: TransactionRecord, index: number) => {
    try {
      const addressInHex = await handleAddress(twitterHandle(session));
      if (addressInHex === "410000000000000000000000000000000000000000")
        throw new Error("Handle not register in oracle!");

      const _claimWallet = window.tronWeb.address.fromHex(addressInHex);
      setClaimWallet(_claimWallet);

      setProcessing(true);
      setLoadModal(true);

      const claimTx = await releaseFund(tx.recieptId, twitterHandle(session));
      const param = {
        _id: tx._id,
        claimTx, claimWallet: _claimWallet,
      };
      await axios.put('/api/transaction', param);

      Object.assign(transactions[index], param);
      setTransactions(transactions);

    } catch (error: any) {
      console.error(error.message || error.error);
      toast.error(error.message || error.error);
    } finally {
      setProcessing(false);
      setLoadModal(false);
    }
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
          <h4 className="py-3">Received History</h4>
        </ColCenter>

        <ColCenter>
          <ListGroup>
            {
              transactions.map((tx: TransactionRecord, index: number) => {
                return (
                  <ListGroup.Item key={tx._id} className="d-flex flex-row gap-3 py-2">
                    <div className="d-flex gap-2 w-100 justify-content-between">
                      <div>
                        <h6 className="mb-0">
                          {`Received ${tx.amount} TRX from `}
                          <a href={`https://twitter.com/${tx.sender}`} rel="noreferrer" target="_blank">
                            <strong><i>{tx.sender}</i></strong>
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
                            tx.claimTx && <pre className="mb-0 d-inline-block text-truncate hash-display-width">
                              <Icon.Clipboard role="button" onClick={() => copyToClipboard(tx.txId)} />
                              <span>&nbsp;</span>
                              {'ClaimTx:' + tx.claimTx}
                            </pre>
                          }
                        </div>
                        <small className="opacity-50 text-nowrap">{timeSince(new Date(tx.timestamp)) + ' ago'}</small>
                      </div>
                      <OverlayTrigger placement='bottom' overlay={
                        <Tooltip id="tronLink-tooltip">
                          Redeem fund
                        </Tooltip>
                      }>
                        {
                          tx.claimTx
                            ? <Button disabled><Icon.CartCheckFill /></Button>
                            : <Button onClick={() => redeem(tx, index)}><Icon.Cart /></Button>
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
      <Modal
        show={loadModal}
        onHide={() => setLoadModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Release Fund</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Releasing the fund to the following wallet:</p>
          <pre>{claimWallet}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setLoadModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
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
