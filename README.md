# Bloom — Eye Care Companion

A fully offline eye-exercise app for severe dry eye + digital eye strain, installable as a real app on
Windows/Mac and Android. No internet, no account, no data leaves the device.

## The 5 exercises (~1 minute each)

| Exercise | Targets | Evidence |
|---|---|---|
| **Blink Reset** — 10 × close (2s) → squeeze (2s) → open (2s) | Dry eye: complete blinks re-spread the tear film and express oil glands | Clinical trials in *Contact Lens & Anterior Eye* (2020, 2025) showed this exact close–squeeze–open protocol reduced dry-eye symptoms and incomplete blinks |
| **Far Gaze 20·20** — 3 × 20s looking 20 ft away | Focusing-muscle strain from screens | The 20-20-20 rule, endorsed by the American Optometric Association and American Academy of Ophthalmology |
| **Near–Far Focus** — 10 slow switches, thumb ↔ distant object | Tired eyes / accommodative fatigue | Standard accommodative-facility drill used in optometric practice |
| **Smooth Convergence** — 6 slow thumb push-ups toward nose | The tired-eye squint (eye-teaming fatigue) | Home-based pencil push-up studies showed improved near point of convergence over 12 weeks |
| **Warm Palming** — 60s of warm darkness | Rest + comfort for sore, dry eyes | Classic rest technique; warmth supports meibomian (oil) gland function |

## Installing it

Open the live site (or `index.html` via a local server — service workers need `http(s)://` or `localhost`, not `file://`), then:

- **Windows/Mac (Chrome/Edge):** Settings → **Install Bloom as an app** (or the install icon in the address bar). It gets a real taskbar/dock icon and its own window — no more hunting for a browser tab.
- **Android (Chrome):** same install prompt, adds a home-screen icon.
- **iPhone (Safari):** Add to Home Screen still works the same as before; see the reliability note below for why background reminders are more limited there.

## Reminders, streaks, sync

- **While the app/tab is open** (foreground or backgrounded), hourly reminders and the 2-hour nudge popup work reliably — a chime plus a toast or popup, and the check now also re-runs immediately when you switch back to the tab.
- **When fully closed, after installing:** on Windows/Mac and Android, an installed Bloom can still show a system notification via Periodic Background Sync — a browser API with no user-facing permission prompt. Chrome grants it automatically to installed PWAs based on how often you actually use the app, so it typically takes a few days of normal use before background reminders start firing reliably. This is a browser-level trust mechanic, not a bug in the app.
- **iPhone:** Apple does not allow any web app to schedule local reminders while fully closed without genuine server-sent push — which would mean standing up a backend, breaking the zero-server design. Add-to-Home-Screen still works there; background reminders don't.
- **Streak & calendar** are tracked automatically; a break counts once at least one exercise is completed.
- **PC ↔ phone sync:** Settings → *Export progress* on one device, *Import* on the other. Imports **merge** (never overwrite), so it's safe in both directions.

## Important medical note

With a Schirmer score of 1–3 (severe aqueous-deficient dry eye), these exercises are a **complement to — never a replacement for —** prescribed treatment (lubricants, anti-inflammatories, punctal plugs, etc.). He should keep following his ophthalmologist's plan and show them this routine at the next visit. Stop any exercise that causes pain or double vision that doesn't resolve.
