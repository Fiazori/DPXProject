import {jwtDecode} from 'jwt-decode';

export const setToken = (token) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const clearToken = () => {
    localStorage.removeItem('token');
};

export const isLoggedIn = () => {
    const token = getToken();
    const user = token ? jwtDecode(token) : null;
    return !!getToken() && user?.role === 'customer';
};

export const isELoggedIn = () => {
    const token = getToken();
    const user = token ? jwtDecode(token) : null;
    return !!getToken() && user?.role === 'employee';
};