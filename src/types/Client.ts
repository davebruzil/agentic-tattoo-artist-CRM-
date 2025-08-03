export interface Client {
  id: string;
  name: string;
  status: 'Consultation' | 'In Progress' | 'Booked' | 'Completed' | 'Canceled' | 'Consultation Scheduled';
  nextAppointment: string;
  phone: string;
  email: string;
  instagram?: string;
  tattooDescription: string;
  placement: string;
  size: string;
  budget: string;
}