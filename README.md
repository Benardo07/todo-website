# Todo List App

This Todo List App is a modern, full-stack application built using Next.js, Prisma, and tRPC. It features task management capabilities including add, update, delete, mark as done, mark as undone, search, and real-time loading indicators.

## Features

- **Add Tasks**: Create new tasks with due dates and descriptions.
- **Filter Tasks**: View tasks based on their status (All, Completed, Pending).
- **Update Tasks**: Edit task details.
- **Delete Tasks**: Remove tasks from the list.
- **Mark as Done/Undone**: Toggle tasks between completed and pending.
- **Search**: Filter tasks by their titles.
- **Loading Indicators**: Displays a loading state as data is fetched or updated.

## Installation

Follow these steps to set up and run the project locally:

### Prerequisites

- Node.js
- PostgreSQL
- Git

### Setup

1. **Clone the repository**

    ```bash
    git clone https://github.com/Benardo07/todo-website.git
    cd todo-website
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up the database**

    Create a `.env` file in the root directory and update the `DATABASE_URL` with your PostgreSQL credentials:
    (example)
    ```plaintext
    DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
    ```

4. **Generate Prisma Client**

    ```bash
    npm run postinstall
    ```

5. **Migrate the database**

    ```bash
    npm run db:generate
    ```

6. **Start the development server**

    ```bash
    npm run dev
    ```

## Deployment

To deploy this project on Vercel, follow these steps:

1. **Sign up/Login to Vercel** ([Vercel](https://vercel.com))
2. **Import your GitHub repository**
3. **Configure your project settings** to set environment variables such as `DATABASE_URL`.
4. **Deploy your project** by pushing changes to your branch or merging a pull request.

## Tech Stack

- **Frontend**: Next.js
- **Backend**: tRPC for type-safe API routes
- **Database**: Prisma with PostgreSQL
- **Deployment**: Vercel

## Repository

You can find the project repository here:
[GitHub Repository](https://github.com/Benardo07/todo-website)

## Live Demo

Check out the live demo of the application here:
[Visit Todo List App](https://todo-website-mu.vercel.app/)

---

Made by [Benardo](https://github.com/Benardo07)
