import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link,
    Divider,
} from '@mui/material';
import { authService } from '../../services/auth.service';
import Notification from '../Notification/Notification';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LockOutlined } from '@mui/icons-material';

const validationSchema = yup.object({
    username: yup
        .string()
        .required('Имя пользователя обязательно'),
    password: yup
        .string()
        .required('Пароль обязателен')
});

const Login: React.FC = () => {
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

    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const success = await authService.login(values.username, values.password);
                if (success) {
                    showNotification('Вход выполнен успешно', 'success');
                    setTimeout(() => {
                        navigate('/tasks');
                    }, 1000);
                } else {
                    showNotification('Неверное имя пользователя или пароль', 'error');
                }
            } catch (error: any) {
                console.error('Ошибка при входе:', error);
                let errorMessage = 'Произошла ошибка при входе';
                if (error.response) {
                    errorMessage = error.response.data?.detail || errorMessage;
                }
                showNotification(errorMessage, 'error');
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
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 1,
                        }}
                    >
                        <LockOutlined sx={{ color: 'white' }} />
                    </Box>
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Вход в систему
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Имя пользователя"
                            name="username"
                            autoComplete="username"
                            autoFocus
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
                            autoComplete="current-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Войти
                        </Button>
                        <Divider sx={{ my: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                или
                            </Typography>
                        </Divider>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Еще нет аккаунта?
                            </Typography>
                            <Link
                                component={RouterLink}
                                to="/register"
                                variant="body2"
                                sx={{
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                Зарегистрироваться
                            </Link>
                        </Box>
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

export default Login;
