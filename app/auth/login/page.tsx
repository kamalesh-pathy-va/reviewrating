"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { TRPCClientError } from "@trpc/client";

const LoginPage = () => {
  const router = useRouter();
  const loginMutation = trpc.auth.signin.useMutation();

  const [formData, setFormData] = useState({
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
      const { token, user } = await loginMutation.mutateAsync(formData);    
      document.cookie = `authToken=${token}; path=/`;
      document.cookie = `user=${JSON.stringify(user)}; path=/`;

      router.push("/profile");
    } catch (err) {
      if (err instanceof TRPCClientError) {
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
        setErrors(["Login failed. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-emerald-50 h-3/4">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Don&apos;t have an account? <a href="/auth/signup" className="text-blue-500">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
