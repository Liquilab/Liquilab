import type { GetServerSideProps } from 'next';

const BrandRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/',
    permanent: false,
  },
});

export default BrandRedirect;
