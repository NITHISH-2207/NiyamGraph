import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
};
