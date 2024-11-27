import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/api.service';
import { authService } from '../../services/auth.service';
import { Task } from '../../types';
import { TaskItem } from './TaskItem';
import { TaskDialog } from './TaskDialog';
import { Skeleton } from '../UI/Skeleton';
import { useNavigate } from 'react-router-dom';

type SortOption = 'newest' | 'oldest' | 'completed' | 'active';
type StatusFilter = 'all' | 'active' | 'completed';

/**
 * Компонент для отображения и управления списком задач
 * @component
 * @example
 * ```tsx
 * <TaskList />
 * ```
 */
interface TaskListProps {
    /**
     * Функция для обновления списка задач
     * @optional
     */
    onUpdate?: () => void;
}

/**
 * Состояние компонента TaskList
 * @interface TaskListState
 */
interface TaskListState {
    /**
     * Список задач
     * @type {Task[]}
     */
    tasks: Task[];
    
    /**
     * Текущий фильтр для отображения задач
     * @type {string}
     */
    filter: 'all' | 'active' | 'completed';
    
    /**
     * Критерий сортировки задач
     * @type {string}
     */
    sortBy: 'newest' | 'oldest';
}

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await apiService.getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить задачи');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTask(undefined);
  };

  const handleDialogSubmit = async (data: { title: string; description: string; completed: boolean }) => {
    try {
      if (editingTask) {
        const updatedTask = await apiService.updateTask(editingTask.id, data);
        setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
      } else {
        const newTask = await apiService.createTask(data.title, data.description);
        setTasks([newTask, ...tasks]);
      }
      handleDialogClose();
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    try {
      await apiService.updateTask(id, { completed });
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed } : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const getFilteredAndSortedTasks = () => {
    // Сначала фильтруем
    let filteredTasks = [...tasks];
    if (statusFilter !== 'all') {
      filteredTasks = tasks.filter(task => 
        statusFilter === 'completed' ? task.completed : !task.completed
      );
    }

    // Затем сортируем
    return filteredTasks.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      switch (sortOption) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'completed':
          return (a.completed === b.completed) 
            ? dateB - dateA // если статус одинаковый, сортируем по дате
            : (a.completed ? -1 : 1); // завершенные первыми
        case 'active':
          return (a.completed === b.completed)
            ? dateB - dateA // если статус одинаковый, сортируем по дате
            : (a.completed ? 1 : -1); // незавершенные первыми
        default:
          return 0;
      }
    });
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getStatusCount = (status: 'active' | 'completed') => {
    return tasks.filter(task => status === 'completed' ? task.completed : !task.completed).length;
  };

  const renderTasks = () => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} />
      ));
    }

    if (error) {
      return (
        <Typography color="error" align="center">
          {error}
        </Typography>
      );
    }

    const filteredAndSortedTasks = getFilteredAndSortedTasks();

    if (filteredAndSortedTasks.length === 0) {
      if (tasks.length === 0) {
        return (
          <Typography color="textSecondary" align="center">
            У вас пока нет задач. Создайте новую задачу, нажав кнопку "Добавить задачу"
          </Typography>
        );
      } else {
        return (
          <Typography color="textSecondary" align="center">
            Нет задач, соответствующих выбранному фильтру
          </Typography>
        );
      }
    }

    return (
      <AnimatePresence>
        {filteredAndSortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </AnimatePresence>
    );
  };

  return (
    <Box>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Мои задачи
          </Typography>
          <Tooltip title="Выйти">
            <IconButton onClick={handleLogout} size="large" sx={{ ml: 1 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={handleCreate}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            Добавить задачу
          </Button>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Активные: ${getStatusCount('active')}`}
              color={statusFilter === 'active' ? 'primary' : 'default'}
              onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
              sx={{ minWidth: 100 }}
            />
            <Chip
              label={`Завершенные: ${getStatusCount('completed')}`}
              color={statusFilter === 'completed' ? 'primary' : 'default'}
              onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
              sx={{ minWidth: 100 }}
            />
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 200, ml: 'auto' }}>
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={sortOption}
              label="Сортировка"
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <MenuItem value="newest">Сначала новые</MenuItem>
              <MenuItem value="oldest">Сначала старые</MenuItem>
              <MenuItem value="active">Сначала активные</MenuItem>
              <MenuItem value="completed">Сначала завершённые</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box>
          {renderTasks()}
        </Box>
      </Container>
      <TaskDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        task={editingTask}
        mode={editingTask ? 'edit' : 'create'}
      />
    </Box>
  );
};

export default TaskList;
