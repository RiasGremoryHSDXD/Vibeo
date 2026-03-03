# Personalized Profiles 👤

Vibeo doesn't just let you search for movies; it acts as a persistent companion to track your cinematic journey. The profile system ensures your preferences and discoveries are never lost.

## Features

*   **Watchlist ("My List")**: A dedicated section dynamically generated from movies you specifically flag across the app. Add items directly from the home dashboard or the dedicated movie view page.
*   **Watch History**: A log of titles you've recently engaged with, allowing for quick resumption or sharing with friends based on past activities. *<small>(Future feature)</small>*
*   **Account Management**: Simple and secure profile updating mechanisms allowing adjustments to basic user information authenticated securely through Firebase.

## Seamless Integration

The personalized profile mechanism is deeply integrated across Vibeo:
*   Action buttons to add movies persist globally (Dashboard, Search, Movie details).
*   State management ensures that switching tabs or closing the browser retains your exact list using secure Firestore database document architectures.
*   Personalized context allows us to inject your data immediately upon login rather than showing you generic information repeatedly.

## Technologies Used

*   **React Context (`AuthContext` & `ProfileContext`)**: Ensures personalized context floats correctly downward to components requiring user scope.
*   **Firebase Firestore**: NoSQL backend serving as the primary fast-storage engine ensuring sub-second sync updates between devices.
