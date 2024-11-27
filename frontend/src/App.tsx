import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import TaskList from './components/Tasks/TaskList';
import { authService } from './services/auth.service';

const theme = createTheme();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={
            authService.isAuthenticated() ? <Navigate to="/tasks" replace /> : <Login />
          } />
          <Route path="/register" element={
            authService.isAuthenticated() ? <Navigate to="/tasks" replace /> : <Register />
          } />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskList />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
