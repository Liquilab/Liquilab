import type { GetServerSideProps } from 'next';

const PortfolioRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/wallet',
    permanent: false,
  },
});

export default PortfolioRedirect;

