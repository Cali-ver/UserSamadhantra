import apiClient from '@/lib/axios';

// ==================== PRICE & IMAGE MAPPINGS ====================
export const priceMapping = {
  student: 1000,
  freelancer: 5000,
  educational_institute: 10000,
  startup_msme: 10000,
  incubation_centre: 10000,
  service_product_provider: 25000,
  industry: 25000,
  investor: 25000,
};

export const imageMapping = {
  student: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=200&fit=crop",
  freelancer: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop",
  educational_institute: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop",
  startup_msme: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
  incubation_centre: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
  service_product_provider: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
  industry: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=200&fit=crop",
  investor: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop",
};

export const descriptionMapping = {
  student: "Perfect for students looking to enhance their skills and network with industry professionals.",
  freelancer: "Ideal for independent professionals seeking collaboration and growth opportunities.",
  educational_institute: "For schools and colleges looking to connect with industry and enhance student outcomes.",
  startup_msme: "For emerging businesses seeking resources, mentorship, and market access.",
  incubation_centre: "For incubators and accelerators looking to expand their network and resources.",
  service_product_provider: "For businesses offering products and services to the innovation ecosystem.",
  industry: "For established companies seeking innovation partnerships and talent access.",
  investor: "For investors looking to discover and fund promising startups and ventures.",
};

// ==================== SCHEMA ENDPOINTS ====================

/**
 * Get common schema fields
 */
export const getCommonSchema = async () => {
  try {
    const response = await apiClient.get('/schema/common');
    return response.data;
  } catch (error) {
    console.error("❌ Common schema error:", error);
    throw error;
  }
};

/**
 * Get available user types
 */
export const getUserTypes = async () => {
  try {
    const response = await apiClient.get('/schema/user-types');
    return response.data;
  } catch (error) {
    console.error("❌ User types error:", error);
    throw error;
  }
};

/**
 * Get schema for specific user type
 */
export const getUserTypeSchema = async (userType) => {
  try {
    const response = await apiClient.get(`/schema/user-type/${userType}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Schema error for ${userType}:`, error);
    throw error;
  }
};

// ==================== AUTHENTICATION ENDPOINTS ====================

/**
 * Register new user
 */
