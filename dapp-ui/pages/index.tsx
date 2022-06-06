import type { NextPage } from 'next';
import React from 'react';
import { Button, Form } from 'react-bootstrap';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';
import { transferFund } from '../helpers/utils';

const Home: NextPage = () => {
  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      handle: { value: string };
      amount: { value: number };
      message: { value: boolean };
    };
    const handle = target.handle.value;
    const amount = target.amount.value;
    // const message = target.message.value;

    await transferFund(handle, amount);
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
            <Button variant="primary" type="submit">Transfer Token</Button>
          </Form>
        </ColCenter>
      </div>
    </div>
  )
}

export default Home;
