export type CollectionWindow = { id: string; label: string };

// Client-confirmed 2026-09-18: collection hours are 8am-5pm, one-hour windows.
export const collectionWindows: CollectionWindow[] = [
  { id: "08:00-09:00", label: "8:00 AM – 9:00 AM" },
  { id: "09:00-10:00", label: "9:00 AM – 10:00 AM" },
  { id: "10:00-11:00", label: "10:00 AM – 11:00 AM" },
  { id: "11:00-12:00", label: "11:00 AM – 12:00 PM" },
  { id: "12:00-13:00", label: "12:00 PM – 1:00 PM" },
  { id: "13:00-14:00", label: "1:00 PM – 2:00 PM" },
  { id: "14:00-15:00", label: "2:00 PM – 3:00 PM" },
  { id: "15:00-16:00", label: "3:00 PM – 4:00 PM" },
  { id: "16:00-17:00", label: "4:00 PM – 5:00 PM" },
];
