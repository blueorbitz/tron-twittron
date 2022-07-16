import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar, Nav, Container, NavDropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { signOut, useSession } from 'next-auth/react';
import useTronWeb from '../helpers/useTronWeb';
import { useEffect, useState } from 'react';

export default function AppHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const tron = useTronWeb();

  const user = (session && session.user) || {};

  const onSignOut = async () => {
    await signOut();
    router.push({ pathname: '/login' });
  }

  return (
    <Navbar>
      <Container fluid>
        <Link href="/" passHref>
          <Navbar.Brand>Twittron</Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="navbarScroll" />

        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
            <Link href="/transfer" passHref>
              <Nav.Link>Transfer</Nav.Link>
            </Link>
            <Link href="/received" passHref>
              <Nav.Link>Received</Nav.Link>
            </Link>
            <Nav.Link href="#action3" disabled>Wallet</Nav.Link>
            <Nav.Link href="#">
              <OverlayTrigger placement='bottom' overlay={
                <Tooltip id="tronLink-tooltip">
                  TronLink is <strong>{tron.isConnect ? "connected" : "not connected"}</strong>.
                  {
                    tron.isConnect
                      ? null
                      : (<><br />Connect to <strong>Nile testnet</strong></>)
                  }
                </Tooltip>
              }>
                <div className={tron.isConnect ? "text-success" : "text-danger"}>TronLink</div>
              </OverlayTrigger>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <NavDropdown title={user.name} id="navbarScrollingDropdown" align="end">
          {/* <NavDropdown.Item href="#action3">Connect Wallet</NavDropdown.Item> */}
          {/* <NavDropdown.Divider /> */}
          <NavDropdown.Item onClick={onSignOut}>
            Sign out from Twitter
          </NavDropdown.Item>
        </NavDropdown>
      </Container>
    </Navbar>
  );
}