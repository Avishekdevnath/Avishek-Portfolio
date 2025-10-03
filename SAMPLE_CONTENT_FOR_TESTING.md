# Sample ChatGPT Content for Testing Paste Functionality

## 🧪 **Copy and Paste This Content to Test Format Preservation**

Here's a comprehensive sample content with various formatting elements that will demonstrate the enhanced paste functionality:

---

## **Understanding React Hooks: A Comprehensive Guide**

React Hooks revolutionized how we write React components by allowing us to use state and other React features in functional components. In this guide, we'll explore the most commonly used hooks and their practical applications.

### **What Are React Hooks?**

React Hooks are functions that let you "hook into" React state and lifecycle features from functional components. They were introduced in React 16.8 and have become the standard way to manage state and side effects in modern React applications.

### **Core Hooks You Should Know**

#### **1. useState Hook**
The `useState` hook is the most fundamental hook for managing component state:

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

#### **2. useEffect Hook**
The `useEffect` hook handles side effects in functional components:

```javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### **Advanced Hooks**

#### **useContext Hook**
For sharing data across components without prop drilling:

```javascript
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={`btn-${theme}`}
    >
      Toggle Theme
    </button>
  );
}
```

### **Performance Optimization**

#### **useMemo Hook**
Memoize expensive calculations:

```javascript
import React, { useState, useMemo } from 'react';

function ExpensiveComponent({ items }) {
  const [filter, setFilter] = useState('');

  const expensiveValue = useMemo(() => {
    return items
      .filter(item => item.name.includes(filter))
      .reduce((sum, item) => sum + item.value, 0);
  }, [items, filter]);

  return (
    <div>
      <input 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      <p>Total Value: {expensiveValue}</p>
    </div>
  );
}
```

### **Best Practices**

When working with React Hooks, follow these best practices:

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Use the dependency array correctly** - Include all dependencies in useEffect
3. **Custom hooks for reusable logic** - Extract common logic into custom hooks
4. **Cleanup side effects** - Always clean up subscriptions and timers

### **Common Patterns**

#### **Custom Hook Example**
```javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

### **Comparison Table**

| Hook | Purpose | When to Use |
|------|---------|-------------|
| `useState` | Manage component state | When you need to store and update data |
| `useEffect` | Handle side effects | For API calls, subscriptions, timers |
| `useContext` | Share data globally | When passing props becomes cumbersome |
| `useMemo` | Memoize calculations | For expensive computations |
| `useCallback` | Memoize functions | To prevent unnecessary re-renders |

### **Conclusion**

React Hooks provide a powerful and flexible way to manage state and side effects in functional components. By understanding and properly implementing these hooks, you can write more maintainable and efficient React applications.

**Key Takeaways:**
- Hooks allow functional components to use state and lifecycle features
- Each hook has a specific purpose and use case
- Proper implementation follows React's rules of hooks
- Custom hooks can encapsulate reusable logic

---

## 🎯 **What This Sample Tests:**

This content includes:
- ✅ **Headings** (H1, H2, H3, H4)
- ✅ **Code blocks** with syntax highlighting
- ✅ **Tables** with borders and formatting
- ✅ **Lists** (numbered and bulleted)
- ✅ **Bold and italic** text formatting
- ✅ **Mixed content** types
- ✅ **Complex formatting** structures

## 🧪 **How to Test:**

1. **Copy the entire content** above (from "Understanding React Hooks" to "Key Takeaways")
2. **Go to** `/dashboard/posts/new` or `/dashboard/posts/edit/[slug]`
3. **Click in the Content field**
4. **Paste the content** (Ctrl+V or Cmd+V)
5. **Watch the magic happen** - All formatting should be preserved!

## 📊 **Expected Results:**

- ✅ **Headings** should maintain their hierarchy
- ✅ **Code blocks** should preserve syntax highlighting
- ✅ **Tables** should have borders and proper spacing
- ✅ **Lists** should maintain bullets and numbering
- ✅ **Bold/italic** text should be preserved
- ✅ **Paste warnings** may appear for complex formatting

**Try it now and see the enhanced paste functionality in action!** 🚀
