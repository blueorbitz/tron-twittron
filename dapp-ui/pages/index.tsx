import type { NextPage } from 'next';
import React from 'react';
import { Button, Form } from 'react-bootstrap';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';

const Home: NextPage = () => {
  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      handle: { value: string };
      amount: { value: number };
      message: { value: boolean };
    };
    const handle = target.handle.value; // typechecks!
    const amount = target.amount.value; // typechecks!
    const message = target.message.value; // typechecks!
    console.log(handle, amount, message);
  };

  return (
    <div className="container">
      <AppHeader />
      <AppNavbar />
      <div className="row py-3">
        <div className="col-2" />
        <div className="col-8">
          <h4>Transfer Trx token to a Twitter handle.</h4>
          <p>Your token transfer is safe with us. Token transfer will be stored in the smart-contract vault if the user has not registered their wallet with us.</p>
        </div>
        <div className="col-2" />

        <div className="col-2" />
        <div className="col-8">
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
        </div>
        <div className="col-2" />
      </div>
    </div>
  )
}

export default Home;
