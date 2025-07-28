import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './rtl.css';
import 'react-datepicker/dist/react-datepicker.css';
import { store, persistor } from './app/store';
import { PersistGate } from 'redux-persist/integration/react';



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><Provider store={store}>
    <I18nextProvider i18n={i18n}>
     <PersistGate loading={null} persistor={persistor}>
      <App />
      </PersistGate>
  </I18nextProvider>  </Provider>
  </React.StrictMode>
);