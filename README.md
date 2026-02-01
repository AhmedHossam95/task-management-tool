# 🚀 Taskito

Taskito is a modern, high-performance task management tool built with **Angular 20**. It features a reactive UI, advanced caching strategies, and a feature-based architecture designed for scalability and maintainability.

---

## 🏗️ Architecture & Design Decisions

### Feature-Based Structure
The project follows a **Feature-Based Architecture**, where code is organized by domain rather than type. This reduces cognitive load and improves modularity.
- `src/app/features/`: Contains domain-specific logic (e.g., `home`, `statistics`).
- `src/app/shared/`: Reusable components, services, and utilities shared across features.

### SOLID Principles
- **Single Responsibility (SRP)**: Each component and service has one clear purpose.
- **Dependency Inversion (DIP)**: Components depend on service abstractions rather than concrete implementations for data fetching.

### Design Patterns
- **Facade Pattern**: Services like `TasksService` act as a facade, coordinating complex logic between multiple data sources and utilities, providing a simplified interface for components.
- **Optimistic UI Pattern**: The `executeOptimisticUpdate` utility provides immediate feedback to the user while synchronizing data with the backend in the background.
- **Strategy Pattern**: Implemented in sorting utilities (`task-sort.util.ts`) to allow dynamic swapping of sorting algorithms based on user configuration.
- **Interceptor Pattern**: Custom HTTP interceptors handle cross-cutting concerns like caching (`CachingInterceptor`), loading states (`LoadingInterceptor`), and artificial delays (`MockDelayInterceptor`).
- **Singleton Pattern**: Services are provided at the root level, ensuring unique instances across the application.
- **Observer/Reactive Pattern**: Extensive use of **Angular Signals** and **RxJS** to create reactive data streams and side effects.

### Business Decisions
- **Kanban Behavior**: 
    - When sorting or filtering is active, reordering tasks within the same column is disabled to prevent confusion.
    - Moving tasks between columns is always enabled; when a task is moved to a new column while there is filteration/ sorting applied , it is automatically appended to the end of that column.
- **Mobile Constraints**: Drag-and-drop functionality is disabled on mobile devices to optimize for touch interactions (status fields are used instead).
- **Data Sources**: All statistics and analytics are derived directly from the `tasks` data in the JSON server, ensuring a single source of truth without requiring a dedicated statistics endpoint.
- **Date Validation**:
    - **New Tasks**: The minimum selectable due date is set to tomorrow.
    - **Existing Tasks**: When editing, the current due date remains valid even if it is in the past, but changes must adhere to the "tomorrow" rule.
- **Overdue Logic**: Upon retrieval from the backend, any task that is not in the "Done" status and has a due date prior to today is automatically flagged as "overdue" in the UI.
- **Stale-While-Revalidate (SWR) UX**: When the background fetch detects fresh data that differs from the cache, a subtle animated refresh button is displayed. Data is only updated in the UI when the user explicitly clicks this button, preventing jarring content jumps.

### State Management
- **Angular Signals**: The application leverages `signal`, `computed`, and `resource` for fine-grained reactivity.
- **Modern Change Detection**: Components use `ChangeDetectionStrategy.OnPush` to minimize dirty checking and improve performance.

---

## ⚡ Performance Optimizations

- **Stale-While-Revalidate (SWR) Caching**: A custom `CachingInterceptor` serves cached data immediately while fetching fresh data in the background.
- **Lazy Loading**: Route-based code splitting ensures that feature modules are only loaded when needed.
- **Fetch API**: Uses the modern `fetch` backend for HTTP requests.

---

## 🛠️ Tech Stack & Libraries

- **Framework**: [Angular 20](https://angular.dev/)
- **UI Components**: [Angular Material](https://material.angular.io/)
- **Charts**: [ng2-charts](https://valor-software.com/ng2-charts/) (Chart.js)
- **Styling**: Vanilla SCSS, Bootstrap grid
- **Mock Server**: [json-server](https://github.com/typicode/json-server)
- **Linting & Formatting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-management-tool
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application
To run the frontend and the mock backend concurrently:
```bash
npm run start:dev
```
- Frontend: [http://localhost:4200](http://localhost:4200)
- Backend: [http://localhost:3000](http://localhost:3000)

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run start` | Run the Angular dev server. |
| `npm run server` | Run the JSON-server mock backend. |
| `npm run start:dev` | Run both frontend and backend concurrently. |
| `npm run build` | Build the project for production. |
| `npm run test` | Run unit tests using Karma. |
| `npm run lint` | Run ESLint to find and fix code issues. |
| `npm run generate-data` | Run the script to generate mock data. |

---

## ⚙️ Environment Configuration

Configuration is managed in `src/app/app.config.ts`.
- `ENABLE_MOCK_DELAY`: Toggle to simulate network latency (200ms) for development testing.
- HTTP Interceptors are ordered for optimal performance: `Loading` -> `MockDelay` -> `Caching`.

---

## 🧪 Testing Strategy

- **Unit Testing**: Powered by **Jasmine** and **Karma**.
- **Coverage**: Report can be generated via `ng test --code-coverage`.
- **Pre-commit Hooks**: Husky ensures that linting passes before code is committed.

---

## 🚧 Known Limitations & Future Improvements

- **Authentication**: Currently lacks a real auth flow (uses local mock data).
- **Offline Mode**: Basic SWR caching is implemented, but full PWA support is a future goal.
- **Drag & Drop**: Kanban board mobile enhancements should be added in the future (We can also add order field in the task form itself).
- **Internationalization**: i18n support planned for future releases.

