export interface Senior {
  id: string
  name: string
  address: string
  phone: string
  dietaryRestrictions: string[]
  specialNotes: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  deliveryHistory: {
    date: string
    status: "completed" | "missed" | "rescheduled"
    notes?: string
  }[]
  isDelivered: boolean
  photo?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "volunteer" | "admin"
}

export const mockSeniors: Senior[] = [
  {
    id: "1",
    name: "Mrs. Eleanor Johnson",
    address: "123 Oak Street, Apt 2A",
    phone: "(555) 123-4567",
    dietaryRestrictions: ["Low sodium"],
    specialNotes: "Ring doorbell twice. Hard of hearing.",
    emergencyContact: {
      name: "Sarah Johnson",
      phone: "(555) 987-6543",
      relationship: "Daughter",
    },
    deliveryHistory: [
      { date: "2024-11-15", status: "completed", notes: "Delivered successfully" },
      { date: "2024-10-15", status: "completed" },
      { date: "2024-09-15", status: "completed" },
    ],
    isDelivered: false,
  },
  {
    id: "2",
    name: "Mr. Robert Smith",
    address: "456 Pine Avenue, Unit 5B",
    phone: "(555) 234-5678",
    dietaryRestrictions: ["Diabetic"],
    specialNotes: "Prefers morning deliveries before 10 AM.",
    emergencyContact: {
      name: "Maria Rodriguez",
      phone: "(555) 876-5432",
      relationship: "Neighbor",
    },
    deliveryHistory: [
      { date: "2024-11-15", status: "completed" },
      { date: "2024-10-15", status: "missed", notes: "Not home" },
      { date: "2024-09-15", status: "completed" },
    ],
    isDelivered: true,
  },
  {
    id: "3",
    name: "Mrs. Leah Shah",
    address: "789 Elm Drive, House",
    phone: "(555) 345-6789",
    dietaryRestrictions: ["Vegetarian"],
    specialNotes: "Very friendly and appreciative. Enjoys brief conversations.",
    emergencyContact: {
      name: "Dr. Patel",
      phone: "(555) 765-4321",
      relationship: "Family Doctor",
    },
    deliveryHistory: [
      { date: "2024-11-15", status: "completed" },
      { date: "2024-10-15", status: "completed" },
      { date: "2024-09-15", status: "completed" },
    ],
    isDelivered: true,
  },
  {
    id: "4",
    name: "Mr. Carlos Rodriguez",
    address: "321 Maple Lane, Apt 1A",
    phone: "(555) 456-7890",
    dietaryRestrictions: [],
    specialNotes: "Apartment entrance code: #1234",
    emergencyContact: {
      name: "Isabella Rodriguez",
      phone: "(555) 654-3210",
      relationship: "Granddaughter",
    },
    deliveryHistory: [
      { date: "2024-11-15", status: "completed" },
      { date: "2024-10-15", status: "completed" },
      { date: "2024-09-15", status: "rescheduled" },
    ],
    isDelivered: false,
  },
  {
    id: "5",
    name: "Mrs. Amy Chen",
    address: "654 Birch Road, Unit 3C",
    phone: "(555) 567-8901",
    dietaryRestrictions: ["Gluten-free"],
    specialNotes: "Leave at door if no answer. Usually home in afternoons.",
    emergencyContact: {
      name: "David Chen",
      phone: "(555) 543-2109",
      relationship: "Son",
    },
    deliveryHistory: [
      { date: "2024-11-15", status: "completed" },
      { date: "2024-10-15", status: "completed" },
      { date: "2024-09-15", status: "completed" },
    ],
    isDelivered: false,
  },
]

export const mockUser: User = {
  id: "1",
  name: "Sarah Ahmed",
  email: "sarah@salamfoodpantry.org",
  role: "volunteer",
}

export const mockAdminUser: User = {
  id: "2",
  name: "Admin User",
  email: "admin@salamfoodpantry.org",
  role: "admin",
}
