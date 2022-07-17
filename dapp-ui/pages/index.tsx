import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';
import { transferFund, extractErrorMessage, debounce } from '../helpers/utils';
import useTronWeb from '../helpers/useTronWeb';
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link';

const solidityNode: string = process.env.SOLIDITY_NODE || '';

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [processing, setProcessing] = useState(false);
  const tron = useTronWeb();

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const target = e.target as typeof e.target & {
        handle: { value: string };
        amount: { value: number };
        message: { checked: boolean };
      };

      const handle = target.handle.value;
      const amount = target.amount.value;
      const sendDm = target.message.checked;

      const txId = await transferFund(handle, amount);

      const param = {
        handle, amount, txId, recieptId: -1,
        // @ts-ignore
        sender: session.user && session.user.twitterHandle,
        senderWallet: tron.address,
      };

      await axios.post('/api/transaction', param);
      if (sendDm)
        await axios.post('/api/twitter', param);

      toast.success('transferFund successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(extractErrorMessage(error));
    } finally {
      setProcessing(false);
    }
  };

  const onChangeContractAddress = debounce(async function (e) {
    const contractAddress = e.target.value;
    await tron.trc20.setContractAddress(contractAddress);
    return;
  });

  return (
    <div className="container">
      <AppHeader />
      <AppNavbar />
      <div className="row py-3">
        <ColCenter>
          <h4>Transfer Trx token to a Twitter handle.</h4>
          <p>If you're new here. Please setup your <Link href="https://www.tronlink.org">TronLink</Link> for the browser extension.</p>
          <p>Your token transfer is safe with us. Token transfer will be stored in the smart-contract vault if the user has not registered their wallet with us.</p>
        </ColCenter>

        <ColCenter>
          <Form onSubmit={onSubmit}>

            <Form.Group className="mb-3" controlId="handle">
              <Form.Label>Twitter @handle</Form.Label>
              <Form.Control type="text" placeholder="@username" disabled={processing} required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="trc20">
              <Form.Label>TRC20 Contract Address</Form.Label>
              <Form.Control type="text" placeholder="leave black to transfer TRX" disabled={processing} onChange={onChangeContractAddress} />
              {
                tron.trc20.error === ''
                  ? null
                  : <Form.Text className="text-danger">{tron.trc20.error}</Form.Text>
              }
            </Form.Group>

            <Form.Group className="mb-3" controlId="amount">
              <Form.Label>Amount in {tron.trc20.symbol || 'TRX'}</Form.Label>
              <Form.Control type="number" disabled={processing} required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="message">
              <Form.Check type="checkbox" label="Direct message to Twitter" disabled={processing} />
            </Form.Group>
            {
              tron.isConnect
                ? <Button variant="primary" type="submit" disabled={processing}>{processing ? 'Processing Transaction…' : 'Transfer Token'}</Button>
                : <>
                  <Button variant="danger" type="submit" disabled>Wallet not connected</Button>
                  <p className="text-muted">Supported node: {solidityNode}.</p>
                </>
            }
          </Form>
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

export default Home;
