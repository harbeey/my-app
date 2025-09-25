// src/services/authService.ts

export const loginUser = async (credentials: any) => {
  const res = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(
      data?.error || "We couldn't log you in. Please check your credentials."
    );
  }
  return data;
};

export const registerUser = async (registrationData: any) => {
  const res = await fetch("http://localhost:3001/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registrationData),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(data?.error || "Registration failed. Please try again.");
  }
  return data;
};

export const requestPasswordReset = async (email: string) => {
  const res = await fetch(
    "http://localhost:3001/api/auth/request-password-reset",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  // For security, don't reveal if the email exists or not.
  // The backend should always return a success-like response.
  if (!res.ok) {
    // We can log the actual error for debugging but return a generic message.
    console.error(
      "Password reset request failed:",
      await res.text().catch(() => "No response body")
    );
    throw new Error(
      "There was a problem sending the reset email. Please try again later."
    );
  }

  return await res.json();
};
