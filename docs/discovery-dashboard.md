# Extensive Discovery Dashboard 🎬

Vibeo's primary hub is its extensive and highly curated **Discovery Dashboard**. This Dashboard gives users immediate, visually stunning access to a vast world of cinema the moment they sign in.

## Core Sections

The Dashboard is designed to minimize searching and maximize finding. It features several key horizontal scrolling lanes that categorize content for easy browsing:

*   **Trending Now**: A constantly updated list of the most popular movies globally.
*   **Top Rated**: Critically acclaimed cinema spanning all years.
*   **Action & Adventure**: High-octane thrillers and epic journeys.
*   **Comedy**: Lighthearted and hilarious films to lift your spirits.
*   **Sci-Fi & Fantasy**: Mind-bending concepts and imaginative worlds.
*   **Romance**: Love stories, rom-coms, and heartfelt dramas.
*   **Documentaries**: Real-life stories and educational explorations.

## Key Features

1.  **Immersive Hero Banner**: The top of the Dashboard features a large, dynamic hero banner highlighting a featured or trending movie, complete with a backdrop image, title, overview snippet, and a direct "Play" button.
2.  **Smooth Horizontal Scrolling**: Each genre category is displayed in a sleek, horizontal scrolling container that is fully responsive and supports touch/swipe gestures on mobile devices.
3.  **Hover Interactions**: Movie cards feature elegant hover states, slightly enlarging and displaying additional contextual information (like release year or rating) to aid the browsing experience without clicks.
4.  **Infinite Exploration**: Clicking on any category header (e.g., "Trending Now") navigates the user to a dedicated full-page grid view for that specific category, allowing for unlimited scrolling and discovery.

## Underlying Technology

*   **TMDB API**: All movie data, categorization lists, and high-resolution imagery are sourced live from The Movie Database (TMDB).
*   **`useQuery` Hook (TanStack Query)**: Data fetching is heavily optimized using React Query. Categories are fetched independently, cached for immediate load times on subsequent visits, and automatically retried on failure.
*   **Tailwind CSS**: The layout is built entirely with utility-first CSS, utilizing Flexbox and Grid for complex responsive behaviors and custom scrollbar styling for a native feel.
