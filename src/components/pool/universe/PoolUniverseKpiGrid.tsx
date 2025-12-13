import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function PoolUniverseKpiGrid({ children }: Props) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  );
}

