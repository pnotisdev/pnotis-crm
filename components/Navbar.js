import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Pnotis CRM
        </Link>
        <div className="space-x-4">
          <Link href="/leads" className="hover:text-gray-300">
            Leads
          </Link>
          <Link href="/contacts" className="hover:text-gray-300">
            Contacts
          </Link>
          <Link href="/profile" className="hover:text-gray-300">
            Profile
          </Link>
          <button onClick={handleLogout} className="hover:text-gray-300">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
