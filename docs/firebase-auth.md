# Secure Authentication (Firebase) 🔐

Vibeo ensures your personal account, saved lists, and dynamic watching history are kept safe and secure. To achieve seamless user management smoothly without compromising security, we heavily rely on Google's Firebase Platform.

## Features Supported

Our Firebase implementation powers several key personal features in the app:
*   **Google Sign-In**: Quick, frictionless, one-click access using your existing Google account.
*   **User Profiles**: Dynamic account creation behind the scenes immediately upon sign-in.
*   **Watchlists**: Persistent "My List" which sync immediately directly to the Cloud (Firestore).
*   **Session Management**: Maintain logged-in states globally across app reloads and multiple active windows securely using Context Providers (`useAuth()`).
*   **Security Policies**: Firestore data is strictly protected via Security Rules so users can only ever see or edit their own personal data.

## Why Firebase Auth?

Our decision to leverage Firebase comes down to focusing on user experience rather than re-inventing authentication security. Firebase handles the complexities of securely exchanging OAuth tokens with Google natively out of the box.

Additionally, standardizing with a major platform allows Vibeo to:
1. Ensure high availability login times.
2. Abstract complex UI for standard login procedures.
3. Automatically connect Auth IDs to our robust Firestore NoSQL backend.
