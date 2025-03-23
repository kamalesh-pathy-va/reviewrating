"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";

const SignupPage = () => {
  const router = useRouter();
  const signupMutation = trpc.auth.signup.useMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      await signupMutation.mutateAsync(formData);
      router.push("/auth/login"); // Redirect to login after successful signup
    } catch (err) {
      if (err instanceof TRPCClientError) {
        // Extract Zod validation errors
        try {
          const parsedError = JSON.parse(err.message);
          if (Array.isArray(parsedError)) {
            setErrors(parsedError.map((error) => error.message));
          } else {
            setErrors([err.message]);
          }
        } catch {
          setErrors([err.message]);
        }
      } else {
        setErrors(["Signup failed. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-emerald-50 h-3/4">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-xl"
            />
          </div>
          {errors.length > 0 && (
          <div className="bg-red-100 text-rose-700 p-2 mt-2 rounded-xl">
            {errors.map((err, index) => (
              <p key={index}>{err}</p>
            ))}
          </div>
        )}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-800 text-white p-2 rounded-full"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Already have an account? <a href="/auth/login" className="text-blue-500">Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
