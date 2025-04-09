import React, { useContext } from 'react';
import { assets, plans } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const BuyCredit = () => {
  const { user, backendUrl, token, setShowLogin, loadCreditData } = useContext(AppContext);
  const navigate = useNavigate();

  const initPay = async (order) => {
    if (!order?.id) {
      toast.error("Invalid Razorpay order. Please try again.");
      console.error("Invalid order object:", order);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Should be rzp_test_... for test mode
      amount: order.amount,
      currency: order.currency,
      name: 'Imagify - Credits Payment',
      description: 'Buy AI Credits',
      order_id: order.id,
      handler: async function (response) {
        console.log('✅ Razorpay Payment response:', response);

        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verify-razor`,
            response,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (data.success) {
            loadCreditData?.();
            toast.success("Payment verified & credits added!");
            navigate('/');
          } else {
            toast.error("Payment verification failed.");
          }
        } catch (error) {
          console.error("❌ Verification error:", error);
          toast.error(error?.response?.data?.message || "Verification failed.");
        }
      },
      prefill: {
        name: user?.name || 'Imagify User',
        email: user?.email || 'user@example.com',
      },
      theme: {
        color: "#121212",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const paymentRazorpay = async (planId) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/pay-razor`,
        { planId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("✅ Razorpay Order Data:", data);

      if (data.success && data.order?.id) {
        initPay(data.order);
      } else {
        toast.error("Failed to initiate payment.");
        console.error("Order missing or failed:", data);
      }

    } catch (error) {
      console.error("❌ Payment Error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className='min-h-[80vh] text-center pt-14 mb-10'
    >
      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>Our Plans</button>
      <h1 className='text-center text-3xl font-medium mb-6 sm:mb-10'>Choose the plan</h1>

      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {plans.map((item, index) => (
          <div
            key={index}
            className='bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-600 
                       hover:scale-105 transition-all duration-500'
          >
            <img src={assets.logo_icon} alt="Plan Icon" />
            <p className='mt-3 mb-1 font-semibold'>{item.id}</p>
            <p className='text-sm'>{item.desc}</p>
            <p className='mt-6'>
              <span className='text-3xl font-medium'>₹{item.price}</span> / {item.credits} credits
            </p>
            <button
              onClick={() => paymentRazorpay(item.id)}
              className='w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52'>
              {user ? 'Purchase' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredit;
