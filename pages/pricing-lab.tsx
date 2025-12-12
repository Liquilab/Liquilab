import type { GetServerSideProps } from 'next';

const PricingLabRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/pricing',
    permanent: false,
  },
});

export default PricingLabRedirect;
