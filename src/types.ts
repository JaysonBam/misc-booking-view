export interface DurationCounts {
  [duration: string]: number;
}

export interface SlotAvailability {
  'open room': DurationCounts;
  'closed room': DurationCounts;
  'boardroom': DurationCounts;
}

export interface GridSlot {
  start: string;
  end: string;
  availability: SlotAvailability;
}

export interface Totals {
  'open room': number;
  'closed room': number;
  'boardroom': number;
}

export interface AvailabilityData {
  totals: Totals;
  grid: GridSlot[];
}
