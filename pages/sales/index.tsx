import type { GetServerSideProps } from 'next';

const SalesRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/sales/offer',
    permanent: false,
  },
});

export default SalesRedirect;






