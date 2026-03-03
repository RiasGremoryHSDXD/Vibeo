# Seamless Streaming Player ▶️

Vibeo offers an integrated, seamless streaming experience directly within the application, eliminating the need to redirect users to external sites or third-party players. 

## Features

*   **Dedicated Playing Environment (`/play/:id`)**: A distraction-free, full-screen playback environment dedicated solely to the movie. Navigation headers and footers are removed to maximize immersion.
*   **Intuitive Controls**: Familiar and responsive video controls for play/pause, volume adjustment, full-screen toggling, and seeking.
*   **Instant Playback**: The player initializes and begins buffering immediately upon selecting a title from the dashboard or mood-matching results, minimizing wait times.
*   **Responsive Design**: The player gracefully adapts its aspect ratio and layout from the largest desktop monitors down to mobile screens.

## Technical Implementation

*   The streaming component is a dedicated route (`/play/:id`) within the React Router setup.
*   It handles dynamic routing effectively, fetching the correct media source based on the TMDB ID provided in the URL parameter.
*   The UI is stripped back using a custom layout component or conditional rendering within `App.jsx` to ensure a clean slate for the player.
*   Tailwind CSS is used to ensure the player wrapper maintains correct aspect ratios (e.g., 16:9) across all device sizes.
