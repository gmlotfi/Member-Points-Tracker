# Theta Tau Pi Chapter Member Points Tracker

## Overview

**Problem:** Our chapter uses OurHouse as a chapter management platform, but our specific attendance requirements cannot be coded into the app. 
**Solution:** Upload the attendance excel spreadsheet that OurHouse generates to evaluate whether a member is in good or bad standing based on custom attendance requirements.
**Users:** Scribe / Core Exec
**Goal:** Upload spreadsheet to get a clear report of who is in bad standing and why

## Glossary
- **Unexcused absence:** Present=no, Excused=no (i.e. Absent)
- **Excused absence:** Marked Excused in OurHouse
- **Bad Standing:** Failed to meet one or more category requirements

---

## Input Data Contract

### File Format
- Excel (.xlsx), single sheet named `Pi Chapter - Points`

### Row Structure
| Row | Contents |
|---|---|
| 1 | Event dates (MM/DD/YY) |
| 2 | Event names |
| 3 | Event categories |
| 4+ | Member attendance data |
| Last | Totals row (ignore) |

### Member Columns
| Column | Field | Values | Notes |
|---|---|---|
| A | Member Name | String |
| B | Class Year | Freshman, Sophomore, Junior, Senior | Members must update for accuracy on their end
| C+ | Event attendance | See below |

### Attendance Value Types
| Value | Meaning |
|---|---|
| `X / Y` | Earned X out of Y possible points - only for "Request Points" events | 
| `Present` | Attended |
| `Absent` | Did not attend |
| `Excused` | Excused from event |
| `---` | Not applicable (Joined after event took place) |

### Event Categories
- Mandatory (Chapter events currently tracked here, but will migrate to dedicated "Chapter" category in Fall 2026)
- Brotherhood
- Rush
- Service
- Professional Development
- Fundraising
- Diversity
- Care
- General UVA Events
- New Member (PNM Meetings currently tracked here, but will migrate to dedicated "PNM Meeting" category in Fall 2026)
- Exec 2025 (Will update to Exec 2026 in Fall 2026)
- 

### Known Data Quirks
- Some category names have trailing whitespace (e.g. `"Service "`, `"Care "`, `"New Member "`) — parser must trim all category values before matching

---

## Standing Requirements

> ⚠️ These are subject to change by the exec board. Update this section and bump the version when requirements change.

**Version:** 1.0  
**Effective:** Spring 2026

### How `---` is handled
`---` is ignored and not counted towards a member's total. 

### Requirements by Class Year

#### Freshman, Sophomore, and Junior
| Category | Requirement | Notes |
|---|---|---|
| Chapter | Up to 2 unexcused | |
| Rush | 5 total events | See excuse note below |
| Professional Development | 3 total events | See excuse note below |
| Service | 1 total event | See excuse note below |
| PNM Meeting | 3 total events | |

#### Senior
| Category | Requirement | Notes |
|---|---|---|
| Chapter | Up to 2 unexcused | |
| Rush | 3 total events | See excuse note below |
| Professional Development | 3 total events | See excuse note below |
| Service | 1 total event | See excuse note below |
| PNM Meeting | 3 total events | |

#### How to Interpret Points
If an event is marked 0/1, it is considered an absence. If it is x/1 x>=1, count each x as an attended event. Continue to follow this logic if the denominator is ever >1.

#### Excuse policy
Members may have at most 1 excused absence shared across Rush, Professional Development, and Service combined.
A second excused absence in any of those categories counts as unexcused.

#### Make up Polivy
Any further absences from the required Rush, Professional Development, Service, or PNM Meeting events can be made up by attending another event from the following committees: Rush, Professional Development, Service, Care, Diversity

---

## Module Structure

### File Overview
| File | Job |
|---|---|
| `index.html` | UI — file upload, results table |
| `style.css` | Styling |
| `parser.js` | Reads .xlsx, normalizes attendance values |
| `aggregator.js` | Sums attendance per member per category |
| `rules.js` | Hardcoded requirements + evaluation logic |
| `report.js` | Formats results, handles CSV export |

### Hardcoded Values in rules.js
```javascript
const CHAPTER_CATEGORY = "Mandatory"; // update to "Chapter" in Fall 2026
const PNM_CATEGORY = "New Member";    // update to "PNM Meeting" in Fall 2026
const EXEC_CATEGORY = "Exec 2025";    // update to "Exec 2026" in Fall 2026
```

---

## Output Definition

### Per-Member Result
Each member should produce:
- [ ] Standing status: `Good Standing` / `Bad Standing` 
- [ ] List of categories where they failed to meet requirements. If a member is able to make up a category based on the makeup policy, they are shown as `Good Standing` but the category is flagged as "Made Up" to distinguish from members who met requirements outright.
- [ ] Points/attendance summary per the following categories: Rush, Mandatory, Chapter, PNM Meeting, Service, Professional Development


### Report Output
- [ ] Filterable table (all members, or bad standing only)
- [ ] Exportable as CSV or PDF

---

## Deployment
- GitHub Pages (static, client-side only)
- No backend, no database
- All processing happens in the user's browser
- Member data never leaves the device

### Requirements Config
Hardcoded as a JS constant in `rules.js`
Updated by editing the file and pushing to GitHub

---

## Edge Cases

| Scenario | Expected Behavior |
|---|---|
| Requirements change mid-semester | Apply new requirements for the entire semester |

*Last updated: 6/9/2026*  
*Spec version: 1.0.1*
