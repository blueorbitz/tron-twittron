import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';
import AppHeader from '../components/AppHeader';
import { signIn, signOut, useSession } from 'next-auth/react';

const Login: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session)
      router.push('/');
  }, [session]);

  return (
    <div className={styles.body}>
      <AppHeader />
      <main className={styles.formSignin}>
        <form>
          <h1 className="mb-1 fw-normal">Twittron</h1>
          <p className="w-100 mb-3">Connect TRX with Twitter</p>
          {
            !session
              ? <button className="w-100 btn btn-lg btn-primary" onClick={() => signIn()}>Sign in to Twitter</button>
              : <>
                <button className="w-100 btn btn-lg btn-primary" onClick={() => signOut()}>Sign out from Twitter</button>
                Signed in as {session.user?.name} <br/>
              </>
          }
        </form>
      </main>
    </div>
  )
};

export default Login;
