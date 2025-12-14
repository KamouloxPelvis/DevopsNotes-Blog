import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function PageLayout({ children }: Props) {
  return (
    <>{children}</>
  );
}

export {}