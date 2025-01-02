import { getContacts } from '../lib/db';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { UserCircleIcon, EnvelopeIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import '../src/app/globals.css';
export async function getServerSideProps() {
  const contacts = await getContacts();
  return { props: { contacts } };
}

export default function ContactsPage({ contacts }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const router = useRouter();

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      // Clear the form fields after successful addition
      setName('');
      setEmail('');
      router.replace(router.asPath);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditContact = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/contacts?id=${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      setEditingContact(null);
      setName('');
      setEmail('');
      router.replace(router.asPath);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await fetch(`/api/contacts?id=${id}`, {
        method: 'DELETE',
      });
      setShowDeleteModal(false);
      setContactToDelete(null);
      router.replace(router.asPath);
    } catch (error) {
      console.error(error);
    }
  };

  const openDeleteModal = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const startEdit = (contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setEmail(contact.email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Kontakter
        </h1>
        
        <form onSubmit={editingContact ? handleEditContact : handleAddContact} className="mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="mb-4">
            <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Namn
            </label>
            <input
              id="contact-name"
              required
              placeholder="Ange kontaktinformation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <EnvelopeIcon className="h-5 w-5 mr-2 text-indigo-500" />
              e-postadress
            </label>
            <input
              id="contact-email"
              required
              type="email"
              placeholder="Ange e-postadress"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
            />
          </div>
          <button type="submit" className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-xl">
            {editingContact ? (
              <>
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Uppdatera kontakt
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5 mr-2" />
                Lägg till kontakt
              </>
            )}
          </button>
          {editingContact && (
            <button
              type="button"
              onClick={() => {
                setEditingContact(null);
                setName('');
                setEmail('');
              }}
              className="mt-2 w-full px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Avbryt redigering
            </button>
          )}
        </form>

        <ul className="grid gap-4 md:grid-cols-2">
          {contacts?.map((contact) => (
            <li key={contact.id} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {contact.name.charAt(0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{contact.name}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    {contact.email}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(contact)}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(contact)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl mx-4 max-w-md w-full p-6 animate-modal-appear">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bekräfta borttagning</h3>
              <p className="mt-2 text-sm text-gray-500">
                Är du säker på att du vill ta bort kontakten {contactToDelete?.name}? Denna åtgärd kan inte ångras.
              </p>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Avbryt
              </button>
              <button
                onClick={() => handleDeleteContact(contactToDelete.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Ta bort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}