import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;

mockedAxios.get.mockResolvedValue({
  data: [
    { _id: '1', name: 'Test Burger', description: 'desc', price: 9.99, image: 'img.jpg' }
  ]
});

describe('App', () => {
  it('renders the navbar brand', async () => {
    const queryClient = new QueryClient();
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    );
    expect(await screen.findByText('🍽️ FoodieExpress')).toBeInTheDocument();
  });

  it('renders menu items from API', async () => {
    const queryClient = new QueryClient();
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    );
    expect(await screen.findByText('Test Burger')).toBeInTheDocument();
  });
});
