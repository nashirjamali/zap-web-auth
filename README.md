# ICP Who Am I - Next.js Frontend

This is a Next.js frontend application that demonstrates Internet Computer authentication using Internet Identity. This application is based on the [who_am_i](https://github.com/dfinity/examples/tree/master/motoko/who_am_i) example from DFINITY, but includes only the frontend portion.

## Features

- Authentication with Internet Identity
- Display of user's Principal ID after authentication
- No backend canister required - purely frontend implementation

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd zap-web-auth-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:

   Option 1: Using the start script (recommended):
   ```bash
   ./start.sh
   ```
   This script will automatically create the `.env.local` file if it doesn't exist and start the development server.

   Option 2: Manual setup:
   - Create a `.env.local` file in the root directory with the following content:
     ```
     NEXT_PUBLIC_II_URL=https://identity.ic0.app
     ```
   - Run the development server:
     ```bash
     npm run dev
     ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

You can customize the Internet Identity URL by setting the following environment variable in your `.env.local` file:

```
NEXT_PUBLIC_II_URL=https://identity.ic0.app
```

By default, the application uses the production Internet Identity service.

## How It Works

The application uses the `@dfinity/auth-client` library to handle authentication with Internet Identity. When the user clicks the "Log in" button, a popup window will open to the Internet Identity service, allowing the user to authenticate. After successful authentication, the user's Principal ID will be displayed on the page.

## Learn More

- [Internet Computer Documentation](https://internetcomputer.org/docs/current/developer-docs/)
- [Internet Identity Overview](https://internetcomputer.org/internet-identity)
- [Next.js Documentation](https://nextjs.org/docs)

## License

This project is licensed under the MIT License.
