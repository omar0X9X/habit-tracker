# Habit Tracker — GitHub Pages

A responsive, no-dependency habit tracker based on the supplied Google Sheets screenshot. The **Example** page reproduces 162/300 (54%) check-ins from the screenshot.

## Features

- 12 months, correct month lengths and weekday labels, mood and motivation charts.
- Add, rename and delete recurring habits, with automatic calculations for any number of habits (1–50).
- Independent **Daily tasks** for each calendar date: add, edit, complete and delete tasks.
- Annual dashboard, example demo, and help page.
- Browser persistence with JSON backups and CSV exports.
- Responsive layout with keyboard-accessible controls.

## Deploy to GitHub Pages

In the repository **Settings → Pages → Build and deployment**, select **Deploy from a branch**, branch `main`, folder `/ (root)`, click **Save**. Wait for the published URL at `https://omar0X9X.github.io/habit-tracker/`.

## Data and privacy

Data is stored only in the browser's `localStorage`. GitHub does not store personal habit/task data. Export JSON backup and import it to move between browsers or devices. There is **no automatic cross-device sync**. Removing a habit deletes that habit's check-in history in the currently stored tracker, after confirmation.

## Technical

Static HTML/CSS/JavaScript; no build, external libraries, secrets, or server. Example is a separate fixed ten-habit demonstration and can be checked without changing personal month data. Backwards-compatible with the initial v1 backup and local storage format.