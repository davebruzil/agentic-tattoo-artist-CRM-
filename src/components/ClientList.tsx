import React, { useState, useEffect } from 'react';
import type { Client } from '../types/Client';
import { mockClients } from '../data/mockData';
import { fetchClientsFromSheets, deleteClientFromSheets } from '../services/googleSheets';
import ClientModal from './ClientModal';
import './ClientList.css';
import whatsappLogo from '../assets/whatsapp.png';

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectedClients, setRejectedClients] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<{show: boolean, client: Client | null}>({show: false, client: null});
  const [clientUpdates, setClientUpdates] = useState<Map<string, Partial<Client>>>(new Map());

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const sheetsData = await fetchClientsFromSheets();
      setClients(sheetsData || []);
    } catch (err) {
      console.error('Failed to load clients from Google Sheets:', err);
      setError('Failed to load clients. Please check your Google Sheets connection.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    
    // Set up polling to check for new clients every 30 seconds
    const interval = setInterval(loadClients, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const showDeleteConfirmation = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setConfirmDelete({show: true, client});
    }
  };

  const confirmRejectClient = async () => {
    if (confirmDelete.client) {
      try {
        // Option 1: Try to delete from Google Sheets (requires backend)
        // await deleteClientFromSheets(confirmDelete.client.id);
        
        // Option 2: For now, just hide locally until backend is implemented
        setRejectedClients(prev => new Set([...prev, confirmDelete.client!.id]));
        
        // Also close modal if this client was selected
        if (selectedClient?.id === confirmDelete.client.id) {
          setSelectedClient(null);
        }
        
        console.log('Client deleted locally. To delete from Google Sheets, implement backend API.');
      } catch (error) {
        console.error('Failed to delete client:', error);
        // Still remove locally even if sheets deletion fails
        setRejectedClients(prev => new Set([...prev, confirmDelete.client!.id]));
      }
    }
    setConfirmDelete({show: false, client: null});
  };

  const cancelRejectClient = () => {
    setConfirmDelete({show: false, client: null});
  };

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setClientUpdates(prev => {
      const newUpdates = new Map(prev);
      const existingUpdates = newUpdates.get(clientId) || {};
      newUpdates.set(clientId, { ...existingUpdates, ...updates });
      return newUpdates;
    });
  };

  const filteredClients = clients.map(client => {
    // Apply any local updates to the client
    const updates = clientUpdates.get(client.id);
    return updates ? { ...client, ...updates } : client;
  }).filter(client => {
    const isNotRejected = !rejectedClients.has(client.id);
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === '' || client.status === filterStatus;
    return isNotRejected && matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Consultation': return '#D4A574';
      case 'In Progress': return '#B85450';
      case 'Booked': return '#7A9B8E';
      case 'Completed': return '#6B8DBF';
      case 'Canceled': return '#999999';
      case 'Consultation Scheduled': return '#2D2D2D';
      default: return '#999999';
    }
  };

  return (
    <div className="client-list-container">
      <div className="header">
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-section">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-dropdown"
          >
            <option value="">Filter</option>
            <option value="Consultation">Consultation</option>
            <option value="In Progress">In Progress</option>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
            <option value="Consultation Scheduled">Consultation Scheduled</option>
          </select>
        </div>
      </div>

      <div className="clients-header">
        <h2>Clients</h2>
        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="loading-banner">Loading clients...</div>}
      </div>

      <div className="clients-list">
        {filteredClients.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No clients yet</h3>
            <p>Clients will appear here when they're added to your Google Sheets</p>
          </div>
        ) : (
          filteredClients.map((client) => (
          <div 
            key={client.id} 
            className="client-item"
            onClick={() => setSelectedClient(client)}
          >
            <div className="client-avatar">
              <div className="avatar-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#9aa0a6"/>
                </svg>
              </div>
            </div>
            
            <div className="client-info">
              <div className="client-name">{client.name}</div>
              {client.tattooDescription && (
                <div className="client-description">{client.tattooDescription}</div>
              )}
              <div className="client-status-row">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(client.status) }}
                >
                  {client.status}
                </span>
                {client.nextAppointment && (
                  <span className="appointment-time">{client.nextAppointment}</span>
                )}
              </div>
            </div>

            <div className="client-actions">
              <button 
                className="action-btn phone"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${client.phone}`, '_self');
                }}
              >
                ☎️
              </button>
              <button 
                className="action-btn whatsapp"
                onClick={(e) => {
                  e.stopPropagation();
                  const phoneNumber = client.phone.replace(/[^\d]/g, '');
                  window.open(`https://wa.me/1${phoneNumber}`, '_blank');
                }}
              >
                <img src={whatsappLogo} alt="WhatsApp" width="20" height="20" />
              </button>
              <button 
                className="action-btn reject"
                onClick={(e) => {
                  e.stopPropagation();
                  showDeleteConfirmation(client.id);
                }}
                title="Reject client"
              >
                🗑️
              </button>
            </div>
          </div>
          ))
        )}
      </div>

      {selectedClient && (
        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onReject={showDeleteConfirmation}
          onUpdate={updateClient}
        />
      )}

      {confirmDelete.show && confirmDelete.client && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h3>Delete Client</h3>
            </div>
            <div className="confirmation-body">
              <div className="warning-icon">⚠️</div>
              <p>Are you sure you want to delete</p>
              <p className="client-name-highlight">{confirmDelete.client.name}?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="cancel-btn"
                onClick={cancelRejectClient}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={confirmRejectClient}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;