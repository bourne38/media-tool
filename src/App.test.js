import { render, screen } from '@testing-library/react';
import App from './App';

test('renders video processor app', () => {
  render(<App />);
  // Update to match actual content in your app
  const headerElement = screen.getByText(/VideoProcessor/i);
  expect(headerElement).toBeInTheDocument();
});

// Remove or update this test as "learn react" doesn't appear in your app
// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });
