import axios, { AxiosError } from "axios";
import { Lock, LogIn, Mail } from "lucide-react";
import { motion } from "motion/react";
import { FieldValues, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { BASE_URL } from "../../utils/constants";
import { setUser, setLoading, setError } from "../../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { useLocation } from "react-router";

const Login = () => {
  const { loading, error } = useAppSelector((state) => state.auth);

  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/feed"; // Default to /feed if no redirect path

  const dispatch = useAppDispatch();

  const loginUser = async (data: FieldValues) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await axios.post(BASE_URL + "/auth/login", data, {
        withCredentials: true,
      });

      dispatch(setUser(response.data.user));
      navigate(from);

      console.log(response);
    } catch (err) {
      const error = err as AxiosError<{
        message: string;
        success: boolean;
        errors?: { path: string; message: string }[];
      }>;
      dispatch(
        setError(
          error?.response?.data?.message || "An error occurred during sign in"
        )
      );
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* <Link to={"/main"}>navigate</Link> */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-background-lighter p-8 rounded-2xl shadow-xl border border-gray-800">
          <div className="flex justify-center mb-8">
            <LogIn className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-8">Welcome Back</h1>

          <form
            onSubmit={handleSubmit((data) => {
              loginUser(data);
            })}
            className="space-y-6"
          >
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
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg py-3 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Sign In
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-center text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
