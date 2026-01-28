# OPD-Token-Allocation-Engine
OPD Token Allocation Engine
Overview
This project implements a backend OPD (Outpatient Department) token allocation engine for a hospital.
The system manages doctor schedules, allocates patient tokens across fixed time slots, enforces priority rules, and dynamically reallocates slots on cancellations and emergencies.
The solution is intentionally kept simple, deterministic, and explainable, while still modeling realistic hospital workflows.
Problem Understanding
Hospitals face challenges in OPD scheduling due to:
Fixed doctor availability
Limited consultation capacity per hour
Multiple patient entry sources with different priorities
Emergency patients who must be accommodated immediately
Cancellations and no-shows that should not waste capacity
The goal is to design a system that:
Allocates OPD tokens fairly and predictably
Honors medical and business priorities
Adapts dynamically during the day
System Design Overview
Core Entities
Doctor
Owns multiple fixed hourly time slots
TimeSlot
Represents a 1-hour window
Has a hard maximum capacity
Maintains confirmed and waitlisted tokens
Token
Represents a patient visit
Has a source, priority, status, and timestamp
Storage Model
Fully in-memory
Central store maintains:
Doctors
Tokens
Priority mapping
This design keeps the logic easy to reason about and easy to migrate later to Redis or a database.
Token Prioritization Logic
Priority Order (Highest → Lowest)
Emergency
Paid
Follow-up
Online
Walk-in
Lower numeric value = higher priority.
Allocation Rules
If a slot has capacity, the token is confirmed.
If a slot is full:
A higher-priority token can displace the lowest-priority confirmed token.
Displaced tokens move to the waitlist.
Emergency tokens:
Ignore normal capacity
Are always confirmed (with controlled overbooking)
API Endpoints
1. Create Doctor and Slots
POST /doctors
{
  "id": "doc1",
  "name": "Dr. Rao",
  "slots": [
    { "id": "9-10", "startTime": "09:00", "endTime": "10:00", "maxCapacity": 2 },
    { "id": "10-11", "startTime": "10:00", "endTime": "11:00", "maxCapacity": 2 }
  ]
}
2. Book Token
POST /tokens/book
{
  "patientId": "p1",
  "doctorId": "doc1",
  "source": "ONLINE"
}
3. Add Emergency Token
POST /tokens/emergency
{
  "patientId": "p999",
  "doctorId": "doc1"
}
4. Cancel Token
POST /tokens/cancel
{
  "tokenId": "token_3"
}
Automatically promotes the highest-priority waitlisted token.
5. View Doctor Schedule
GET /doctors/:id/schedule
Returns slot-wise confirmed and waitlisted tokens.
Edge Cases Handled
Slot capacity never exceeded (except controlled emergency overbooking)
Priority-based displacement works correctly
Cancellation frees slots and promotes waitlisted patients
Emergency patients are always accommodated
Unique token IDs prevent data corruption
Multiple doctors and slots handled independently
Assumptions and Trade-offs
Assumptions
All doctors work in fixed hourly slots
Consultation time is uniform per patient
Priority rules are globally agreed and static
In-memory storage is acceptable for this scope
Trade-offs
No persistence across restarts
No concurrency control (single-process assumption)
No explicit no-show timer (can be added as an enhancement)
How to Run the Project
Install Dependencies
npm install
Start Server
npm run dev
Server runs at:
http://localhost:3000
Simulation (One OPD Day)
A standalone simulation script (simulateDay.js) demonstrates:
Creation of multiple doctors and slots
Booking tokens from all sources
Priority-based displacement
Cancellation and reallocation
Emergency insertion
Run:
node simulateDay.js
The console output clearly shows how tokens move between:
Confirmed list
Waitlist
Cancellation
Emergency override
This simulation validates the correctness of the allocation logic.
Conclusion
This OPD Token Allocation Engine demonstrates:
Clear problem understanding
Practical system design
Correct handling of real-world constraints
Clean, maintainable Node.js logic