export const registerUser = async (data) => {
  try {
    console.log("📤 Registering user:", data.email);
    const response = await apiClient.post('/register', data);
    console.log("✅ Registration successful");
    return response.data;
  } catch (error) {
    console.error("❌ Registration error:", error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  try {
    console.log("🔐 Logging in user:", credentials.email);
    const response = await apiClient.post('/auth/login', credentials);
    console.log("✅ Login successful");
    return response.data;
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
};



/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/auth/logout');
    console.log('✅ Backend logout successful');
    return { success: true, message: response.data.message };
  } catch (error) {
    console.error('❌ Logout API error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Fetch current user profile
 */
export const fetchUserProfile = async () => {
  try {
    console.log("👤 Fetching user profile...");
    const response = await apiClient.get('/users/me');
    console.log("✅ User profile fetched", response.data);
  const userData = JSON.parse(localStorage.getItem("userData"));
console.log("👤 User Data:", userData);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    throw error;
  }
};


export const updateUserProfile = async (formData) => {
  try {
    console.log("✏️ Updating user profile...");
    const response = await apiClient.patch("/users/me", {
      about_yourself: formData.about_yourself,
      describe_your_need: formData.describe_your_need,
    });
    console.log("✅ Profile updated successfully");
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ Profile update error:", error);
    // Optional: meaningful error throw karo
    throw error.response?.data?.message || "Profile update failed";
  }
};


export const updateUserProfilePhoto = async (file) => {
  try {
    console.log("📸 Uploading profile photo...");
    const formData = new FormData();
    formData.append("profile_photo", file); // 👈 must match backend field
    const response = await apiClient.patch(
      "/users/me/profile-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("✅ Profile photo updated successfully");
    // Backend returns full updated profile object
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ Profile photo update error:", error);
    throw (
      error.response?.data?.message ||
      error.message ||
      "Profile photo update failed"
    );
  }
};

// ==================== PAYMENT ENDPOINTS ====================

/**
 * Create payment order
 */
export const createPaymentOrder = async (paymentData) => {
  try {
    console.log("💳 Creating payment order:", paymentData);
    
    const requestBody = {
      user_id: paymentData.user_id,
      user_type: paymentData.user_type,
      payment_type: "subscription",
      amount_inr: paymentData.amount,
      currency: paymentData.currency || "INR",
      receipt: paymentData.receipt
    };
    
    const response = await apiClient.post('/payment/order', requestBody);
    console.log("✅ Payment order created");
    
    const orderData = response.data.data || response.data;
    
    // Return in Razorpay format
    return {
      id: orderData.order_id,
      order_id: orderData.order_id,
      amount: orderData.amount,
      currency: orderData.currency,
      key_id: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
      receipt: orderData.receipt,
      payment_type: orderData.payment_type,
      user_type: orderData.user_type
    };
  } catch (error) {
    console.error("❌ Payment order error:", error);
    throw error;
  }
};

/**
 * Verify payment
 */
export const verifyPayment = async (verificationData) => {
  try {
    console.log("🔍 Verifying payment:", verificationData.razorpay_order_id);
    
    const response = await apiClient.post('/payment/verify', verificationData);
    console.log("✅ Payment verified");
    
    const verificationResult = response.data.data || response.data;
    
    return {
      verified: verificationResult.verified !== false,
      ...verificationResult
    };
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    throw error;
  }
};

// ==================== REQUIREMENTS ENDPOINTS ====================

/**
 * Create requirement
 */
// export const createRequirement = async (requirementData) => {
//   try {
//     console.log("📝 Creating requirement:", requirementData);
//     const response = await apiClient.post('/requirements', requirementData);
//     console.log("✅ Requirement created successfully");
//     return response.data;
//   } catch (error) {
//     console.error("❌ Create requirement error:", error);
//     throw error;
//   }
// };

export const createRequirement = async (payload) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("User not authenticated");
    }

    console.log("📤 Sending Requirement Payload:", payload);

    const response = await apiClient.post("/requirements", payload);

    return response.data;

  } catch (error) {
    console.error("❌ Create requirement error:", error.response?.data || error);
    throw error.response?.data?.message || "Requirement creation failed";
  }
};
/**
 * Get user's requirements
 */
export const getUserRequirements = async () => {
  try {
    const response = await apiClient.get('/users/me/requirements');
    return response.data;
  } catch (error) {
    console.error("❌ Get requirements error:", error);
    throw error;
  }
};

/**
 * Update requirement
 */
export const updateRequirement = async (requirementId, updateData) => {
  try {
    const response = await apiClient.put(`/requirements/${requirementId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("❌ Update requirement error:", error);
    throw error;
  }
};

/**
 * Delete requirement
 */
export const deleteRequirement = async (requirementId) => {
  try {
    const response = await apiClient.delete(`/requirements/${requirementId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Delete requirement error:", error);
    throw error;
  }
};


/**
 * Get Active Announcements
 */
export const getActiveAnnouncements = async () => {
  try {
    const response = await apiClient.get(
      "/requirements/announcements/active"
    );
    return response.data;
  } catch (error) {
    console.error("❌ Fetch active announcements error:", error);
    throw error;
  }
};

// ==================== CHAT ENDPOINTS ====================

/**
 * Send chat message
 */
export const sendChatMessage = async (messageData) => {
  try {
    const response = await apiClient.post('/chat/messages', messageData);
    return response.data;
  } catch (error) {
    console.error("❌ Send message error:", error);
    throw error;
  }
};

/**
 * Get chat history
 */
export const getChatHistory = async (sessionId) => {
  try {
    const response = await apiClient.get(`/chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Get chat history error:", error);
    throw error;
  }
};

/**
 * Get user chat sessions
 */
export const getUserChatSessions = async (userId) => {
  try {
    const response = await apiClient.get(`/chat/sessions/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Get chat sessions error:", error);
    throw error;
  }
};

// ==================== FAQ ENDPOINTS ====================

/**
 * Get all FAQs
 */
export const getFAQs = async () => {
  try {
    const response = await apiClient.get('/faq');
    return response.data;
  } catch (error) {
    console.error("❌ Get FAQs error:", error);
    throw error;
  }
};

/**
 * Search FAQs
 */
export const searchFAQs = async (query) => {
  try {
    const response = await apiClient.post('/faq/search', { query });
    return response.data;
  } catch (error) {
    console.error("❌ Search FAQs error:", error);
    throw error;
  }
};