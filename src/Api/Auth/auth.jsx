// lib/api.js
export const loginUser = async ({ email, password }) => {
  try {
    const res = await fetch("https://api.revupbikes.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Login failed");
    }

    return await res.json(); // return API response
  } catch (error) {
    console.error("Error in loginUser:", error.message);
    throw error;
  }
};

export const registerUser = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
  profilePicture,
}) => {
  try {
    const res = await fetch("https://api.revupbikes.com/api/auth/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        profilePicture,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Login failed");
    }

    return await res.json(); // return API response
  } catch (error) {
    console.error("Error in loginUser:", error.message);
    throw error;
  }
};
