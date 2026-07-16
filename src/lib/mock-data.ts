// Placeholder content for UI development. Replaced by real Supabase queries
// in later build phases (see plan: Discovery/Booking/Admin phases).

export const mockPerformers = [
  { id: "p1042", name: "Aanya Kapoor", meta: "Acoustic · 1.2 km away", chip: "★ 4.8 acoustic", verified: true },
  { id: "p1043", name: "Kabir Sen", meta: "Comedy · 2.4 km away", chip: "★ 4.9 comedy", verified: true },
  { id: "p1044", name: "Meher Rao", meta: "Poetry · 800 m away", chip: "★ 5.0 poetry", verified: true },
  { id: "p1045", name: "Ishaan Vora", meta: "Music · first stage", chip: "first stage", verified: false },
  { id: "p1046", name: "Riya Malhotra", meta: "Music · 3.1 km away", chip: "★ 4.7 music", verified: true },
];

export const mockVenues = [
  { id: "v2087", name: "The Wren Cafe", meta: "Delhi region", chip: "Fri, 7pm" },
  { id: "v2088", name: "Brew & Verse", meta: "Delhi region", chip: "Sat, 6pm" },
  { id: "v2089", name: "Late Hour Cafe", meta: "Delhi region", chip: "Sun, 8pm" },
];

export const mockGigs = [
  {
    id: "g501",
    venueId: "v2087",
    venueName: "The Wren Cafe",
    title: "Open mic, Saturday 7pm",
    subtitle: "Looking for acoustic or spoken word",
    verified: true,
  },
  {
    id: "g502",
    venueId: "v2088",
    venueName: "Brew & Verse",
    title: "First-timer open night",
    subtitle: "Any act type welcome, 6pm to 8pm",
    verified: true,
  },
];

export const mockBookings = [
  { id: "b1", title: "The Wren Cafe, Fri 7pm", status: "requested" as const, meta: "Sent 2 days ago" },
  { id: "b2", title: "Brew & Verse, Sat 6pm", status: "accepted" as const, meta: "Awaiting confirmation" },
  { id: "b3", title: "Late Hour Cafe, last week", status: "completed" as const, meta: "Leave feedback" },
];

export const mockVerificationQueue = [
  { id: "vq1", name: "Aanya Kapoor", type: "Performer", note: "Proof of work submitted" },
  { id: "vq2", name: "The Wren Cafe", type: "Venue", note: "Business proof submitted" },
];
