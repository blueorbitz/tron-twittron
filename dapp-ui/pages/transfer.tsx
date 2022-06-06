import type { NextPage } from 'next';
import React from 'react';
import { ListGroup } from 'react-bootstrap';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import ColCenter from '../components/ColCenter';

const Transfer: NextPage = () => {
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
            <ListGroup.Item>Cras justo odio</ListGroup.Item>
            <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
            <ListGroup.Item>Morbi leo risus</ListGroup.Item>
            <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
            <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
          </ListGroup>
        </ColCenter>
      </div>
    </div>
  )
}

export default Transfer;
