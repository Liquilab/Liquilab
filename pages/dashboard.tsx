import type { GetServerSideProps } from 'next';

const DashboardRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/',
    permanent: false,
  },
});

export default DashboardRedirect;

