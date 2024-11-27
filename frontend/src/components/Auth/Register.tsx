import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { authService } from '../../services/auth.service';
import Notification from '../Notification/Notification';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface RegisterFormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

const validationSchema = yup.object({
    email: yup
        .string()
        .email('Введите корректный email')
        .required('Email обязателен'),
    username: yup
        .string()
        .min(3, 'Имя пользователя должно быть не менее 3 символов')
        .required('Имя пользователя обязательно'),
    password: yup
        .string()
        .min(6, 'Пароль должен быть не менее 6 символов')
        .required('Пароль обязателен'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Пароли должны совпадать')
        .required('Подтверждение пароля обязательно')
});

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showNotification = (message: string, severity: 'success' | 'error') => {
        setNotification({ open: true, message, severity });
    };

    const handleNotificationClose = () => {
        setNotification({ ...notification, open: false });
    };

    const formik = useFormik<RegisterFormData>({
        initialValues: {
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const { success, message } = await authService.register(
                    values.username,
                    values.email,
                    values.password
                );

                if (success) {
                    showNotification('Регистрация успешна', 'success');
                    setTimeout(() => {
                        navigate('/login');
                    }, 1500);
                } else {
                    showNotification(message, 'error');
                }
            } catch (error: any) {
                console.error('Ошибка при регистрации:', error);
                showNotification(
                    error.response?.data?.detail || 'Произошла ошибка при регистрации',
                    'error'
                );
            }
        },
    });

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Typography component="h1" variant="h5">
                        Регистрация
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Имя пользователя"
                            name="username"
                            autoComplete="username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Пароль"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Подтвердите пароль"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Зарегистрироваться
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                        >
                            Уже есть аккаунт? Войти
                        </Button>
                    </Box>
                </Paper>
            </Box>
            <Notification
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={handleNotificationClose}
            />
        </Container>
    );
};

export default Register;
