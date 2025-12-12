import type { GetServerSideProps } from 'next';

const LoginRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/connect',
    permanent: false,
  },
});

export default LoginRedirect;
