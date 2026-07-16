-- The "Post a Gig" form (Section 5.1 wireframe) collects date, time window,
-- act type, and notes — no separate title. Make title optional and add a
-- dedicated time_window column instead of overloading description with it.
alter table gigs alter column title drop not null;
alter table gigs add column time_window text;
