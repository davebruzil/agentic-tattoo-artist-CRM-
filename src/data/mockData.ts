import type { Client } from '../types/Client';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Emma Richardson',
    status: 'Consultation',
    nextAppointment: '02/25/2024 17:00',
    phone: '(555) 123-4567',
    email: 'emma.richardson@email.com',
    instagram: '@emma_art',
    tattooDescription: 'Looking for a delicate fine line botanical piece featuring wildflowers and vines. Wants something that flows naturally with the body\'s curves. Interested in incorporating birth flowers - peonies and lavender. Prefers minimal shading with emphasis on clean, precise linework.',
    placement: 'Forearm',
    size: 'Medium',
    budget: '$800-1200'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    status: 'In Progress',
    nextAppointment: '02/21/2024 15:00',
    phone: '(555) 234-5678',
    email: 'marcus.chen@email.com',
    tattooDescription: 'Traditional Japanese sleeve with koi fish and cherry blossoms.',
    placement: 'Left Arm',
    size: 'Large',
    budget: '$2000-3000'
  },
  {
    id: '3',
    name: 'Sofia Martinez',
    status: 'Booked',
    nextAppointment: '03/14/2024 13:00',
    phone: '(555) 345-6789',
    email: 'sofia.martinez@email.com',
    tattooDescription: 'Minimalist geometric design with sacred geometry elements.',
    placement: 'Back',
    size: 'Small',
    budget: '$400-600'
  },
  {
    id: '4',
    name: 'Jake Thompson',
    status: 'In Progress',
    nextAppointment: '',
    phone: '(555) 456-7890',
    email: 'jake.thompson@email.com',
    tattooDescription: 'Portrait of deceased pet with memorial elements.',
    placement: 'Chest',
    size: 'Medium',
    budget: '$1000-1500'
  },
  {
    id: '5',
    name: 'Lily Anderson',
    status: 'Completed',
    nextAppointment: '02/09/2024 12:00',
    phone: '(555) 567-8901',
    email: 'lily.anderson@email.com',
    tattooDescription: 'Watercolor butterfly design with soft pastels.',
    placement: 'Shoulder',
    size: 'Small',
    budget: '$300-500'
  },
  {
    id: '6',
    name: 'Elliot Foster',
    status: 'Canceled',
    nextAppointment: '12/30/2023 16:45',
    phone: '(555) 678-9012',
    email: 'elliot.foster@email.com',
    tattooDescription: 'Celtic knot armband design.',
    placement: 'Upper Arm',
    size: 'Medium',
    budget: '$600-800'
  },
  {
    id: '7',
    name: 'Emma Richardson',
    status: 'Consultation Scheduled',
    nextAppointment: '01/15/2024 16:00',
    phone: '(555) 123-4567',
    email: 'emma.richardson@email.com',
    instagram: '@emma_art',
    tattooDescription: 'Follow-up consultation for additional work.',
    placement: 'Wrist',
    size: 'Small',
    budget: '$200-400'
  }
];