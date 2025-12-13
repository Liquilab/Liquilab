import type { GetServerSideProps } from 'next';

const FastForwardSuccessRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/fastforward/pay?status=success',
    permanent: false,
  },
});

export default FastForwardSuccessRedirect;
