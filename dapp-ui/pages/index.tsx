import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';
import { transferFund, walletAddress } from '../helpers/utils';
import 'react-toastify/dist/ReactToastify.css'

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [loadModal, setLoadModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const onSubmit = async (e: React.SyntheticEvent) => {
    try {
      e.preventDefault();
      const target = e.target as typeof e.target & {
        handle: { value: string };
        amount: { value: number };
        message: { value: boolean };
      };

      const handle = target.handle.value;
      const amount = target.amount.value;
      // const message = target.message.value;

      setProcessing(true);
      setLoadModal(true);

      const trxId = await transferFund(handle, amount);
      console.log('TrxId', trxId);

      await axios.post('/api/transaction', {
        handle, amount, trxId,
        // @ts-ignore
        sender: session.user && session.user.twitterId,
        senderWallet: walletAddress(),
      });

      toast.success('transferFund successfully!');
    } catch (error: any) {
      console.error(error.message || error.error);
      toast.error(error.message || error.error);
    } finally {
      setProcessing(false);
      setLoadModal(false);
    }
  };

  return (
    <div className="container">
      <AppHeader />
      <AppNavbar />
      <div className="row py-3">
        <ColCenter>
          <h4>Transfer Trx token to a Twitter handle.</h4>
          <p>Your token transfer is safe with us. Token transfer will be stored in the smart-contract vault if the user has not registered their wallet with us.</p>
        </ColCenter>

        <ColCenter>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="handle">
              <Form.Label>Twitter @handle</Form.Label>
              <Form.Control type="text" placeholder="@username" />
              <Form.Text className="text-muted">
                Invalid handle name
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="amount">
              <Form.Label>Amount (in Trx)</Form.Label>
              <Form.Control type="number" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="message">
              <Form.Check type="checkbox" label="Direct message to Twitter" />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={processing}>Transfer Token</Button>
          </Form>
        </ColCenter>
      </div>
      <Modal
        show={loadModal}
        onHide={() => setLoadModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Processing Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please wait, we are connecting with your Installed TronLink for processing.
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

export default Home;
