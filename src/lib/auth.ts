// This would be replaced with a real database in production
export const users = [
  {
    id: '1',
    email: 'admin@example.com',
    // Default password: "penguins123"
    password: '$2a$10$zH1jxUb8Ys7qKQXJz6N6YuGQw4eBGWZ1XZJxz7/c3nF7lyYX6iOxq',
    name: 'Admin User'
  }
]

export type User = (typeof users)[0] 