import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <p className="font-tag text-sm text-gold-700">404</p>
      <h1 className="mt-2 font-display text-3xl font-800 text-cream">Page not found</h1>
      <p className="mt-3 text-ink-100">The page you're looking for doesn't exist.</p>
      <Button className="mt-6" as={Link} to="/">
        Back to home
      </Button>
    </div>
  );
}
