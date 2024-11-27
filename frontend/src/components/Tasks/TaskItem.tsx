import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Checkbox,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskItemProps {
  task: Task;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onDelete,
  onEdit,
  onToggleComplete,
}) => {
  const handleDelete = () => {
    const element = document.getElementById(`task-${task.id}`);
    if (element) {
      element.style.height = `${element.offsetHeight}px`;
      void element.offsetHeight; // force reflow
      element.style.height = '0px';
      setTimeout(() => onDelete(task.id), 300);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        opacity: { duration: 0.2 },
        y: { type: "spring", stiffness: 300, damping: 30 }
      }}
      id={`task-${task.id}`}
      style={{ 
        transition: 'height 300ms ease-in-out',
        overflow: 'hidden'
      }}
    >
      <Card
        sx={{
          mb: 2,
          transform: task.completed ? 'scale(0.98)' : 'scale(1)',
          opacity: task.completed ? 0.8 : 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Tooltip title={task.completed ? "Отметить как невыполненное" : "Отметить как выполненное"}>
                <Checkbox
                  checked={task.completed}
                  onChange={(e) => onToggleComplete(task.id, e.target.checked)}
                  sx={{
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              </Tooltip>
              <Box sx={{ ml: 1 }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {task.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.description}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Создано: {format(new Date(task.created_at), 'PPp', { locale: ru })}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="Редактировать">
                <IconButton
                  onClick={() => onEdit(task)}
                  size="small"
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить">
                <IconButton
                  onClick={handleDelete}
                  size="small"
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)', color: 'error.main' },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};
