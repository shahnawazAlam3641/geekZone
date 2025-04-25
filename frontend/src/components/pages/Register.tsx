import axios, { AxiosError } from "axios";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { FieldValues, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { BASE_URL } from "../../utils/constants";
import { setUser, setLoading, setError } from "../../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../../store";

const Register = () => {
  const { register, handleSubmit } = useForm();

  const { error, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const registerUser = async (data: FieldValues) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await axios.post(BASE_URL + "/auth/register", data, {
        withCredentials: true,
      });

      dispatch(setUser(response.data.user));

      navigate("/feed");
    } catch (err) {
      setLoading(false);

      const error = err as AxiosError<{
        success: boolean;
        message: string;
        errors?: { path: string; message: string }[];
      }>;
      dispatch(
        setError(
          error?.response?.data?.message ||
            "An error occurred during registration"
        )
      );
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-background-lighter p-8 rounded-2xl shadow-xl border border-gray-800">
          <div className="flex justify-center mb-8">
            <UserPlus className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-8">
            Create Account
          </h1>

          <form
            onSubmit={handleSubmit((data) => {
              registerUser(data);
              console.log(data);
            })}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register("username")}
                  type="text"
                  className="w-full bg-background border border-gray-700 rounded-lg py-3 px-12 focus:outline-none focus:border-primary transition-colors"
                  placeholder="johndoe"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register("email")}
                  type="email"
                  className="w-full bg-background border border-gray-700 rounded-lg py-3 px-12 focus:outline-none focus:border-primary transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register("password")}
                  type="password"
                  className="w-full bg-background border border-gray-700 rounded-lg py-3 px-12 focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full hover:cursor-pointer bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg py-3 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Create Account
                  <UserPlus className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-center text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
