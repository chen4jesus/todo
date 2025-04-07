# Smart Todo App

A powerful and intuitive task management application built with React Native, Expo, and Neo4j graph database.

## Features

- 📝 Create, edit, and manage tasks with rich details
- 🗂️ Organize tasks with custom categories
- 📅 Calendar view for task scheduling
- 🔄 Set repeating tasks with customizable intervals
- 🔔 Add reminders with time and date settings
- 🏷️ Assign priority levels and symbols to tasks
- 📊 View task progress and completion statistics
- 🔍 Search and filter tasks
- 📱 Clean, intuitive mobile interface

## Tech Stack

- **Frontend**: React Native, Expo
- **State Management**: React Context API
- **UI Components**: React Native Paper
- **Navigation**: React Navigation
- **Database**: Neo4j Graph Database
- **Styling**: React Native StyleSheet
- **Icons**: MaterialCommunityIcons
- **Date Handling**: date-fns

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI
- Neo4j Database (local or cloud instance)

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/smart-todo-app.git
cd smart-todo-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure Neo4j connection
Create a `.env` file in the root directory with your Neo4j credentials:
```
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
```

4. Start the development server
```bash
npm start
# or
yarn start
```

5. Run on your preferred platform
```bash
npm run android
# or
npm run ios
# or
npm run web
```

## Project Structure

```
smart-todo-app/
├── App.tsx                 # Main application component
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/            # App screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services
│   ├── contexts/           # Context providers
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── constants/          # App constants
│   ├── types/              # TypeScript type definitions
│   └── assets/             # Static assets
├── app.json                # Expo configuration
└── package.json            # Project dependencies
```

## Database Schema

The app uses Neo4j graph database with the following structure:

- Nodes:
  - `Task`: Represents a task with properties (title, description, due date, etc.)
  - `Category`: Represents a task category with properties (name, color, icon)
  - `User`: Represents a user of the app

- Relationships:
  - `(Task)-[:BELONGS_TO]->(Category)`: Links a task to its category
  - `(User)-[:CREATED]->(Task)`: Links a user to the tasks they created

## Roadmap

- [ ] User authentication
- [ ] Task sharing and collaboration
- [ ] Subtasks and dependencies
- [ ] Cloud sync across devices
- [ ] Push notifications for reminders
- [ ] Dark mode
- [ ] Task analytics and insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from various task management apps
- Expo team for the fantastic development environment
- Neo4j for the powerful graph database 