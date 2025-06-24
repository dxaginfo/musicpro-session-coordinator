# MusicPro Session Coordinator

A comprehensive web application to help session musicians, producers, and band managers coordinate recording sessions, rehearsals, and music projects.

## Features

- **User Management**: Registration and profiles for musicians, producers, and band managers
- **Musician Profiles**: Detailed profiles including instruments, genres, rates, and portfolio
- **Project Management**: Create and manage music projects with team collaboration
- **Session Scheduling**: Schedule and coordinate recording sessions with multiple musicians
- **Messaging System**: Built-in communication between team members
- **File Sharing**: Upload and share music files, charts, and reference tracks
- **Calendar Integration**: View availability and schedule sessions efficiently
- **Rating & Reviews**: Build reputation through ratings and reviews
- **Payment Tracking**: Track session payments and generate invoices

## Technology Stack

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- Material-UI for responsive design
- Socket.io client for real-time updates
- Formik and Yup for form validation

### Backend
- Node.js with Express
- TypeScript for type safety
- Prisma ORM with PostgreSQL database
- JWT for authentication
- Socket.io for real-time communication
- Winston for logging

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Environment Setup
1. Clone the repository
   ```
   git clone https://github.com/dxaginfo/musicpro-session-coordinator.git
   cd musicpro-session-coordinator
   ```

2. Create a `.env` file in the server directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/musicpro
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   CLIENT_URL=http://localhost:3000
   ```

3. Create a `.env` file in the client directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Installation and Setup

#### Backend Setup
1. Install server dependencies:
   ```
   cd server
   npm install
   ```

2. Set up the database:
   ```
   npx prisma migrate dev
   npx prisma db seed
   ```

3. Start the server:
   ```
   npm run dev
   ```

#### Frontend Setup
1. Install client dependencies:
   ```
   cd client
   npm install
   ```

2. Start the client:
   ```
   npm start
   ```

## API Documentation

The API follows RESTful principles with the following main endpoints:

- `/api/auth`: Authentication endpoints (register, login, etc.)
- `/api/users`: User management
- `/api/projects`: Project management
- `/api/sessions`: Session scheduling
- `/api/messages`: Messaging system
- `/api/files`: File management

Detailed API documentation is available at `/api/docs` when running the server.

## Mobile Responsiveness

The application is designed with a mobile-first approach, ensuring a seamless experience across all devices:
- Responsive UI that adapts to different screen sizes
- Touch-friendly interface elements
- Progressive Web App capabilities for offline access

## Security Features

- HTTPS for all communications
- Secure authentication with proper token management
- Encrypted sensitive data
- Rate limiting to prevent abuse
- Regular security audits

## Integration Capabilities

- Spotify API for artist verification
- SoundCloud API for portfolio integration
- Bandcamp for musician portfolios
- Stripe for payment processing
- Google Calendar/iCal for schedule synchronization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.