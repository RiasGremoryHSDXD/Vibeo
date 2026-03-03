# AI Mood-Matching ✨

Vibeo's flagship feature is an intuitive, conversational approach to discovering movies. Instead of hunting through traditional genres or relying on generic recommendations, you can simply express how you're feeling, and Vibeo will curate the perfect movie selection for your specific vibe.

## How It Works

1.  **Natural Language Input**: The mood-matching engine accepts natural language queries. Whether you say "I need a good cry," "Show me something mind-bending," or "I want a lighthearted comedy to watch with my family," Vibeo understands the nuance of your request.
2.  **Gemini AI Processing**: Under the hood, your query is processed by Google's advanced Generative AI (Gemini). The AI interprets the context, emotion, and specific keywords in your input to identify the core cinematic themes you're looking for.
3.  **Semantic Search & Filtering**: The interpreted themes are then mapped to extensive metadata via the TMDB API. Vibeo filters through thousands of movies, evaluating genres, keywords, synopses, and user ratings to find the absolute best matches for your mood.
4.  **Instant Curation**: The results are presented instantly in a visually stunning, easy-to-browse grid, complete with immediate context on *why* each movie matches your current vibe.

## Key Benefits

*   **Deeper Discovery**: Break free from algorithmic echo chambers and discover hidden gems you might never have found through traditional browsing.
*   **Zero Friction**: No need to know exactly what you want. Just type how you feel and hit enter.
*   **Highly Personalized**: The recommendations are dynamically generated for *your* specific, momentary mood, providing a uniquely personal streaming experience.

## Technology Stack

*   **Google Gemini AI (`@google/generative-ai`)**: Powers the natural language understanding and theme extraction.
*   **TMDB API**: Provides the massive database of movie metadata, imagery, and necessary filtering endpoints.
*   **React Query**: Manages the complex asynchronous data fetching and state management smoothly, ensuring a snappy user experience.
