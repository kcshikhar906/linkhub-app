# LinkHub - Your Guide to Essential Services

LinkHub is a clean, hyper-efficient, and universally accessible digital directory. It acts as a centralized bridge between users and essential government or institutional services by cutting through the clutter of official websites. It also features directories for shops and events in specific regions.

The platform is designed to be minimal, professional, and completely free of ads or sponsored links to build absolute trust.

## Tech Stack

This project is built with a modern, server-centric web stack:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (via Google AI)
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/hosting)

## Project Structure

The project follows the standard Next.js App Router structure. Here are the key directories:

```
/
├── public/               # Static assets (images, logos, video)
├── src/
│   ├── app/              # Main application routes (pages and layouts)
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── api/          # API routes (not heavily used, logic is in Server Actions)
│   │   ├── categories/   # Dynamic pages for service categories
│   │   └── (public-pages)/ # Main public-facing pages (Home, About, Add, etc.)
│   ├── components/       # Reusable React components (UI, layout, forms)
│   ├── context/          # React context providers (e.g., AuthContext)
│   ├── hooks/            # Custom React hooks (e.g., useIsMobile)
│   ├── lib/              # Core logic, data models, Firebase config, static data
│   └── ai/               # Genkit flows and AI-related logic
├── tailwind.config.ts    # Tailwind CSS configuration
└── next.config.ts        # Next.js configuration
```

## Key Workflows & Features

### 1. Content Management

The application manages several types of content, stored in different ways:

- **Services & Categories:** Stored in **Firebase Firestore**. This allows for dynamic, real-time updates via the admin panel. The data converters are defined in `src/lib/data.ts`.
- **Shops & Events:** Stored as **static data** within the project in `src/lib/shops.ts` and `src/lib/events.ts`. This is suitable for content that doesn't change as frequently.
- **Image Placeholders:** All placeholder images are defined in `src/lib/placeholder-images.json` and referenced throughout the application to ensure consistency.

### 2. Admin Panel

The admin panel is a protected area for managing the site's content. Access is restricted using Firebase Authentication and a `withAuth` higher-order component.

- **Dashboard (`/admin`):** Provides a high-level overview of site stats, pending user inquiries, and reported links.
- **Manage Links (`/admin/manage-links`):** A comprehensive interface to Create, Read, Update, and Delete services. It features a category-first browsing approach.
- **Manage Categories (`/admin/manage-categories`):** Allows admins to add or delete service categories. Sub-category tags are managed in the static file `src/lib/category-tags.ts`.
- **Bulk Import (`/admin/bulk-import`):** A powerful tool to import multiple services at once from a CSV file. It uses Genkit AI to automatically generate titles, descriptions, and steps for each link.
- **Resolved Inquiries (`/admin/resolved-inquiries`):** An archive of user submissions that have been reviewed and marked as "done".

### 3. User Submissions

The "Contribute to LinkHub" page (`/add`) allows users to suggest new content.

1.  A user selects what they want to submit: a **Service**, a **Shop**, or an **Event**.
2.  Based on their selection, a dynamic form collects the relevant required information (e.g., URL for a service, name for a shop, date for an event).
3.  The submission is saved to the `submissions` collection in Firestore with a `pending` status.
4.  Admins can view, filter, and act on these submissions from the admin dashboard. The workflow is designed for the admin to follow up via email to gather full details before publishing.

### 4. AI Integration (Genkit)

The project leverages Genkit for generative AI features, primarily for content automation.

- **Summarize Link (`/src/ai/flows/summarize-link-card.ts`):** This flow is the core of the Bulk Import tool. It takes a URL, analyzes its content, and returns a structured summary including a title, description, and step-by-step guide.
- **Generate Icon (`/src/ai/flows/generate-icon-flow.ts`):** This flow generates a simple, abstract icon based on the content of a URL, providing a visual identity for services that lack a favicon.

### 5. Location Filtering

The application is designed to be multi-regional.

- The `LocationSelector` component in the header allows users to select their country and state.
- This selection is persisted in `localStorage` and also reflected in the URL search parameters (`?country=AU&state=NSW`).
- Pages that display services (Home, Search, Category pages) use these parameters to query Firestore and show only relevant content.

## Getting Started

To run this project locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Firebase:**
    - Open `src/lib/firebase.ts`.
    - Replace the placeholder `firebaseConfig` object with your own Firebase project's web app configuration.

3.  **Run the Development Server:**
    The application consists of the Next.js frontend and the Genkit development server. You should run them in separate terminals.

    - **Terminal 1 (Next.js App):**
      ```bash
      npm run dev
      ```
      This will start the Next.js application, typically on `http://localhost:9002`.

    - **Terminal 2 (Genkit AI Flows):**
      ```bash
      npm run genkit:watch
      ```
      This starts the Genkit development server and watches for changes to your AI flows.

4.  **Open the App:**
    Open your browser to the URL provided by the Next.js development server.

## Future Enhancements

As the project grows, consider the following updates:

- **Full CI/CD:** Implement a CI/CD pipeline for automated testing and deployment.
- **Dynamic Shops/Events:** Migrate the static shop and event data to Firestore to allow for dynamic management through the admin panel.
- **Advanced Admin Roles:** Expand the authentication system to support different user roles (e.g., Contributor, Editor).
