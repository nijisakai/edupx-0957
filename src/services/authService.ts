// A mock authentication service using localStorage as a "database".
// In a real application, this would make API calls to a backend server.
import type { User } from '../types';

const USERS_DB_KEY = 'edupx_users_db';

// This interface defines the structure of user data stored in our mock "database".
// We store password here for simplicity. In a real app, it would be salted and hashed on a server.
interface UserData {
  password: string;
  country: string;
  industry: string;
}

const getUsers = (): Record<string, UserData> => {
    if (typeof localStorage === 'undefined') return {};
    const users = localStorage.getItem(USERS_DB_KEY);
    try {
        return users ? JSON.parse(users) : {};
    } catch (e) {
        return {};
    }
};

const saveUsers = (users: Record<string, UserData>) => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};


export const register = async (username: string, password: string, country: string, industry: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network latency
            if (username.toLowerCase() === 'admin') {
                return reject(new Error('Cannot register with the username "admin".'));
            }
            const users = getUsers();
            if (users[username]) {
                return reject(new Error('Username already exists.'));
            }
            users[username] = { password, country, industry };
            saveUsers(users);
            resolve();
        }, 500);
    });
};

export const login = async (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network latency
            // Special case for admin login
            if (username === 'admin' && password === 'admin') {
                resolve({ id: 'admin', name: 'Admin', isAdmin: true });
                return;
            }
            
            const users = getUsers();
            const userData = users[username];
            if (!userData || userData.password !== password) {
                return reject(new Error('Invalid username or password.'));
            }
            resolve({ 
                id: username, 
                name: username, 
                isAdmin: false,
                country: userData.country,
                industry: userData.industry
            });
        }, 500);
    });
};

export const getAllUsers = async (): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network latency
            const users = getUsers();
            const userList = Object.keys(users).map(username => {
                const userData = users[username];
                return {
                    id: username,
                    name: username,
                    isAdmin: false,
                    country: userData.country,
                    industry: userData.industry
                };
            });
            resolve(userList);
        }, 300);
    });
};