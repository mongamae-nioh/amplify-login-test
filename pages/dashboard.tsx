import { GetStaticPropsContext, InferGetStaticPropsType, NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Amplify, { Auth } from 'aws-amplify';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import { CognitoUserInterface, onAuthUIStateChange, AuthState } from '@aws-amplify/ui-components';
import awsconfig from '../src/aws-exports';
import styles from '../styles/Home.module.css';
import { Path } from '../src/constants';

Amplify.configure(awsconfig);

type Props = InferGetStaticPropsType<typeof getStaticProps>;

const DashboardPage: NextPage<Props> = (props: Props) => {
  const router = useRouter();
  const [user, setUser] = useState<CognitoUserInterface | undefined>();

  useEffect(() => {
    router.prefetch(Path.Index);
    (async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
      } catch (error) {
        // 未認証の場合The user is not authenticatedが発生する
        router.replace(Path.Index);
      }
    })();
    return onAuthUIStateChange((nextAuthState, authData) => {
      if (nextAuthState === AuthState.SignedOut) {
        router.replace(Path.Index);
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>{props.pageTitle}</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>{props.pageTitle}</h1>
        <div className={styles.description}>
          <div>Hello, {user && user.username}</div>
          <div>It&#39;s {props.nowDate}.</div>
        </div>
        <AmplifySignOut />
      </main>
    </div>
  );
};

export default DashboardPage;

export const getStaticProps = async (context: GetStaticPropsContext) => {
  return {
    props: {
      nowDate: new Date().toLocaleString(),
      pageTitle: 'Dashboard',
    },
  };
};