import { logoutUser } from '../services/api';

/**
 * Logout user - Clear all authentication data and session storage
 */
export const handleLogout = async () => {
  // ✅ Step 1: Call backend logout API to clear server-side session
  try {
    const result = await logoutUser();
    if (result.success) {
      console.log('✅ Server-side logout successful');
    } else {
      console.warn('⚠️ Server logout failed, continuing with client cleanup');
    }
  } catch (error) {
    console.warn('⚠️ Backend logout error, continuing with client cleanup:', error);
  }
  
  // ✅ Step 2: Clear localStorage - Authentication
  localStorage.removeItem('authToken');
  localStorage.removeItem('token_type');
  localStorage.removeItem('userData');
  localStorage.removeItem('registeredUserId');
  localStorage.removeItem('pendingPayment');
  localStorage.removeItem('paymentSuccess');
  
  // ✅ Step 3: Clear localStorage - Razorpay payment data
  localStorage.removeItem('rzp_checkout_anon_id');
  localStorage.removeItem('rzp_device_id');
  localStorage.removeItem('rzp_stored_checkout_id');
  
  // ✅ Step 4: Clear sessionStorage - Form data
  sessionStorage.removeItem('step1Data');
  sessionStorage.removeItem('step3Data');
  sessionStorage.removeItem('step4Data');
  
  // ✅ Step 5: Clear all localStorage items starting with 'rzp_' (Razorpay prefix)
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('rzp_') || key.startsWith('__razorpay')) {
      localStorage.removeItem(key);
    }
  });
  
  // ✅ Step 6: Clear ALL cookies (including samadhantra-session, XSRF-TOKEN)
  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear for current path
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      
      // Clear for current domain
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      
      // Clear for parent domain
      const domain = window.location.hostname.split('.').slice(-2).join('.');
      if (domain !== window.location.hostname) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${domain}`;
      }
      
      // Clear for localhost (specific case)
      if (window.location.hostname === 'localhost') {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
      }
    }
  };
  
  clearAllCookies();
  
  // ✅ Step 7: Clear IndexedDB (if any)
  if (window.indexedDB && window.indexedDB.databases) {
    window.indexedDB.databases().then(databases => {
      databases.forEach(db => {
        window.indexedDB.deleteDatabase(db.name);
        console.log(`🗑️ Deleted IndexedDB: ${db.name}`);
      });
    }).catch(err => {
      console.warn('⚠️ IndexedDB cleanup error:', err);
    });
  }
  
  console.log("✅ Complete logout - All data, cookies & sessions cleared");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};