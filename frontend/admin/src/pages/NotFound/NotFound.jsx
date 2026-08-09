import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <p className="font-tag text-sm text-gold-700">404</p>
      <h1 className="mt-2 font-display text-3xl font-800 text-ink-900">Page not found</h1>
      <Button className="mt-6" as={Link} to="/">
        Back to dashboard
      </Button>
    </div>
  );
}
