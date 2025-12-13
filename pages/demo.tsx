import type { GetServerSideProps } from 'next';

const DemoRedirect = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/',
    permanent: false,
  },
});

export default DemoRedirect;
