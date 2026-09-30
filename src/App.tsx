/**
 * Root Application Component
 * Wraps the app in Redux Provider and React Router BrowserRouter.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { removeToast, showToast } from './app/toastSlice';
import { Toast } from './package/UI';
import { AppRoutes } from './app/routes';

const GlobalToast: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  React.useEffect(() => {
    try {
      const pending = sessionStorage.getItem('cfs_pending_toast');
      if (pending) {
        sessionStorage.removeItem('cfs_pending_toast');
        const parsed = JSON.parse(pending);
        dispatch(showToast(parsed));
      }
    } catch {
      // ignore
    }
  }, [dispatch]);

  return (
    <Toast
      toasts={toasts}
      onDismiss={(id) => dispatch(removeToast(id))}
      position="top-right"
    />
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <GlobalToast />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
