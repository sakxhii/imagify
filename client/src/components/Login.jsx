import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion'; // ✅ fixed import path
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [state, setState] = useState('Login');
  const { setshowLogin, backendUrl, setToken, setUser } = useContext(AppContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);

    try {
      const payload = state === 'Login' ? { email, password } : { name, email, password };
      const endpoint = state === 'Login' ? '/api/user/login' : '/api/user/register';

      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        toast.success(state === 'Login' ? 'Login successful!' : 'Account created successfully!');
        setshowLogin(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong. Please try again later.');
      console.error('Auth Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') setshowLogin(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [setshowLogin]);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <motion.form
        onSubmit={onSubmitHandler}
        initial={{ opacity: 0.2, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white p-10 rounded-xl text-slate-600 w-[90%] max-w-md shadow-xl"
      >
        <h1 className="text-center text-2xl text-neutral-800 font-semibold">{state}</h1>
        <p className="text-sm mt-2 text-center">{state === 'Login' ? 'Welcome back!' : 'Let’s create your account'}</p>

        {state !== 'Login' && (
          <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-5">
            <img src={assets.profile_icon} alt="Profile Icon" className="w-6 h-6" />
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              className="outline-none text-sm w-full"
              placeholder="Full Name"
              required
            />
          </div>
        )}

        <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
          <img src={assets.email_icon} alt="Email Icon" className="w-5 h-5" />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className="outline-none text-sm w-full"
            placeholder="Email address"
            required
            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            title="Please enter a valid email address"
          />
        </div>

        <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4">
          <img src={assets.lock_icon} alt="Lock Icon" className="w-5 h-5" />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            className="outline-none text-sm w-full"
            placeholder="Password"
            required
            minLength={6}
          />
        </div>

        <p className="text-sm text-blue-600 my-4 cursor-pointer hover:underline">
          Forgot Password?
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white py-2 rounded-full transition-all ${
            isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Processing...' : state === 'Login' ? 'Login' : 'Create Account'}
        </button>

        <p className="mt-5 text-center text-sm">
          {state === 'Login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => setState(state === 'Login' ? 'Sign Up' : 'Login')}
          >
            {state === 'Login' ? 'Sign Up' : 'Login'}
          </span>
        </p>

        <img
          onClick={() => setshowLogin(false)}
          src={assets.cross_icon}
          className="absolute top-5 right-5 cursor-pointer w-4 h-4"
          alt="Close"
        />
      </motion.form>
    </div>
  );
};

export default Login;
