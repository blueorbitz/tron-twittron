import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, ListGroup, OverlayTrigger, Tooltip, Modal, Form } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';
import { twitterHandle, timeSince, copyToClipboard, handleAddress, releaseFund, updateHandleAddress } from '../helpers/utils';
import { TransactionRecord } from '../types';
import 'react-toastify/dist/ReactToastify.css'

const Received: NextPage = () => {
  const { data: session } = useSession();
  const [loadModal, setLoadModal] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
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

  const updateWallet = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const target = e.target as typeof e.target & {
        wallet: { value: string };
      };

      const wallet = target.wallet.value;
      
      if (wallet === claimWallet) 
        throw new Error("You're using the same wallet address!");

      // call to backend, due to owner call
      const res = await axios.post("/api/oracle", { wallet });
      console.log("oracle:", res);
      toast.success("Successfully updated wallet address");

    } catch (error: any) {
      console.error(error.message || error.error);
      toast.error(error.message || error.error);
    } finally {
      setProcessing(false);
      setWalletModal(false);
    }
  }

  useEffect(() => {
    (async function () {
      const data = await fetchData();
      setTransactions(data);
    })();
  }, [])

  useEffect(() => {
    (async function () {
      if (walletModal === false)
        return;

      const addressInHex = await handleAddress(twitterHandle(session));
      if (addressInHex !== "410000000000000000000000000000000000000000")
        setClaimWallet(window.tronWeb.address.fromHex(addressInHex));
    })();
  }, [walletModal]);

  return (
    <div className="container">
      <AppHeader />
      <AppNavbar />

      <div className="row">
        <ColCenter>
          <div className="d-flex  justify-content-between align-items-center">
            <h4 className="py-3">Received History</h4>
            <div>
              <Button onClick={() => setWalletModal(true)}>Set Wallet</Button>
            </div>
          </div>
        </ColCenter>

        <ColCenter>
          <ListGroup>
            {
              transactions.length !== 0 ? null :
                <p>No transaction record was found.</p>
            }
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
                          <div>
                            <pre className="mb-0 d-inline-block text-truncate hash-display-width">
                              <Icon.Clipboard role="button" onClick={() => copyToClipboard(tx.txId)} />
                              <span>&nbsp;</span>
                              {'TransId:' + tx.txId}
                            </pre>
                          </div>
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
                            : <Button disabled={processing} onClick={() => redeem(tx, index)}><Icon.Cart /></Button>
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
      <Modal
        show={walletModal}
        onHide={() => setWalletModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Link @{twitterHandle(session)} to wallet address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={updateWallet}>
            <Form.Group className="mb-3" controlId="wallet">
              <Form.Label>Wallet Address</Form.Label>
              <Form.Control type="text" placeholder={claimWallet} disabled={processing} />
              <Form.Text className="text-muted" style={{ display: claimWallet === '' ? 'none' : 'block'}}>
                Tron wallet has registered.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={processing}>{processing ? 'Updating Wallet...' : 'Update'}</Button>
          </Form>
        </Modal.Body>
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
