import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Task } from '../../types';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; completed: boolean }) => void;
  task?: Task;
  mode: 'create' | 'edit';
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  onSubmit,
  task,
  mode,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCompleted(task.completed);
    } else {
      setTitle('');
      setDescription('');
      setCompleted(false);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, completed });
    setTitle('');
    setDescription('');
    setCompleted(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Создать задачу' : 'Редактировать задачу'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
            }
            label="Завершено"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
