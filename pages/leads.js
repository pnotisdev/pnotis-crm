import { getLeads, getContacts, getLeadStats } from '../lib/db';
import { useState } from 'react';
import { UserCircleIcon, PlusIcon, TrashIcon, PencilIcon, ChevronDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import '../src/app/globals.css';

export async function getServerSideProps() {
  const [leads, contacts, stats] = await Promise.all([
    getLeads(),
    getContacts(),
    getLeadStats()
  ]);
  return { props: { leads, contacts, stats } };
}

export default function LeadsPage({ leads: initialLeads, contacts, stats }) {
  const [leads, setLeads] = useState(initialLeads);
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    status: '',
    company: '',
    phone: '',
    area: '',
    notes: '',
    contact_id: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formVisible, setFormVisible] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const leadsPerPage = 10;

  const statusColors = {
    'Ny': 'bg-blue-100 text-blue-800',
    'Pågående': 'bg-yellow-100 text-yellow-800',
    'Kvalificerad': 'bg-green-100 text-green-800',
    'Förlorad': 'bg-red-100 text-red-800'
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      email: '',
      status: '',
      company: '',
      phone: '',
      area: '',
      notes: '',
      contact_id: ''
    });
    setEditingId(null);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingId 
        ? `/api/leads?id=${editingId}`
        : '/api/leads';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save lead');
      
      const savedLead = await response.json();
      
      setLeads(prev => 
        editingId 
          ? prev.map(lead => lead.id === editingId ? savedLead : lead)
          : [...prev, savedLead]
      );
      
      resetForm();
    } catch (error) {
      console.error(error);
      alert('Failed to save lead');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete lead');
      
      setLeads(leads.filter(lead => lead.id !== id));
      setShowDeleteModal(false);
      setLeadToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Failed to delete lead');
    }
  }

  const openDeleteModal = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  function handleEdit(lead) {
    setFormData(lead);
    setEditingId(lead.id);
    setFormVisible(true);
  }

  const filteredLeads = leads.filter(lead => 
    lead.title.toLowerCase().includes(filter.toLowerCase()) ||
    lead.status.toLowerCase().includes(filter.toLowerCase())
  );

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const StatCard = ({ title, value, color }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard title="Totala leads" value={stats.total} color="text-indigo-600" />
        <StatCard title="Öppna leads" value={stats.open} color="text-green-600" />
        <StatCard title="Förlorade leads" value={stats.closed} color="text-purple-600" />
      </div>

      <div className="flex gap-6">
        <div className="w-3/4">
          <h1 className="text-4xl font-extrabold mb-8 text-left bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Leads
          </h1>
          
          <input
            type="text"
            placeholder="Filter leads"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-4 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
          />

          <div className="overflow-x-auto">
            <table className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Namn</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">E-postadress</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Företag</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telefonnummer</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stad</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Skapad</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Anteckningar</th>
                  <th className="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a href={`mailto:${lead.email}`} className="flex items-center text-indigo-600 hover:text-indigo-900">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.area}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.created_at}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(lead)} className="text-indigo-600 hover:text-indigo-900 mr-2"><PencilIcon className="h-5 w-5" /></button>
                      <button onClick={() => openDeleteModal(lead)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Föregående</button>
            <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastLead >= filteredLeads.length} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Nästa</button>
          </div>
        </div>

        <div className="w-1/4">
          <button
            onClick={() => setFormVisible(!formVisible)}
            className="w-full mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            {formVisible ? 'Göm formulär' : 'Visa formulär'}
          </button>

          {formVisible && (
            <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-xl sticky top-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700">Namn</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Ange namn för lead"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">E-postadress</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700">Status</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-gray-900"
                    >
                      <option value="">Select status</option>
                      <option value="Ny">Ny</option>
                      <option value="Pågående">Pågående</option>
                      <option value="Kvalificerad">Kvalificerad</option>
                      <option value="Förlorad">Förlorad</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-700">Företag</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Ange företagsnamn"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">Telefonnummer</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ange telefonnummer"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="area" className="block text-sm font-semibold text-gray-700">Stad</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Ange stad"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">Anteckningar</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Ange eventuella ytterligare anteckningar"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor="contact_id" className="block text-sm font-semibold text-gray-700">Associated Contact</label>
                  <select
                    name="contact_id"
                    value={formData.contact_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingId ? 'Updatera lead' : 'Skapa lead')}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl mx-4 max-w-md w-full p-6 animate-modal-appear">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bekräfta borttagning</h3>
              <p className="mt-2 text-sm text-gray-500">
                Är du säker på att du vill ta bort din lead {leadToDelete?.title}? Denna åtgärd kan inte ångras.
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
                onClick={() => handleDelete(leadToDelete.id)}
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