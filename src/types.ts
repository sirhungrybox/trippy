export interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
  coverEmoji: string
  countries: string[]
  ownerId: string
  ownerName: string
  ownerPhoto: string
}

export interface TripData {
  meta: Trip
  days: TripDay[]
  budget: BudgetItem[]
  checklist: ChecklistItem[]
  flights: Flight[]
}

export interface TripDay {
  id: string
  date: string
  title: string
  location: string
  countryEmoji: string
  activities: Activity[]
  accommodation: string
  notes: string
}

export interface Activity {
  id: string
  time: string
  description: string
  done: boolean
}

export interface Flight {
  id: string
  airline: string
  flightNumber: string
  depCode: string
  depTime: string
  depDate: string
  arrCode: string
  arrTime: string
  arrDate: string
}

export interface BudgetItem {
  id: string
  category: string
  name: string
  amount: number
  currency: string
  paid: boolean
  notes: string
}

export interface ChecklistItem {
  id: string
  group: string
  text: string
  checked: boolean
}

export type Tab = 'overview' | 'itinerary' | 'budget' | 'checklist'
